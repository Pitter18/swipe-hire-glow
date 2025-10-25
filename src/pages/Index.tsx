import { useState } from "react";
import { SwipeCard, SwipeButtons } from "@/components/SwipeCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mockJobs, mockCandidates } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Briefcase, Users } from "lucide-react";

const Index = () => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const { toast } = useToast();

  const handleJobSwipeLeft = () => {
    toast({
      title: "Passed",
      description: "Job skipped",
      variant: "destructive",
    });
    setCurrentJobIndex((prev) => (prev + 1) % mockJobs.length);
  };

  const handleJobSwipeRight = () => {
    toast({
      title: "It's a Match! ✨",
      description: "Job saved to your list",
    });
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

  const handleCandidateSwipeRight = () => {
    toast({
      title: "It's a Match! ✨",
      description: "Candidate shortlisted",
    });
    setCurrentCandidateIndex((prev) => (prev + 1) % mockCandidates.length);
  };

  const currentJob = mockJobs[currentJobIndex];
  const currentCandidate = mockCandidates[currentCandidateIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-6 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            JobSwipe
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Job Seeker View */}
          <div className="w-full max-w-md mx-auto">
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
          </div>

          {/* Recruiter View */}
          <div className="w-full max-w-md mx-auto">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
