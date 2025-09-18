import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, MessageCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProfileCardProps {
  profile: any;
  onLike: () => void;
  onPass: () => void;
  currentMember?: any;
  isProfileIncomplete?: boolean;
}

export function ProfileCard({ profile, onLike, onPass, currentMember, isProfileIncomplete }: ProfileCardProps) {
  const age = profile.birthdate ? 
    new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 25;

  const handleCardClick = () => {
    if (isProfileIncomplete) {
      toast.error("Complete your profile to view other profiles", {
        description: "Get better matches by completing your registration",
        action: {
          label: "Complete Profile",
          onClick: () => window.location.href = "/profile"
        }
      });
      return;
    }
    // TODO: Navigate to full profile view
  };

  const handleMessage = () => {
    if (isProfileIncomplete) {
      toast.error("Complete your profile to send messages", {
        description: "Get better matches by completing your registration",
        action: {
          label: "Complete Profile", 
          onClick: () => window.location.href = "/profile"
        }
      });
      return;
    }
    // TODO: Open message compose
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
      {isProfileIncomplete && (
        <div className="absolute top-2 right-2 z-10">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        </div>
      )}
      <div onClick={handleCardClick}>
        <div className="aspect-[4/5] bg-muted flex items-center justify-center">
          {profile.images && profile.images.length > 0 ? (
            <img 
              src={profile.images[0]} 
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-4xl font-bold">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm">{profile.name}, {age}</h3>
          <p className="text-xs text-muted-foreground mb-2">{profile.location}</p>
          {profile.professionalism && (
            <p className="text-xs text-muted-foreground">{profile.professionalism}</p>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              className="flex-1"
              disabled={isProfileIncomplete}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onPass();
              }}
              className="flex-1"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}