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
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
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
          if (roleData.role === "recruiter") {
            loadCandidates();
          } else {
            loadJobs();
          }
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
            if (roleData.role === "recruiter") {
              loadCandidates();
            } else {
              loadJobs();
            }
          }
        }, 0);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Real-time profile sync
  useEffect(() => {
    if (!user || !userRole) return;

    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("Profile updated:", payload);
          if (userRole === "recruiter") {
            loadCandidates();
          } else {
            loadJobs();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  const loadCandidates = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*, user_roles!inner(role)")
        .eq("user_roles.role", "job_seeker")
        .not("id", "eq", user?.id);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        setCandidates(profiles);
      } else {
        setCandidates(mockCandidates);
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
      setCandidates(mockCandidates);
    }
  };

  const loadJobs = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*, user_roles!inner(role)")
        .eq("user_roles.role", "recruiter")
        .not("id", "eq", user?.id);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const formattedJobs = profiles.map((profile) => ({
          id: profile.id,
          title: profile.job_title || "Position Available",
          company: profile.company || "Company",
          companyLogo: profile.company_logo,
          location: profile.location || "Location not specified",
          salary: profile.salary_range || "Competitive",
          description: profile.bio || "No description available",
          skills: profile.skills || [],
          postedTime: new Date(profile.updated_at).toLocaleDateString(),
        }));
        setJobs(formattedJobs);
      } else {
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      setJobs(mockJobs);
    }
  };

  const handleJobSwipeLeft = () => {
    const jobsList = jobs.length > 0 ? jobs : mockJobs;
    toast({
      title: "Passed",
      description: "Job skipped",
      variant: "destructive",
    });
    setCurrentJobIndex((prev) => (prev + 1) % jobsList.length);
  };

  const handleJobSwipeRight = async () => {
    // Create a match with a recruiter
    const jobsList = jobs.length > 0 ? jobs : mockJobs;
    if (user) {
      const currentJob = jobsList[currentJobIndex];
      const recruiterId = currentJob.id || String(currentJob.id);
      
      const { data, error } = await supabase
        .from("matches")
        .insert([{
          recruiter_id: recruiterId,
          job_seeker_id: user.id,
        }])
        .select()
        .single();

      if (!error && data) {
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
    setCurrentJobIndex((prev) => (prev + 1) % jobsList.length);
  };

  const handleCandidateSwipeLeft = () => {
    const candidatesList = candidates.length > 0 ? candidates : mockCandidates;
    toast({
      title: "Passed",
      description: "Candidate skipped",
      variant: "destructive",
    });
    setCurrentCandidateIndex((prev) => (prev + 1) % candidatesList.length);
  };

  const handleCandidateSwipeRight = async () => {
    // Create a match with the candidate
    const candidatesList = candidates.length > 0 ? candidates : mockCandidates;
    if (user) {
      const currentCandidate = candidatesList[currentCandidateIndex];
      const candidateId = currentCandidate.id || String(currentCandidate.id);
      
      const { data, error } = await supabase
        .from("matches")
        .insert([{
          recruiter_id: user.id,
          job_seeker_id: candidateId,
        }])
        .select()
        .single();

      if (!error && data) {
        setMatchData({
          matchId: data.id,
          person: {
            name: currentCandidate.full_name || currentCandidate.name,
            title: currentCandidate.job_title || currentCandidate.title,
            email: currentCandidate.email,
            skills: currentCandidate.skills || [],
          },
        });
        setShowMatchDialog(true);
      }
    }
    setCurrentCandidateIndex((prev) => (prev + 1) % candidatesList.length);
  };

  const jobsList = jobs.length > 0 ? jobs : mockJobs;
  const currentJob = jobsList[currentJobIndex];
  const candidatesList = candidates.length > 0 ? candidates : mockCandidates;
  const currentCandidate = candidatesList[currentCandidateIndex];

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
          <AccountMenu 
            userEmail={user?.email} 
            userRole={userRole}
            onProfileUpdate={() => {
              if (userRole === "recruiter") {
                loadCandidates();
              } else {
                loadJobs();
              }
            }}
          />
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
                  {candidatesList.length - currentCandidateIndex} candidates remaining
                </p>
              </div>

              <SwipeCard
                onSwipeLeft={handleCandidateSwipeLeft}
                onSwipeRight={handleCandidateSwipeRight}
                key={`candidate-${currentCandidateIndex}`}
              >
                <CandidateCard 
                  name={currentCandidate.full_name || currentCandidate.name}
                  title={currentCandidate.job_title || currentCandidate.title}
                  location={currentCandidate.location || "Not specified"}
                  experience={currentCandidate.experience || "Not specified"}
                  education={currentCandidate.education || "Not specified"}
                  email={currentCandidate.email}
                  linkedin={currentCandidate.linkedin_url}
                  bio={currentCandidate.bio || ""}
                  skills={currentCandidate.skills || []}
                  avatar={currentCandidate.avatar_url || currentCandidate.avatar}
                />
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
                  {jobsList.length - currentJobIndex} jobs remaining
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
