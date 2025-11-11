import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Briefcase, MapPin, Phone, Linkedin, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "job_seeker" | "recruiter" | null;
  onProfileUpdate?: () => void;
}

export const ProfileDialog = ({ open, onOpenChange, userRole, onProfileUpdate }: ProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    linkedin_url: "",
    job_title: "",
    company: "",
    experience: "",
    skills: [] as string[],
    avatar_url: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          phone: profileData.phone || "",
          linkedin_url: profileData.linkedin_url || "",
          job_title: profileData.job_title || "",
          company: profileData.company || "",
          experience: profileData.experience || "",
          skills: profileData.skills || [],
          avatar_url: profileData.avatar_url || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast({
        title: "Success",
        description: "Profile photo updated!",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          linkedin_url: profile.linkedin_url,
          job_title: profile.job_title,
          company: profile.company,
          experience: profile.experience,
          skills: profile.skills,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      onProfileUpdate?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your {userRole === "job_seeker" ? "candidate" : "recruiter"} profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                <User className="w-16 h-16" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
              <Label htmlFor="avatar">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById("avatar")?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
              </Label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">
              <Linkedin className="w-4 h-4 inline mr-2" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedin_url"
              type="url"
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* Job Seeker Specific Fields */}
          {userRole === "job_seeker" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="job_title">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Current/Desired Job Title
                </Label>
                <Input
                  id="job_title"
                  value={profile.job_title}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  placeholder="Describe your work experience..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add a skill..."
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-primary/60 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recruiter Specific Fields */}
          {userRole === "recruiter" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">
                  <Building className="w-4 h-4 inline mr-2" />
                  Company Name
                </Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  value={profile.job_title}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  placeholder="e.g., HR Manager"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
