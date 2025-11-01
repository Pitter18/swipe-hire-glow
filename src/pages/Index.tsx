import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SwipeCard, SwipeButtons } from "@/components/SwipeCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";
import { MatchNotification } from "@/components/MatchNotification";
import { mockJobs, mockCandidates } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Briefcase, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"job_seeker" | "recruiter" | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchData, setMatchData] = useState<{
    matchId: string;
    person: any;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        
        if (roleData) {
          setUserRole(roleData.role as "job_seeker" | "recruiter");
        }
      } else {
        navigate("/auth");
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        setTimeout(async () => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          
          if (roleData) {
            setUserRole(roleData.role as "job_seeker" | "recruiter");
          }
        }, 0);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleJobSwipeLeft = () => {
    toast({
      title: "Passed",
      description: "Job skipped",
      variant: "destructive",
    });
    setCurrentJobIndex((prev) => (prev + 1) % mockJobs.length);
  };

  const handleJobSwipeRight = async () => {
    // Create a match with a mock recruiter (in real app, this would be the job poster)
    if (user) {
      const { data, error } = await supabase
        .from("matches")
        .insert([{
          recruiter_id: String(mockJobs[currentJobIndex].id),
          job_seeker_id: user.id,
        }])
        .select()
        .single();

      if (!error && data) {
        const currentJob = mockJobs[currentJobIndex];
        setMatchData({
          matchId: data.id,
          person: {
            name: currentJob.company,
            title: currentJob.title,
            company: currentJob.company,
            skills: currentJob.skills,
          },
        });
        setShowMatchDialog(true);
      }
    }
    setCurrentJobIndex((prev) => (prev + 1) % mockJobs.length);
  };

  const handleCandidateSwipeLeft = () => {
    toast({
      title: "Passed",
      description: "Candidate skipped",
      variant: "destructive",
    });
    setCurrentCandidateIndex((prev) => (prev + 1) % mockCandidates.length);
  };

  const handleCandidateSwipeRight = async () => {
    // Create a match with the candidate
    if (user) {
      const { data, error } = await supabase
        .from("matches")
        .insert([{
          recruiter_id: user.id,
          job_seeker_id: String(mockCandidates[currentCandidateIndex].id),
        }])
        .select()
        .single();

      if (!error && data) {
        const currentCandidate = mockCandidates[currentCandidateIndex];
        setMatchData({
          matchId: data.id,
          person: {
            name: currentCandidate.name,
            title: currentCandidate.title,
            email: currentCandidate.email,
            skills: currentCandidate.skills,
          },
        });
        setShowMatchDialog(true);
      }
    }
    setCurrentCandidateIndex((prev) => (prev + 1) % mockCandidates.length);
  };

  const currentJob = mockJobs[currentJobIndex];
  const currentCandidate = mockCandidates[currentCandidateIndex];

  if (loading || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow mx-auto mb-4 animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isRecruiter = userRole === "recruiter";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {matchData && (
        <MatchNotification
          open={showMatchDialog}
          onOpenChange={setShowMatchDialog}
          matchedPerson={matchData.person}
          matchId={matchData.matchId}
        />
      )}
      
      <header className="px-6 py-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            JobSwipe
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/matches")}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Matches</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            {isRecruiter ? (
              <>
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Recruiter</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Job Seeker</span>
              </>
            )}
          </div>
          <ThemeToggle />
          <AccountMenu userEmail={user?.email} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {isRecruiter ? (
            <>
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Candidates</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockCandidates.length - currentCandidateIndex} candidates remaining
                </p>
              </div>

              <SwipeCard
                onSwipeLeft={handleCandidateSwipeLeft}
                onSwipeRight={handleCandidateSwipeRight}
                key={`candidate-${currentCandidateIndex}`}
              >
                <CandidateCard {...currentCandidate} />
              </SwipeCard>

              <SwipeButtons onReject={handleCandidateSwipeLeft} onAccept={handleCandidateSwipeRight} />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Swipe right to shortlist • Swipe left to pass
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Jobs for You</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockJobs.length - currentJobIndex} jobs remaining
                </p>
              </div>

              <SwipeCard
                onSwipeLeft={handleJobSwipeLeft}
                onSwipeRight={handleJobSwipeRight}
                key={`job-${currentJobIndex}`}
              >
                <JobCard {...currentJob} />
              </SwipeCard>

              <SwipeButtons onReject={handleJobSwipeLeft} onAccept={handleJobSwipeRight} />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Swipe right to match • Swipe left to pass
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
