import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SwipeCard, SwipeButtons } from "@/components/SwipeCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";
import { mockJobs, mockCandidates } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Briefcase, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast as sonnerToast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"seeker" | "recruiter">("seeker");
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has a role in the database
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user role:", error);
        sonnerToast.error("Failed to load user data");
        return;
      }

      // Check if there's a pending role from OAuth signup
      const pendingRole = localStorage.getItem("pendingUserRole");
      
      if (!userRoles && pendingRole) {
        // Create the role for the user
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({
            user_id: session.user.id,
            role: pendingRole as "job_seeker" | "recruiter",
          });

        if (insertError) {
          console.error("Error creating user role:", insertError);
          sonnerToast.error("Failed to set user role");
        } else {
          setMode(pendingRole === "job_seeker" ? "seeker" : "recruiter");
          localStorage.removeItem("pendingUserRole");
        }
      } else if (userRoles) {
        setMode(userRoles.role === "job_seeker" ? "seeker" : "recruiter");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSwipeLeft = () => {
    toast({
      title: "Passed",
      description: mode === "seeker" ? "Job skipped" : "Candidate skipped",
      variant: "destructive",
    });
    nextCard();
  };

  const handleSwipeRight = () => {
    toast({
      title: "It's a Match! ✨",
      description: mode === "seeker" ? "Job saved to your list" : "Candidate shortlisted",
    });
    nextCard();
  };

  const nextCard = () => {
    if (mode === "seeker") {
      setCurrentJobIndex((prev) => (prev + 1) % mockJobs.length);
    } else {
      setCurrentCandidateIndex((prev) => (prev + 1) % mockCandidates.length);
    }
  };

  const currentJob = mockJobs[currentJobIndex];
  const currentCandidate = mockCandidates[currentCandidateIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              JobSwipe
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {mode === "seeker" ? (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Job Seeker</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Recruiter</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu user={user} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {mode === "seeker"
                ? `${mockJobs.length - currentJobIndex} jobs remaining`
                : `${mockCandidates.length - currentCandidateIndex} candidates remaining`}
            </p>
          </div>

          <SwipeCard
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            key={mode === "seeker" ? currentJobIndex : currentCandidateIndex}
          >
            {mode === "seeker" ? (
              <JobCard {...currentJob} />
            ) : (
              <CandidateCard {...currentCandidate} />
            )}
          </SwipeCard>

          <SwipeButtons onReject={handleSwipeLeft} onAccept={handleSwipeRight} />

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Swipe right to match • Swipe left to pass
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
