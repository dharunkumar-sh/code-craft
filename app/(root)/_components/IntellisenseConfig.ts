import { Monaco } from "@monaco-editor/react";

export const setupIntellisense = (monaco: typeof import("monaco-editor") | any) => {
  // Configure TypeScript/JavaScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ["node_modules/@types"],
  });

  // Helper to register keywords and snippets for a language
  const registerCompletions = (
    languageId: string,
    keywords: string[],
    snippets: { label: string; detail: string; insertText: string }[]
  ) => {
    monaco.languages.registerCompletionItemProvider(languageId, {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Keyword suggestions
          ...keywords.map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
          // Snippet suggestions
          ...snippets.map((snip) => ({
            label: snip.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: snip.detail,
            insertText: snip.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          })),
        ];

        return { suggestions };
      },
    });
  };

  // Define completions for Python
  registerCompletions(
    "python",
    [
      "def", "class", "import", "from", "if", "elif", "else", "while", "for", "in",
      "try", "except", "finally", "with", "as", "lambda", "return", "yield", "global",
      "nonlocal", "True", "False", "None", "print", "len", "range", "list", "dict", "set"
    ],
    [
      {
        label: "def",
        detail: "Define function",
        insertText: "def ${1:function_name}(${2:args}):\n\t${3:pass}",
      },
      {
        label: "class",
        detail: "Define class",
        insertText: "class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}",
      },
      {
        label: "for",
        detail: "For loop",
        insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
      },
      {
        label: "if",
        detail: "If condition",
        insertText: "if ${1:condition}:\n\t${2:pass}",
      },
      {
        label: "try",
        detail: "Try except block",
        insertText: "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}",
      },
      {
        label: "print",
        detail: "Print statement",
        insertText: "print(${1:message})",
      }
    ]
  );

  // Define completions for Java
  registerCompletions(
    "java",
    [
      "public", "private", "protected", "class", "interface", "extends", "implements",
      "static", "final", "void", "int", "double", "float", "boolean", "char", "String",
      "new", "return", "if", "else", "for", "while", "do", "switch", "case", "default",
      "break", "continue", "try", "catch", "finally", "throw", "throws", "import", "package"
    ],
    [
      {
        label: "psvm",
        detail: "public static void main",
        insertText: "public static void main(String[] args) {\n\t$0\n}",
      },
      {
        label: "sout",
        detail: "System.out.println",
        insertText: "System.out.println($0);",
      },
      {
        label: "fori",
        detail: "Indexed for loop",
        insertText: "for (int i = 0; i < ${1:max}; i++) {\n\t$0\n}",
      },
      {
        label: "class",
        detail: "Class declaration",
        insertText: "public class ${1:ClassName} {\n\t$0\n}",
      }
    ]
  );

  // Define completions for Go
  registerCompletions(
    "go",
    [
      "package", "import", "func", "var", "const", "struct", "interface", "map", "chan",
      "go", "select", "defer", "return", "if", "else", "for", "range", "switch", "case",
      "default", "break", "continue", "fallthrough", "type", "nil", "true", "false"
    ],
    [
      {
        label: "main",
        detail: "Package main and main function",
        insertText: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\t$0\n}",
      },
      {
        label: "func",
        detail: "Function declaration",
        insertText: "func ${1:name}(${2:params}) ${3:result} {\n\t$0\n}",
      },
      {
        label: "fp",
        detail: "fmt.Println",
        insertText: "fmt.Println($0)",
      },
      {
        label: "ff",
        detail: "fmt.Printf",
        insertText: "fmt.Printf(\"${1:%s}\\n\", ${2:args})",
      },
      {
        label: "forr",
        detail: "For range loop",
        insertText: "for ${1:index}, ${2:value} := range ${3:slice} {\n\t$0\n}",
      }
    ]
  );

  // Define completions for Rust
  registerCompletions(
    "rust",
    [
      "fn", "let", "mut", "const", "static", "struct", "enum", "impl", "trait", "use",
      "pub", "mod", "as", "match", "if", "else", "loop", "while", "for", "in", "return",
      "break", "continue", "unsafe", "self", "Self", "true", "false"
    ],
    [
      {
        label: "fn",
        detail: "Function declaration",
        insertText: "fn ${1:name}(${2:params}) -> ${3:Type} {\n\t$0\n}",
      },
      {
        label: "println",
        detail: "println! macro",
        insertText: "println!(\"${1:{:?}}\", ${2:val});",
      },
      {
        label: "struct",
        detail: "Struct definition",
        insertText: "struct ${1:Name} {\n\t${2:field}: ${3:Type},\n}",
      },
      {
        label: "impl",
        detail: "Implementation block",
        insertText: "impl ${1:Name} {\n\t$0\n}",
      }
    ]
  );

  // Define completions for C++
  registerCompletions(
    "cpp",
    [
      "include", "define", "int", "float", "double", "char", "bool", "void", "class",
      "struct", "public", "private", "protected", "using", "namespace", "std", "cout",
      "cin", "endl", "return", "if", "else", "for", "while", "switch", "case", "default",
      "break", "continue", "new", "delete", "true", "false", "vector", "string", "map"
    ],
    [
      {
        label: "main",
        detail: "main function template",
        insertText: "#include <iostream>\n\nint main() {\n\t$0\n\treturn 0;\n}",
      },
      {
        label: "cout",
        detail: "std::cout",
        insertText: "std::cout << ${1:value} << std::endl;",
      },
      {
        label: "fori",
        detail: "standard for loop",
        insertText: "for (int i = 0; i < ${1:max}; i++) {\n\t$0\n}",
      },
      {
        label: "vector",
        detail: "std::vector declaration",
        insertText: "std::vector<${1:type}> ${2:name};",
      }
    ]
  );

  // Define completions for C#
  registerCompletions(
    "csharp",
    [
      "using", "namespace", "class", "struct", "interface", "public", "private", "protected",
      "internal", "static", "void", "int", "double", "float", "bool", "string", "char", "new",
      "return", "if", "else", "for", "foreach", "while", "switch", "case", "default", "break",
      "continue", "null", "true", "false", "Console", "WriteLine"
    ],
    [
      {
        label: "cw",
        detail: "Console.WriteLine",
        insertText: "Console.WriteLine($0);",
      },
      {
        label: "class",
        detail: "Class definition",
        insertText: "public class ${1:ClassName}\n{\n\t$0\n}",
      },
      {
        label: "fori",
        detail: "Indexed for loop",
        insertText: "for (int i = 0; i < ${1:max}; i++)\n{\n\t$0\n}",
      }
    ]
  );

  // Define completions for Ruby
  registerCompletions(
    "ruby",
    [
      "def", "class", "module", "end", "if", "elsif", "else", "unless", "while", "until",
      "for", "in", "break", "next", "redo", "retry", "return", "yield", "super", "self",
      "nil", "true", "false", "puts", "require", "attr_reader", "attr_writer", "attr_accessor"
    ],
    [
      {
        label: "def",
        detail: "Method definition",
        insertText: "def ${1:method_name}(${2:args})\n\t$0\nend",
      },
      {
        label: "class",
        detail: "Class definition",
        insertText: "class ${1:ClassName}\n\t$0\nend",
      },
      {
        label: "each",
        detail: "Each iterator",
        insertText: "each { |${1:x}| $0 }",
      }
    ]
  );

  // Define completions for Swift
  registerCompletions(
    "swift",
    [
      "func", "let", "var", "const", "class", "struct", "enum", "protocol", "extension",
      "import", "public", "private", "fileprivate", "internal", "if", "else", "switch",
      "case", "default", "for", "in", "while", "repeat", "return", "break", "continue",
      "nil", "true", "false", "print", "self"
    ],
    [
      {
        label: "func",
        detail: "Function declaration",
        insertText: "func ${1:name}(${2:params}) -> ${3:ReturnType} {\n\t$0\n}",
      },
      {
        label: "print",
        detail: "Print to console",
        insertText: "print($0)",
      },
      {
        label: "struct",
        detail: "Struct declaration",
        insertText: "struct ${1:Name} {\n\t$0\n}",
      }
    ]
  );
};
