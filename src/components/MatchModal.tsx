import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    name: string;
    image: string;
  };
  onSendMessage: (message: string) => void;
}

export const MatchModal = ({ isOpen, onClose, matchedUser, onSendMessage }: MatchModalProps) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="relative p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-background/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-6">
            <div className="text-6xl mb-4">💖</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              It's a Match!
            </h2>
            <p className="text-muted-foreground mt-2">
              You and {matchedUser.name} liked each other
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                {matchedUser.image ? (
                  <img
                    src={matchedUser.image}
                    alt={matchedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                    {matchedUser.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                💕
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder={`Say hello to ${matchedUser.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Keep Swiping
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--button-shadow)]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};