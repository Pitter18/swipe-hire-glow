import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CandidateCard } from "@/components/CandidateCard";
import { JobCard } from "@/components/JobCard";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [otherUserRole, setOtherUserRole] = useState<string>("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Verify match exists and user is part of it
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchError || !match) {
        toast({
          title: "Invalid Match",
          description: "This chat does not exist or you don't have access to it.",
          variant: "destructive",
        });
        navigate("/matches");
        return;
      }

      // Check if user is part of this match
      if (match.recruiter_id !== user.id && match.job_seeker_id !== user.id) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this chat.",
          variant: "destructive",
        });
        navigate("/matches");
        return;
      }

      // Get the other user's ID and fetch their profile
      const otherUserId = match.recruiter_id === user.id ? match.job_seeker_id : match.recruiter_id;
      
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherUserId)
        .single();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", otherUserId)
        .single();

      if (otherProfile && roleData) {
        setOtherUserProfile(otherProfile);
        setOtherUserRole(roleData.role);
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
        
        // Mark all messages from other user as read
        const unreadMessages = messagesData.filter(
          (msg) => msg.sender_id !== user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unreadMessages.map(msg => msg.id));
        }
      }
    };

    initChat();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-3 md:px-6 py-3 md:py-4 border-b border-border flex items-center gap-3 md:gap-4 sticky top-0 backdrop-blur-sm bg-background/95 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/matches")}
          className="h-8 w-8 md:h-10 md:w-10"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <h1 className="text-base md:text-xl font-semibold text-foreground flex-1 truncate">
          {otherUserProfile?.full_name || "Chat"}
        </h1>
        {otherUserProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProfileDialog(true)}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-3 md:px-4 py-2 ${
                message.sender_id === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-xs md:text-sm break-words">{message.content}</p>
              <p className="text-[10px] md:text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <div className="px-3 md:px-4 py-3 md:py-4 border-t border-border bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm md:text-base"
          />
          <Button type="submit" size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </form>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {otherUserProfile && otherUserRole === "job_seeker" && (
            <CandidateCard
              name={otherUserProfile.full_name || "Unknown"}
              title={otherUserProfile.job_title || "No title"}
              location={otherUserProfile.location || "No location"}
              experience={otherUserProfile.experience || "No experience"}
              education={otherUserProfile.education || "No education"}
              email={otherUserProfile.email}
              linkedin={otherUserProfile.linkedin_url}
              bio={otherUserProfile.bio || "No bio available"}
              skills={otherUserProfile.skills || []}
              avatar={otherUserProfile.avatar_url}
            />
          )}
          {otherUserProfile && otherUserRole === "recruiter" && (
            <JobCard
              title={otherUserProfile.job_title || "No position"}
              company={otherUserProfile.company || "No company"}
              location={otherUserProfile.location || "No location"}
              salary={otherUserProfile.salary_range || "Not specified"}
              postedTime={new Date(otherUserProfile.updated_at).toLocaleDateString()}
              description={otherUserProfile.bio || "No description"}
              skills={otherUserProfile.skills || []}
              companyLogo={otherUserProfile.company_logo}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
