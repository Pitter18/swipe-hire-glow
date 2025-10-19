import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          const role = searchParams.get("role");
          
          if (role) {
            // Insert the user role
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: session.user.id,
                role: role as "job_seeker" | "recruiter",
              });

            if (roleError && !roleError.message.includes("duplicate")) {
              console.error("Error setting role:", roleError);
            }
          }

          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          });

          navigate("/");
        }
      } catch (error: any) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
