import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SwipeCard, SwipeButtons } from "@/components/SwipeCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";
import { MatchNotification } from "@/components/MatchNotification";
import { ProfileDialog } from "@/components/ProfileDialog";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Sparkles, Briefcase, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

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
  const unreadCount = useUnreadMessages(user?.id);

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
            await loadCandidates(session.user.id);
          } else {
            await loadJobs(session.user.id);
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
              await loadCandidates(session.user.id);
            } else {
              await loadJobs(session.user.id);
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
          if (!user?.id) return;
          if (userRole === "recruiter") {
            loadCandidates(user.id);
          } else {
            loadJobs(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  // Real-time match notifications
  useEffect(() => {
    if (!user || !userRole) return;

    const matchChannel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: userRole === "recruiter" 
            ? `recruiter_id=eq.${user.id}` 
            : `job_seeker_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("New match detected:", payload);
          const newMatch = payload.new as any;
          
          // Fetch the other person's profile
          const otherUserId = userRole === "recruiter" 
            ? newMatch.job_seeker_id 
            : newMatch.recruiter_id;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherUserId)
            .single();
          
          if (profile) {
            setMatchData({
              matchId: newMatch.id,
              person: {
                name: profile.full_name || profile.email,
                title: profile.job_title,
                company: profile.company,
                skills: profile.skills || [],
                email: profile.email,
              },
            });
            setShowMatchDialog(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [user, userRole]);

  const loadCandidates = async (userId: string) => {
    try {
      if (!userId) {
        console.log("No user ID provided to loadCandidates");
        return;
      }

      // Get all job seeker user IDs
      const { data: jobSeekerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "job_seeker");

      if (!jobSeekerRoles || jobSeekerRoles.length === 0) {
        console.log("No job seekers found");
        setCandidates([]);
        return;
      }

      const jobSeekerIds = jobSeekerRoles.map(r => r.user_id).filter(id => id !== userId);

      if (jobSeekerIds.length === 0) {
        console.log("No other job seekers available");
        setCandidates([]);
        return;
      }

      // Get all matches where this recruiter is involved
      const { data: matches } = await supabase
        .from("matches")
        .select("job_seeker_id")
        .eq("recruiter_id", userId);

      const matchedJobSeekerIds = matches?.map(m => m.job_seeker_id) || [];

      // Filter out already matched candidates
      const availableJobSeekerIds = jobSeekerIds.filter(id => !matchedJobSeekerIds.includes(id));

      if (availableJobSeekerIds.length === 0) {
        console.log("No unmatched job seekers available");
        setCandidates([]);
        return;
      }

      // Get profiles for job seekers
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", availableJobSeekerIds);

      if (error) throw error;

      setCandidates(profiles || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
      setCandidates([]);
    }
  };

  const loadJobs = async (userId: string) => {
    try {
      if (!userId) {
        console.log("No user ID provided to loadJobs");
        return;
      }

      // Get all recruiter user IDs
      const { data: recruiterRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "recruiter");

      if (!recruiterRoles || recruiterRoles.length === 0) {
        console.log("No recruiters found");
        setJobs([]);
        return;
      }

      const recruiterIds = recruiterRoles.map(r => r.user_id).filter(id => id !== userId);

      if (recruiterIds.length === 0) {
        console.log("No other recruiters available");
        setJobs([]);
        return;
      }

      // Get all matches where this job seeker is involved
      const { data: matches } = await supabase
        .from("matches")
        .select("recruiter_id")
        .eq("job_seeker_id", userId);

      const matchedRecruiterIds = matches?.map(m => m.recruiter_id) || [];

      // Filter out already matched recruiters
      const availableRecruiterIds = recruiterIds.filter(id => !matchedRecruiterIds.includes(id));

      if (availableRecruiterIds.length === 0) {
        console.log("No unmatched recruiters available");
        setJobs([]);
        return;
      }

      // Get profiles for recruiters
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", availableRecruiterIds);

      if (error) throw error;

      const formattedJobs = (profiles || []).map((profile) => ({
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
    } catch (error) {
      console.error("Error loading jobs:", error);
      setJobs([]);
    }
  };

  const handleJobSwipeLeft = () => {
    toast({
      title: "Passed",
      description: "Job skipped",
      variant: "destructive",
    });
    setCurrentJobIndex((prev) => prev + 1);
  };

  const handleJobSwipeRight = async () => {
    if (user) {
      const currentJob = jobs[currentJobIndex];
      const recruiterId = currentJob.id;
      
      try {
        // Step 1: Insert the swipe
        const { error: swipeError } = await supabase
          .from("swipes")
          .insert({
            swiper_id: user.id,
            swiped_id: recruiterId,
          });
        
        if (swipeError && !swipeError.message.includes('duplicate')) {
          throw swipeError;
        }
        
        // Step 2: Check if recruiter has already swiped right on this job seeker
        const { data: mutualSwipe } = await supabase
          .from("swipes")
          .select("*")
          .eq("swiper_id", recruiterId)
          .eq("swiped_id", user.id)
          .maybeSingle();
        
        // Step 3: If mutual swipe exists, create a match
        if (mutualSwipe) {
          const { data: matchData, error: matchError } = await supabase
            .from("matches")
            .insert({
              recruiter_id: recruiterId,
              job_seeker_id: user.id,
            })
            .select()
            .maybeSingle();
          
          if (!matchError && matchData) {
            setMatchData({
              matchId: matchData.id,
              person: {
                name: currentJob.company,
                title: currentJob.title,
                company: currentJob.company,
                skills: currentJob.skills,
                email: "contact@company.com",
              },
            });
            setShowMatchDialog(true);
          }
        } else {
          toast({
            title: "Liked!",
            description: "They'll be notified if they like you back",
          });
        }
      } catch (error) {
        console.error("Error processing swipe:", error);
        toast({
          title: "Error",
          description: "Failed to process swipe",
          variant: "destructive",
        });
      }
    }
    setCurrentJobIndex((prev) => prev + 1);
  };

  const handleCandidateSwipeLeft = () => {
    toast({
      title: "Passed",
      description: "Candidate skipped",
      variant: "destructive",
    });
    setCurrentCandidateIndex((prev) => prev + 1);
  };

  const handleCandidateSwipeRight = async () => {
    if (user) {
      const currentCandidate = candidates[currentCandidateIndex];
      const candidateId = currentCandidate.id;
      
      try {
        // Step 1: Insert the swipe
        const { error: swipeError } = await supabase
          .from("swipes")
          .insert({
            swiper_id: user.id,
            swiped_id: candidateId,
          });
        
        if (swipeError && !swipeError.message.includes('duplicate')) {
          throw swipeError;
        }
        
        // Step 2: Check if candidate has already swiped right on this recruiter
        const { data: mutualSwipe } = await supabase
          .from("swipes")
          .select("*")
          .eq("swiper_id", candidateId)
          .eq("swiped_id", user.id)
          .maybeSingle();
        
        // Step 3: If mutual swipe exists, create a match
        if (mutualSwipe) {
          const { data: matchData, error: matchError } = await supabase
            .from("matches")
            .insert({
              recruiter_id: user.id,
              job_seeker_id: candidateId,
            })
            .select()
            .maybeSingle();
          
          if (!matchError && matchData) {
            setMatchData({
              matchId: matchData.id,
              person: {
                name: currentCandidate.full_name || currentCandidate.name,
                title: currentCandidate.job_title || currentCandidate.title,
                email: currentCandidate.email,
                skills: currentCandidate.skills || [],
              },
            });
            setShowMatchDialog(true);
          }
        } else {
          toast({
            title: "Liked!",
            description: "They'll be notified if they like you back",
          });
        }
      } catch (error) {
        console.error("Error processing swipe:", error);
        toast({
          title: "Error",
          description: "Failed to process swipe",
          variant: "destructive",
        });
      }
    }
    setCurrentCandidateIndex((prev) => prev + 1);
  };

  const currentJob = jobs[currentJobIndex];
  const currentCandidate = candidates[currentCandidateIndex];

  if (loading || !userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <img 
              src={logo} 
              alt="SwipeHire" 
              className="w-20 h-20 rounded-2xl animate-[scale-in_0.5s_ease-out,pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" 
            />
            <div className="absolute inset-0 rounded-2xl shadow-glow animate-pulse"></div>
          </div>
          <p className="text-muted-foreground animate-fade-in">Loading...</p>
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
      
      <header className="px-3 md:px-6 py-4 md:py-6 flex items-center justify-between border-b border-border backdrop-blur-sm bg-background/95 sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="SwipeHire Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
          <h1 className="hidden sm:block text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SwipeHire
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/matches")}
            className="flex items-center gap-2 relative px-2 md:px-3"
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Matches</span>
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 min-w-4 md:h-5 md:min-w-5 flex items-center justify-center p-1 text-[10px] md:text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
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
              if (!user?.id) return;
              if (userRole === "recruiter") {
                loadCandidates(user.id);
              } else {
                loadJobs(user.id);
              }
            }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-3 md:px-4 py-4 md:py-8">
        <div className="w-full max-w-md px-1 sm:px-0">
          {isRecruiter ? (
            <>
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Candidates</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {candidates.length - currentCandidateIndex} candidates remaining
                </p>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Candidates Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later when job seekers start creating profiles!
                  </p>
                </div>
              ) : currentCandidate ? (
                <>
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
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">All Done!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've reviewed all available candidates.
                  </p>
                  <Button
                    onClick={async () => {
                      if (!user?.id) return;
                      setCurrentCandidateIndex(0);
                      await loadCandidates(user.id);
                      toast({
                        title: "Refreshed",
                        description: "Checking for new candidates...",
                      });
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check for New Candidates
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Jobs for You</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {jobs.length - currentJobIndex} jobs remaining
                </p>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later when recruiters start posting jobs!
                  </p>
                </div>
              ) : currentJob ? (
                <>
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
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">All Done!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've reviewed all available jobs.
                  </p>
                  <Button
                    onClick={async () => {
                      if (!user?.id) return;
                      setCurrentJobIndex(0);
                      await loadJobs(user.id);
                      toast({
                        title: "Refreshed",
                        description: "Checking for new jobs...",
                      });
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check for New Jobs
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
