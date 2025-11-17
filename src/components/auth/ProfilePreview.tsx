import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, GraduationCap, Mail, Linkedin, Building2, DollarSign } from "lucide-react";

interface ProfilePreviewProps {
  role: "seeker" | "recruiter";
  fullName: string;
  jobTitle: string;
  location: string;
  company: string;
  experience: string;
  education: string;
  bio: string;
  skills: string[];
  email: string;
  linkedinUrl: string;
  salaryRange: string;
}

export const ProfilePreview = ({
  role,
  fullName,
  jobTitle,
  location,
  company,
  experience,
  education,
  bio,
  skills,
  email,
  linkedinUrl,
  salaryRange,
}: ProfilePreviewProps) => {
  if (role === "seeker") {
    return (
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Profile Preview</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
            {fullName ? fullName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h4 className="font-semibold text-lg">{fullName || "Your Name"}</h4>
            <p className="text-muted-foreground">{jobTitle || "Position"}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>{experience}</span>
            </div>
          )}
          {education && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span>{education}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {linkedinUrl && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-muted-foreground" />
              <span className="truncate text-primary">{linkedinUrl}</span>
            </div>
          )}
        </div>

        {bio && (
          <div>
            <h5 className="font-semibold mb-2">About</h5>
            <p className="text-sm text-muted-foreground">{bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h5 className="font-semibold mb-2">Skills</h5>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Recruiter preview
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Job Posting Preview</h3>
      
      <div>
        <h4 className="font-bold text-xl mb-2">{jobTitle || "Position Title"}</h4>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{company || "Company Name"}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        )}
        {salaryRange && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>{salaryRange}</span>
          </div>
        )}
      </div>

      {bio && (
        <div>
          <h5 className="font-semibold mb-2">Role Description</h5>
          <p className="text-sm text-muted-foreground">{bio}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h5 className="font-semibold mb-2">Required Skills</h5>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
