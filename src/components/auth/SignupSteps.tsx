import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, Users } from "lucide-react";

interface Step1Props {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  role: "seeker" | "recruiter";
  setRole: (value: "seeker" | "recruiter") => void;
}

export const Step1BasicInfo = ({ fullName, setFullName, email, setEmail, password, setPassword, role, setRole }: Step1Props) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="fullName">Full Name</Label>
      <Input
        id="fullName"
        type="text"
        placeholder="John Doe"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
    </div>
    <div className="space-y-3">
      <Label>I am a</Label>
      <RadioGroup value={role} onValueChange={(value: "seeker" | "recruiter") => setRole(value)}>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="seeker" id="seeker" />
          <Label htmlFor="seeker" className="flex items-center gap-2 cursor-pointer flex-1">
            <Briefcase className="w-4 h-4" />
            Job Seeker
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="recruiter" id="recruiter" />
          <Label htmlFor="recruiter" className="flex items-center gap-2 cursor-pointer flex-1">
            <Users className="w-4 h-4" />
            Recruiter
          </Label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

interface Step2Props {
  role: "seeker" | "recruiter";
  jobTitle: string;
  setJobTitle: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  education: string;
  setEducation: (value: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
  salaryRange: string;
  setSalaryRange: (value: string) => void;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  companyLogoFile: File | null;
  setCompanyLogoFile: (file: File | null) => void;
}

export const Step2ProfileDetails = ({ 
  role, jobTitle, setJobTitle, location, setLocation, company, setCompany,
  experience, setExperience, education, setEducation, linkedinUrl, setLinkedinUrl,
  salaryRange, setSalaryRange, avatarFile, setAvatarFile, companyLogoFile, setCompanyLogoFile
}: Step2Props) => (
  <div className="space-y-4">
    {role === "seeker" && (
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-muted-foreground">Upload your profile picture</p>
      </div>
    )}

    {role === "recruiter" && (
      <div className="space-y-2">
        <Label htmlFor="companyLogo">Company Logo</Label>
        <Input
          id="companyLogo"
          type="file"
          accept="image/*"
          onChange={(e) => setCompanyLogoFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-muted-foreground">Upload your company logo</p>
      </div>
    )}

    <div className="space-y-2">
      <Label htmlFor="jobTitle">{role === "seeker" ? "Current Position / Looking For" : "Position Looking For"}</Label>
      <Input
        id="jobTitle"
        type="text"
        placeholder={role === "seeker" ? "Senior Developer" : "Full Stack Developer"}
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        required
      />
    </div>

    {role === "recruiter" && (
      <div className="space-y-2">
        <Label htmlFor="company">Company Name</Label>
        <Input
          id="company"
          type="text"
          placeholder="Acme Inc"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
      </div>
    )}

    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        type="text"
        placeholder="San Francisco, CA"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
    </div>

    {role === "seeker" ? (
      <>
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            type="text"
            placeholder="5 years"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="education">Degree</Label>
          <Input
            id="education"
            type="text"
            placeholder="Bachelor's in Computer Science"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
      </>
    ) : (
      <div className="space-y-2">
        <Label htmlFor="salaryRange">Salary Range</Label>
        <Input
          id="salaryRange"
          type="text"
          placeholder="€80k - €120k"
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          required
        />
      </div>
    )}
  </div>
);

interface Step3Props {
  role: "seeker" | "recruiter";
  bio: string;
  setBio: (value: string) => void;
  skills: string[];
  setSkills: (value: string[]) => void;
  skillInput: string;
  setSkillInput: (value: string) => void;
}

export const Step3AdditionalInfo = ({ role, bio, setBio, skills, setSkills, skillInput, setSkillInput }: Step3Props) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="bio">{role === "seeker" ? "About Me" : "Role Description"}</Label>
      <Input
        id="bio"
        type="text"
        placeholder={role === "seeker" ? "Tell us about yourself" : "Describe the role"}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="skills">{role === "seeker" ? "Skills" : "Required Skills"}</Label>
      <div className="flex gap-2">
        <Input
          id="skills"
          type="text"
          placeholder="Add a skill"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (skillInput.trim()) {
                setSkills([...skills, skillInput.trim()]);
                setSkillInput("");
              }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (skillInput.trim()) {
              setSkills([...skills, skillInput.trim()]);
              setSkillInput("");
            }
          }}
        >
          Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                className="hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);
