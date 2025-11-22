import { MapPin, Euro, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  postedTime: string;
}

export const JobCard = ({
  title,
  company,
  companyLogo,
  location,
  salary,
  description,
  skills,
  postedTime,
}: JobCardProps) => {
  return (
    <div className="w-full h-[500px] sm:h-[550px] md:h-[600px] rounded-2xl md:rounded-3xl gradient-card border border-border shadow-card overflow-hidden">
      <div className="h-24 sm:h-28 md:h-32 gradient-primary relative">
        <div className="absolute bottom-3 md:bottom-4 left-4 md:left-6 right-4 md:right-6 flex items-end gap-2 md:gap-4">
          {companyLogo && (
            <img 
              src={companyLogo} 
              alt={company} 
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-card object-cover border-2 border-card flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5 md:mb-1 truncate">{title}</h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg truncate">{company}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6 space-y-3 md:space-y-4 h-[calc(500px-96px)] sm:h-[calc(550px-112px)] md:h-[calc(600px-128px)] overflow-y-auto">
        <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <Euro className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{salary}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="truncate">{postedTime}</span>
          </div>
        </div>

        <div className="pt-1 md:pt-2">
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-1.5 md:mb-2">Description</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="pt-1 md:pt-2">
          <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-smooth text-xs"
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
