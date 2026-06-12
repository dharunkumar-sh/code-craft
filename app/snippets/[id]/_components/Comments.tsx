import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import { MessageSquare } from "lucide-react";

const Comments = ({ snippetId }: { snippetId: Id<"snippets"> }) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const comments = useQuery(api.snippets.getComments, { snippetId }) || [];
  const addComment = useMutation(api.snippets.addComment);
  const deleteComment = useMutation(api.snippets.deleteComment);

  const handleSubmitComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      await addComment({ snippetId, content });
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"snippetComments">) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="bg-[#12121a]/90 backdrop-blur-md rounded-2xl border border-[#ffffff0a] p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-2 mb-6 border-b border-[#ffffff0a] pb-4">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">
          Discussion ({comments.length})
        </h2>
      </div>

      {user ? (
        <CommentForm onSubmit={handleSubmitComment} isSubmitting={isSubmitting} />
      ) : (
        <div className="bg-[#0a0a0f] border border-[#ffffff0a] rounded-xl p-6 text-center mb-8">
          <p className="text-gray-400 mb-4 text-sm">Sign in to join the discussion and share your thoughts.</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            currentUserId={user?.id}
            isDeleting={deletingCommentId === comment._id}
            onDelete={handleDeleteComment}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">
            No comments yet. Be the first to start the discussion!
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments;
