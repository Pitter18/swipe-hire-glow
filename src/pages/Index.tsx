import { useState } from "react";
import { SwipeCard, SwipeButtons } from "@/components/SwipeCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { ModeToggle } from "@/components/ModeToggle";
import { mockJobs, mockCandidates } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<"seeker" | "recruiter">("seeker");
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const { toast } = useToast();

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
        <ModeToggle mode={mode} onToggle={setMode} />
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
