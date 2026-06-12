import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────
// PROVIDER 1: Paiza.IO  – 10/10 languages, ~1-3s avg, no key needed
// PROVIDER 2: Wandbox   – fast, no key, used as fallback for supported langs
// PROVIDER 3: Piston    – self-hosted only (set PISTON_URL env variable)
// ──────────────────────────────────────────────────────────────

// --- Paiza.IO language map ---
const PAIZA_LANGUAGES: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python:     "python3",
  java:       "java",
  go:         "go",
  rust:       "rust",
  cpp:        "cpp",
  csharp:     "csharp",
  ruby:       "ruby",
  swift:      "swift",
};

// --- Wandbox compiler map ---
const WANDBOX_COMPILERS: Record<string, string> = {
  javascript: "nodejs-20.17.0",
  typescript: "typescript-5.6.2",
  python:     "cpython-3.12.7",
  java:       "openjdk-jdk-22+36",
  go:         "go-1.23.2",
  rust:       "rust-1.82.0",
  cpp:        "gcc-13.2.0",
  csharp:     "dotnetcore-8.0.402",
  ruby:       "ruby-3.4.9",
  swift:      "swift-6.0.1",
};

// --- Piston runtime map (for self-hosted) ---
const PISTON_RUNTIMES: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python:     { language: "python",     version: "3.10.0" },
  java:       { language: "java",       version: "15.0.2" },
  go:         { language: "go",         version: "1.16.2" },
  rust:       { language: "rust",       version: "1.68.2" },
  cpp:        { language: "cpp",        version: "10.2.0" },
  csharp:     { language: "csharp",     version: "6.12.0" },
  ruby:       { language: "ruby",       version: "3.0.1"  },
  swift:      { language: "swift",      version: "5.3.3"  },
};

// ──────────────────────────────────────────────────────────────
// Standard response shape (Piston-compatible)
// ──────────────────────────────────────────────────────────────
interface ExecResult {
  compile: { code: number; output: string; stderr: string } | null;
  run:     { code: number; output: string; stderr: string } | null;
}

// ──────────────────────────────────────────────────────────────
// PROVIDER 1 — Paiza.IO
// ──────────────────────────────────────────────────────────────
async function pollPaizaStatus(id: string, maxAttempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(
      `https://api.paiza.io/runners/get_status?id=${id}&api_key=guest`
    );
    if (!res.ok) throw new Error(`Paiza status error: ${res.status}`);
    const data = await res.json();
    if (data.status === "completed") return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Paiza.IO execution timed out after 30s");
}

async function runWithPaiza(language: string, code: string): Promise<ExecResult> {
  const paizaLang = PAIZA_LANGUAGES[language];
  if (!paizaLang) throw new Error(`Paiza.IO: unsupported language "${language}"`);

  console.log(`[Paiza.IO] Creating runner for ${language}…`);

  const createRes = await fetch("https://api.paiza.io/runners/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: code,
      language: paizaLang,
      api_key: "guest",
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Paiza.IO create failed: HTTP ${createRes.status}`);
  }

  const { id } = await createRes.json();
  if (!id) throw new Error("Paiza.IO returned no session ID");

  console.log(`[Paiza.IO] Runner ID: ${id} — polling…`);
  await pollPaizaStatus(id);

  const detailsRes = await fetch(
    `https://api.paiza.io/runners/get_details?id=${id}&api_key=guest`
  );
  if (!detailsRes.ok) throw new Error(`Paiza.IO details failed: HTTP ${detailsRes.status}`);

  const d = await detailsRes.json();
  console.log(`[Paiza.IO] Details:`, {
    build_result: d.build_result,
    build_exit_code: d.build_exit_code,
    exit_code: d.exit_code,
    stdout_length: d.stdout?.length,
  });

  // Paiza returns numbers as strings (e.g. "0"), so coerce before comparing
  const buildExitCode = d.build_exit_code != null ? Number(d.build_exit_code) : null;
  const exitCode = d.exit_code != null ? Number(d.exit_code) : 0;

  const isBuildError =
    d.build_result === "failure" ||
    d.build_result === "error" ||
    (buildExitCode !== null && buildExitCode !== 0);

  if (isBuildError) {
    return {
      compile: {
        code: d.build_exit_code ?? 1,
        output: d.build_stderr || d.build_stdout || "Compilation error",
        stderr: d.build_stderr || "Compilation error",
      },
      run: null,
    };
  }

  return {
    compile: null,
    run: {
      code: exitCode,
      output: d.stdout || "",
      stderr: d.stderr || "",
    },
  };
}

