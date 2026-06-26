"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SyncUser() {
  const { user, isLoaded } = useUser();
  const syncUserMutation = useMutation(api.users.syncUser);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    // Sync if user is loaded, logged in, and we haven't synced this user session yet
    if (isLoaded && user && syncedRef.current !== user.id) {
      const email = user.primaryEmailAddress?.emailAddress || "";
      const name = user.fullName || email.split("@")[0] || "Anonymous";

      syncedRef.current = user.id;

      syncUserMutation({
        userId: user.id,
        email,
        name,
      }).catch((err) => {
        console.error("Error syncing user on client:", err);
        // Reset ref on failure so we can try again
        syncedRef.current = null;
      });
    }
  }, [isLoaded, user, syncUserMutation]);

  return null;
}
