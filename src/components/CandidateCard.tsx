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
  linkedin?: string;
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
  linkedin,
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
    <div className="w-full h-[500px] sm:h-[550px] md:h-[600px] rounded-2xl md:rounded-3xl gradient-card border border-border shadow-card overflow-hidden">
      <div className="h-32 sm:h-36 md:h-40 gradient-primary relative">
        <div className="absolute -bottom-10 sm:-bottom-11 md:-bottom-12 left-1/2 -translate-x-1/2">
          <Avatar className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 border-4 border-card shadow-glow">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xl sm:text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-12 sm:pt-14 md:pt-16 px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-4 h-[calc(500px-128px)] sm:h-[calc(550px-144px)] md:h-[calc(600px-160px)] overflow-y-auto">
        <div className="text-center px-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 truncate">{name}</h2>
          <p className="text-sm sm:text-base text-muted-foreground truncate">{title}</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 justify-center text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{experience}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{education}</span>
          </div>
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate max-w-[80%]">{email}</span>
          </div>
          {linkedin && (
            <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                LinkedIn
              </a>
            </div>
          )}
        </div>

        <div className="pt-1 md:pt-2">
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-1.5 md:mb-2">About</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>

        <div className="pt-1 md:pt-2">
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">Skills</h3>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 transition-smooth text-xs"
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
