import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface Match {
  id: string;
  recruiter_id: string;
  job_seeker_id: string;
  created_at: string;
  otherUserEmail?: string;
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
        // Fetch other user's email for each match
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

            return {
              ...match,
              otherUserEmail: profileData?.email || "Unknown User",
            };
          })
        );
        setMatches(matchesWithEmails);
      }
    };

    initMatches();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-6 border-b border-border flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Your Matches</h1>
      </header>

      <main className="px-4 py-6">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/chat/${match.id}`)}
              >
                <div>
                  <h3 className="font-semibold text-foreground">
                    {match.otherUserEmail}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Matched on{" "}
                    {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="icon" variant="ghost">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Matches;
