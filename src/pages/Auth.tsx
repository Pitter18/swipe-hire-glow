import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Users, Sparkles } from "lucide-react";

type UserRole = "job_seeker" | "recruiter";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking role:", error);
      return;
    }

    if (data) {
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a job seeker or recruiter",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      localStorage.setItem("pendingUserRole", selectedRole);
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-glow">
        <CardHeader className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to JobSwipe
          </CardTitle>
          <CardDescription className="text-base">
            Choose your role and sign in with Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole("job_seeker")}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                selectedRole === "job_seeker"
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Briefcase className="h-8 w-8 mb-2" />
              <span className="font-medium">Job Seeker</span>
            </button>
            <button
              onClick={() => setSelectedRole("recruiter")}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                selectedRole === "recruiter"
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Users className="h-8 w-8 mb-2" />
              <span className="font-medium">Recruiter</span>
            </button>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || !selectedRole}
            className="w-full gradient-primary"
            size="lg"
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
