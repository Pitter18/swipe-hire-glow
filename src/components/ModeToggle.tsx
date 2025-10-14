import { Users, Briefcase } from "lucide-react";

interface ModeToggleProps {
  mode: "seeker" | "recruiter";
  onToggle: (mode: "seeker" | "recruiter") => void;
}

export const ModeToggle = ({ mode, onToggle }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-card rounded-full border border-border shadow-card">
      <button
        onClick={() => onToggle("seeker")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-smooth ${
          mode === "seeker"
            ? "gradient-primary text-white shadow-glow"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span className="font-medium">Job Seeker</span>
      </button>
      <button
        onClick={() => onToggle("recruiter")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-smooth ${
          mode === "recruiter"
            ? "gradient-primary text-white shadow-glow"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="font-medium">Recruiter</span>
      </button>
    </div>
  );
};
