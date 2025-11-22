import { MapPin, DollarSign, Briefcase, Clock } from "lucide-react";
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
    <div className="w-full h-[600px] rounded-3xl gradient-card border border-border shadow-card overflow-hidden">
      <div className="h-32 gradient-primary relative sticky top-0 z-10">
        <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
          {companyLogo && (
            <img 
              src={companyLogo} 
              alt={company} 
              className="w-16 h-16 rounded-lg bg-card object-cover border-2 border-card"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            <p className="text-white/90 text-lg">{company}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4 h-[calc(600px-128px)] overflow-y-auto">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>{salary}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{postedTime}</span>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-smooth"
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
