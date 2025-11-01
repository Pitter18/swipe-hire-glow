import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Sparkles } from "lucide-react";

interface MatchNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedPerson: {
    name?: string;
    title?: string;
    company?: string;
    skills?: string[];
    email?: string;
  };
  matchId: string;
}

export const MatchNotification = ({
  open,
  onOpenChange,
  matchedPerson,
  matchId,
}: MatchNotificationProps) => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    onOpenChange(false);
    navigate(`/chat/${matchId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            It's a Match! ✨
          </DialogTitle>
          <DialogDescription className="text-center">
            You and {matchedPerson.name || matchedPerson.email} have matched!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg text-foreground">
              {matchedPerson.name || matchedPerson.email}
            </h3>
            {matchedPerson.title && (
              <p className="text-sm text-muted-foreground">
                {matchedPerson.title}
                {matchedPerson.company && ` at ${matchedPerson.company}`}
              </p>
            )}
          </div>

          {matchedPerson.skills && matchedPerson.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {matchedPerson.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Keep Swiping
            </Button>
            <Button
              className="flex-1 gradient-primary text-white"
              onClick={handleStartChat}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
