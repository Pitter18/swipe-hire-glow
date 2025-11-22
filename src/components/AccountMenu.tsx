import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProfileDialog } from "./ProfileDialog";

interface AccountMenuProps {
  userEmail?: string;
  userRole?: "job_seeker" | "recruiter" | null;
  onProfileUpdate?: () => void;
}

export const AccountMenu = ({ userEmail, userRole, onProfileUpdate }: AccountMenuProps) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, company_logo, full_name, email")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfilePhoto(userRole === "job_seeker" ? profile.avatar_url : profile.company_logo);
        setUserName(profile.full_name || profile.email);
      }
    };

    loadProfile();

    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          // Update only if it's the current user's profile
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && updatedProfile.id === user.id) {
              setProfilePhoto(userRole === "job_seeker" ? updatedProfile.avatar_url : updatedProfile.company_logo);
              setUserName(updatedProfile.full_name || updatedProfile.email);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  return (
    <>
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        userRole={userRole}
        onProfileUpdate={() => {
          // Reload profile data when updated
          supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return;
            const { data: profile } = await supabase
              .from("profiles")
              .select("avatar_url, company_logo, full_name, email")
              .eq("id", user.id)
              .single();
            if (profile) {
              setProfilePhoto(userRole === "job_seeker" ? profile.avatar_url : profile.company_logo);
              setUserName(profile.full_name || profile.email);
            }
          });
          // Call parent's onProfileUpdate if provided
          if (onProfileUpdate) onProfileUpdate();
        }}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profilePhoto || undefined} alt={userName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 md:w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-xs md:text-sm font-medium leading-none truncate">{userName}</p>
              {userEmail && (
                <p className="text-[10px] md:text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
