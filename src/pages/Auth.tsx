import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Briefcase, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "recruiter">("job_seeker");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Store selected role in localStorage before OAuth redirect
      localStorage.setItem("pendingUserRole", selectedRole);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <Card className="w-full max-w-md border-white/10 bg-background/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold gradient-text">JobSwipe</CardTitle>
          <CardDescription>Choose your role and sign in to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">I'm here to:</Label>
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as "job_seeker" | "recruiter")} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="job_seeker" id="job_seeker" className="peer sr-only" />
                <Label
                  htmlFor="job_seeker"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <Briefcase className="mb-3 h-8 w-8" />
                  <span className="text-sm font-medium">Find a Job</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="recruiter" id="recruiter" className="peer sr-only" />
                <Label
                  htmlFor="recruiter"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <Users className="mb-3 h-8 w-8" />
                  <span className="text-sm font-medium">Hire Talent</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
