"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const StarButton = ({ snippetId }: { snippetId: Id<"snippets"> }) => {
  const { user } = useUser();
  const isStarred = useQuery(api.snippets.isSnippetStarred, { snippetId });
  const starCount = useQuery(api.snippets.getSnippetStarCount, { snippetId });
  const toggleStar = useMutation(api.snippets.starSnippet);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("You must be signed in to star snippets");
      return;
    }

    setIsUpdating(true);
    try {
      await toggleStar({ snippetId });
      if (isStarred) {
        toast.success("Snippet removed from favorites");
      } else {
        toast.success("Snippet added to favorites");
      }
    } catch (error) {
      console.error("Error starring snippet:", error);
      toast.error("Failed to star snippet");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleStar}
      disabled={isUpdating}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
        ${
          isStarred
            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
        }
      `}
    >
      <Star
        className={`size-4 transition-all duration-200 ${
          isStarred
            ? "fill-amber-400 text-amber-400 group-hover:scale-110"
            : "text-gray-400 group-hover:text-amber-400 group-hover:scale-110"
        }`}
      />
      <span className="text-xs font-medium min-w-3 text-center">
        {starCount ?? 0}
      </span>
    </button>
  );
};

export default StarButton;
