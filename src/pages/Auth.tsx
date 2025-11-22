import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ChevronLeft } from "lucide-react";
import { Step1BasicInfo, Step2ProfileDetails, Step3AdditionalInfo } from "@/components/auth/SignupSteps";
import { ProfilePreview } from "@/components/auth/ProfilePreview";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"seeker" | "recruiter">("seeker");
  const [loading, setLoading] = useState(false);
  
  // Job Seeker fields
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  
  // Recruiter fields
  const [company, setCompany] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  
  // Image uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Insert user role and profile
        if (data.user) {
          // Upload images to storage if provided
          let avatarUrl = null;
          let companyLogoUrl = null;

          if (role === "seeker" && avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${data.user.id}-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, avatarFile);

            if (uploadError) {
              console.error("Avatar upload error:", uploadError);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
              avatarUrl = publicUrl;
            }
          }

          if (role === "recruiter" && companyLogoFile) {
            const fileExt = companyLogoFile.name.split('.').pop();
            const fileName = `${data.user.id}-logo-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, companyLogoFile);

            if (uploadError) {
              console.error("Company logo upload error:", uploadError);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
              companyLogoUrl = publicUrl;
            }
          }
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: (role === "seeker" ? "job_seeker" : "recruiter") as "job_seeker" | "recruiter",
            });

          if (roleError) {
            console.error("Role insertion error:", roleError);
            throw new Error("Failed to set user role. Please try again.");
          }

          // Upsert profile with all fields
          const profileData = {
            id: data.user.id,
            email: email,
            full_name: fullName,
            job_title: jobTitle,
            location: location,
            bio: bio,
            skills: skills.length > 0 ? skills : null,
            linkedin_url: linkedinUrl || null,
            phone: null,
            avatar_url: avatarUrl,
            company_logo: companyLogoUrl,
            ...(role === "seeker" ? {
              experience: experience,
              education: education,
              company: null,
              salary_range: null,
            } : {
              company: company,
              salary_range: salaryRange,
              experience: null,
              education: null,
            })
          };

          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(profileData, { onConflict: 'id' });

          if (profileError) {
            console.error("Profile update error:", profileError);
            throw new Error("Failed to update profile. Please try again.");
          }

          toast({
            title: "Success",
            description: "Account created successfully!",
          });
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = fullName && email && password.length >= 6;
  const canProceedStep2 = role === "seeker" 
    ? jobTitle && location && experience && education
    : jobTitle && location && company && salaryRange;
  const canProceedStep3 = bio && skills.length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 md:px-4 py-4 md:py-8">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-6xl'} ${!isLogin && 'grid lg:grid-cols-2'} gap-4 md:gap-6`}>
        <Card className="w-full mx-auto shadow-lg">
          <CardHeader className="space-y-3 md:space-y-4 p-4 md:p-6">
            <div className="flex justify-center">
              <img src={logo} alt="SwipeHire Logo" className="w-12 h-12 md:w-16 md:h-16 rounded-2xl" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-center">
              {isLogin
                ? "Sign in to continue to SwipeHire"
                : `Step ${currentStep} of ${totalSteps}: ${
                    currentStep === 1 ? "Basic Information" :
                    currentStep === 2 ? "Profile Details" :
                    currentStep === 3 ? "Additional Info" :
                    "Review & Complete"
                  }`}
            </CardDescription>
            {!isLogin && (
              <Progress value={progress} className="h-2" />
            )}
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
              {!isLogin ? (
                <>
                  {currentStep === 1 && (
                    <Step1BasicInfo
                      fullName={fullName}
                      setFullName={setFullName}
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      role={role}
                      setRole={setRole}
                    />
                  )}

                  {currentStep === 2 && (
                    <Step2ProfileDetails
                      role={role}
                      jobTitle={jobTitle}
                      setJobTitle={setJobTitle}
                      location={location}
                      setLocation={setLocation}
                      company={company}
                      setCompany={setCompany}
                      experience={experience}
                      setExperience={setExperience}
                      education={education}
                      setEducation={setEducation}
                      linkedinUrl={linkedinUrl}
                      setLinkedinUrl={setLinkedinUrl}
                      salaryRange={salaryRange}
                      setSalaryRange={setSalaryRange}
                      avatarFile={avatarFile}
                      setAvatarFile={setAvatarFile}
                      companyLogoFile={companyLogoFile}
                      setCompanyLogoFile={setCompanyLogoFile}
                    />
                  )}

                  {currentStep === 3 && (
                    <Step3AdditionalInfo
                      role={role}
                      bio={bio}
                      setBio={setBio}
                      skills={skills}
                      setSkills={setSkills}
                      skillInput={skillInput}
                      setSkillInput={setSkillInput}
                    />
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Review your profile preview on the right and click "Create Account" when ready.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1"
                        disabled={
                          (currentStep === 1 && !canProceedStep1) ||
                          (currentStep === 2 && !canProceedStep2) ||
                          (currentStep === 3 && !canProceedStep3)
                        }
                      >
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? "Creating..." : "Create Account"}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Sign In"}
                  </Button>
                </>
              )}
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setCurrentStep(1);
                }}
                className="text-primary hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {!isLogin && currentStep >= 2 && (
          <div className="hidden lg:block">
            <ProfilePreview
              role={role}
              fullName={fullName}
              jobTitle={jobTitle}
              location={location}
              company={company}
              experience={experience}
              education={education}
              bio={bio}
              skills={skills}
              email={email}
              linkedinUrl={linkedinUrl}
              salaryRange={salaryRange}
              avatarFile={avatarFile}
              companyLogoFile={companyLogoFile}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
