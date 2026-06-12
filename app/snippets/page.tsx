"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import SnippetsPageSkeleton from "./_components/SnippetsPageSkeleton";
import SnippetCard from "./_components/SnippetCard";
import { Search, Grid, List, Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LANGUAGE_CONFIG } from "../(root)/_constants";
import Image from "next/image";

export default function SnippetsPage() {
  const snippets = useQuery(api.snippets.getSnippets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // loading state
  if (snippets === undefined) {
    return <SnippetsPageSkeleton />;
  }

  // extract unique languages from config
  const languages = Object.keys(LANGUAGE_CONFIG);

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 z-10">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-12">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Editor
          </a>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Community Hub
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-400 via-blue-200 to-purple-400 text-transparent bg-clip-text tracking-tight">
            CodeCraft Snippets
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Explore, share, and learn from code snippets curated by developers worldwide.
          </p>
        </div>

        {/* Search & Filters Container */}
        <div className="max-w-5xl mx-auto mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#313244]/80 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 focus-within:border-blue-500/50">
              <div className="pl-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, language, or username..."
                className="w-full bg-transparent px-4 py-4 text-white placeholder-gray-500 outline-none text-sm font-sans"
              />
            </div>
          </div>

          {/* Language filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setSelectedLanguage(null)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border cursor-pointer ${
                selectedLanguage === null
                  ? "bg-blue-500/15 border-blue-500/50 text-blue-400 shadow-md"
                  : "bg-[#1e1e2e]/60 border-[#313244] text-gray-400 hover:border-gray-500 hover:text-white"
              }`}
            >
              All Languages
            </button>
            {languages.map((langKey) => {
              const lang = LANGUAGE_CONFIG[langKey];
              const isSelected = selectedLanguage === langKey;
              return (
                <button
                  key={langKey}
                  onClick={() => setSelectedLanguage(isSelected ? null : langKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-300 border cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/15 border-blue-500/50 text-blue-400 shadow-md"
                      : "bg-[#1e1e2e]/60 border-[#313244] text-gray-400 hover:border-gray-500 hover:text-white"
                  }`}
                >
                  <Image src={lang.logoPath} alt={lang.label} width={16} height={16} className="object-contain" />
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Snippets Grid */}
        <AnimatePresence mode="popLayout">
          {filteredSnippets.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSnippets.map((snippet) => (
                <motion.div
                  key={snippet._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <SnippetCard snippet={snippet} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-[#1e1e2e]/30 border border-[#313244]/40 rounded-2xl max-w-lg mx-auto"
            >
              <p className="text-gray-400 font-medium">No snippets found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
