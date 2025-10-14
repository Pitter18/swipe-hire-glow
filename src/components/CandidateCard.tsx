import { MapPin, Briefcase, GraduationCap, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CandidateCardProps {
  name: string;
  title: string;
  location: string;
  experience: string;
  education: string;
  email: string;
  bio: string;
  skills: string[];
  avatar?: string;
}

export const CandidateCard = ({
  name,
  title,
  location,
  experience,
  education,
  email,
  bio,
  skills,
  avatar,
}: CandidateCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-full h-[600px] rounded-3xl gradient-card border border-border shadow-card overflow-hidden">
      <div className="h-40 gradient-primary relative">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <Avatar className="w-24 h-24 border-4 border-card shadow-glow">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-16 px-6 pb-6 space-y-4 h-[calc(600px-160px)] overflow-y-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>
          <p className="text-muted-foreground">{title}</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{experience}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span>{education}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>{email}</span>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 transition-smooth"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
