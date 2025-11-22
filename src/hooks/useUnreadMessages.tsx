import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      // Get all matches for the user
      const { data: matches } = await supabase
        .from("matches")
        .select("id")
        .or(`recruiter_id.eq.${userId},job_seeker_id.eq.${userId}`);

      if (!matches || matches.length === 0) {
        setUnreadCount(0);
        return;
      }

      const matchIds = matches.map(m => m.id);

      // Count unread messages in all matches where user is not the sender
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("match_id", matchIds)
        .eq("read", false)
        .neq("sender_id", userId);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to message changes
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return unreadCount;
};
