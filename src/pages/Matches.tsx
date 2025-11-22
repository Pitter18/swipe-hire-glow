import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface Match {
  id: string;
  recruiter_id: string;
  job_seeker_id: string;
  created_at: string;
  otherUserEmail?: string;
  unreadCount?: number;
}

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const initMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Fetch matches
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .or(`recruiter_id.eq.${user.id},job_seeker_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (matchesData) {
        // Fetch other user's email and unread count for each match
        const matchesWithEmails = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId =
              match.recruiter_id === user.id
                ? match.job_seeker_id
                : match.recruiter_id;
            
            const { data: profileData } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", otherUserId)
              .single();

            // Get unread message count for this match
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("match_id", match.id)
              .eq("read", false)
              .neq("sender_id", user.id);

            return {
              ...match,
              otherUserEmail: profileData?.email || "Unknown User",
              unreadCount: unreadCount || 0,
            };
          })
        );
        setMatches(matchesWithEmails);
      }
    };

    initMatches();

    // Subscribe to message changes to update unread counts in real-time
    const channel = supabase
      .channel("matches-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          initMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-3 md:px-6 py-4 md:py-6 border-b border-border flex items-center gap-3 md:gap-4 sticky top-0 backdrop-blur-sm bg-background/95 z-40">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 md:h-10 md:w-10">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <h1 className="text-lg md:text-2xl font-bold text-foreground">Your Matches</h1>
      </header>

      <main className="px-3 md:px-4 py-4 md:py-6">
        {matches.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base text-muted-foreground">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 max-w-2xl mx-auto">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-3 md:p-4 flex items-center justify-between hover:shadow-lg transition-smooth cursor-pointer active:scale-98"
                onClick={() => navigate(`/chat/${match.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                    {match.otherUserEmail}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {match.unreadCount && match.unreadCount > 0 ? (
                      <span className="text-primary font-medium">
                        {match.unreadCount} new {match.unreadCount === 1 ? "message" : "messages"}
                      </span>
                    ) : (
                      <>
                        Matched on{" "}
                        {new Date(match.created_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <div className="relative ml-2 flex-shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 md:h-10 md:w-10">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </Button>
                  {match.unreadCount && match.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 min-w-4 md:h-5 md:min-w-5 flex items-center justify-center p-1 text-[10px] md:text-xs"
                    >
                      {match.unreadCount}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