// ──────────────────────────────────────────────────────────────
// PROVIDER 2 — Wandbox (fallback)
// ──────────────────────────────────────────────────────────────
async function runWithWandbox(language: string, code: string): Promise<ExecResult> {
  const compiler = WANDBOX_COMPILERS[language];
  if (!compiler) throw new Error(`Wandbox: unsupported language "${language}"`);

  console.log(`[Wandbox] Compiling ${language} with compiler "${compiler}"…`);

  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compiler, code, save: false }),
  });

  if (!res.ok) throw new Error(`Wandbox HTTP error: ${res.status}`);

  const data = await res.json();
  console.log(`[Wandbox] Response: status=${data.status}`);

  // Wandbox uses program_message as combined stdout+stderr for some runtimes
  const stdout =
    data.program_output ||
    (data.program_message && !data.program_error ? data.program_message : "") ||
    "";
  const stderr = data.program_error || "";
  const compileError = data.compiler_error || data.compiler_message || "";

  if (compileError && data.status !== "0") {
    return {
      compile: {
        code: parseInt(data.status) || 1,
        output: compileError,
        stderr: compileError,
      },
      run: null,
    };
  }

  return {
    compile: null,
    run: {
      code: parseInt(data.status) || 0,
      output: stdout,
      stderr,
    },
  };
}

// ──────────────────────────────────────────────────────────────
// PROVIDER 3 — Self-Hosted Piston (optional)
// ──────────────────────────────────────────────────────────────
async function runWithPiston(
  language: string,
  code: string,
  pistonUrl: string
): Promise<ExecResult> {
  const runtime = PISTON_RUNTIMES[language];
  if (!runtime) throw new Error(`Piston: unsupported language "${language}"`);

  console.log(`[Piston] Running ${language} at ${pistonUrl}…`);

  const res = await fetch(`${pistonUrl}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ content: code }],
    }),
  });

  if (!res.ok) throw new Error(`Piston HTTP error: ${res.status}`);
  const data = await res.json();
  console.log(`[Piston] Run code: ${data.run?.code}`);

  if (data.compile && data.compile.code !== 0) {
    return {
      compile: {
        code: data.compile.code,
        output: data.compile.stderr || data.compile.output || "",
        stderr: data.compile.stderr || "",
      },
      run: null,
    };
  }

  return {
    compile: null,
    run: {
      code: data.run?.code ?? 0,
      output: data.run?.output || "",
      stderr: data.run?.stderr || "",
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Main route handler — tries providers in order with fallback
// ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { language, code } = await request.json();

    console.log(`\n[Execute API] Language: ${language}, Code length: ${code?.length ?? 0}`);

    if (!language || !code) {
      return NextResponse.json(
        { message: "Language and code are required" },
        { status: 400 }
      );
    }

    if (!PAIZA_LANGUAGES[language]) {
      return NextResponse.json(
        { message: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const pistonUrl = process.env.PISTON_URL?.trim();
    const providers: Array<{ name: string; fn: () => Promise<ExecResult> }> = [];

    // Priority 1: Self-hosted Piston (if configured)
    if (pistonUrl) {
      providers.push({
        name: "Piston (self-hosted)",
        fn: () => runWithPiston(language, code, pistonUrl),
      });
    }

    // Priority 2: Paiza.IO (most reliable — 10/10 languages, tested)
    providers.push({
      name: "Paiza.IO",
      fn: () => runWithPaiza(language, code),
    });

    // Priority 3: Wandbox (fallback)
    providers.push({
      name: "Wandbox",
      fn: () => runWithWandbox(language, code),
    });

    let lastError: string = "All providers failed";

    for (const provider of providers) {
      try {
        console.log(`[Execute API] Trying provider: ${provider.name}`);
        const result = await provider.fn();
        console.log(`[Execute API] ✅ Success via ${provider.name}`);
        return NextResponse.json(result);
      } catch (err: any) {
        console.warn(`[Execute API] ⚠️ Provider "${provider.name}" failed: ${err.message}`);
        lastError = err.message;
        // Continue to next provider
      }
    }

    // All providers exhausted
    return NextResponse.json({ message: lastError }, { status: 502 });

  } catch (error: any) {
    console.error("[Execute API] Unhandled exception:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
