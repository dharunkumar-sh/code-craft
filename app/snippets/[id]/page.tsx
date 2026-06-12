"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";
import CodeBlock from "./_components/CodeBlock";
import Comments from "./_components/Comments";
import StarButton from "../_components/StarButton";
import { ArrowLeft, Clock, MessageSquare, User, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SnippetDetailPage() {
  const params = useParams();
  const snippetId = params.id as Id<"snippets">;

  const snippet = useQuery(api.snippets.getSnippetById, { snippetId });

  if (snippet === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading snippet details...</p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-[#1e1e2e]/50 border border-[#313244] rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl text-red-400">⚠️</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-white">Snippet Not Found</h1>
            <p className="text-gray-400 text-sm">
              The snippet you are looking for might have been deleted or the URL is incorrect.
            </p>
          </div>
          <Link
            href="/snippets"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Snippets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 z-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/snippets"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Snippets
          </Link>
        </div>

        {/* Snippet Card */}
        <article className="bg-[#1e1e2e]/40 border border-[#313244]/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl mb-8">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Snippet Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#313244]/50">
              <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-[#0a0a0f]/60 border border-[#313244] shrink-0">
                  <Image
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    className="w-8 h-8 object-contain"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {snippet.userName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(snippet._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <StarButton snippetId={snippet._id} />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {snippet.language}
                </div>
              </div>
            </div>

            {/* Code Content */}
            <div className="rounded-xl overflow-hidden border border-[#313244]/60">
              <CodeBlock language={snippet.language} code={snippet.code} />
            </div>
          </div>
        </article>

        {/* Discussion / Comments Section */}
        <Comments snippetId={snippet._id} />
      </div>
    </div>
  );
}
