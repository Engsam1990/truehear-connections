import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionAlertProps {
  currentMember: any;
  onCompleteProfile: () => void;
  showInModal?: boolean;
  onClose?: () => void;
}

export const ProfileCompletionAlert = ({ 
  currentMember, 
  onCompleteProfile, 
  showInModal = false,
  onClose 
}: ProfileCompletionAlertProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentMember) {
      // Check if profile needs completion
      const needsCompletion = !currentMember.about_me || !currentMember.reasons || 
                             !currentMember.relationship_status || !currentMember.professionalism ||
                             !currentMember.education_level || !currentMember.height || !currentMember.weight;
      
      if (needsCompletion) {
        if (showInModal) {
          // For modal display (when accessing profile)
          setShowAlert(true);
        } else {
          // For timed alert - show after 30 seconds of browsing
          const timer = setTimeout(() => {
            setShowAlert(true);
          }, 30000);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentMember, showInModal]);

  const handleCompleteProfile = () => {
    onCompleteProfile();
    setShowAlert(false);
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    setShowAlert(false);
    if (onClose) onClose();
    
    if (!showInModal) {
      toast({
        title: "Reminder set",
        description: "We'll remind you again later to complete your profile",
      });
    }
  };

  if (!showAlert) return null;

  const AlertContent = () => (
    <>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-love-pink to-love-orange rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">
            Get Better Matches! 💖
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Complete your profile to get personalized matches based on your preferences and interests. Users with complete profiles get 5x more matches!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-love-pink to-love-orange text-white"
              onClick={handleCompleteProfile}
            >
              Complete Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
            >
              {showInModal ? "Close" : "Later"}
            </Button>
          </div>
        </div>
        {!showInModal && (
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </>
  );

  if (showInModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full p-6">
          <AlertContent />
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
      <Alert className="border-love-pink bg-background shadow-lg">
        <AlertDescription>
          <AlertContent />
        </AlertDescription>
      </Alert>
    </div>
  );
};