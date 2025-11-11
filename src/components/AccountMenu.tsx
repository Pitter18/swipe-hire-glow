import { useState } from "react";
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
  const { toast } = useToast();
  const navigate = useNavigate();

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
        onProfileUpdate={onProfileUpdate}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userEmail && (
            <>
              <DropdownMenuItem disabled className="text-muted-foreground">
                {userEmail}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
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
