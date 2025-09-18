import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface ProfileCompletionAlertProps {
  isIncomplete: boolean;
  onProfileClick: () => void;
}

export function ProfileCompletionAlert({ isIncomplete, onProfileClick }: ProfileCompletionAlertProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastProfileAccess, setLastProfileAccess] = useState<number>(0);

  useEffect(() => {
    if (!isIncomplete || isDismissed) {
      setShowAlert(false);
      return;
    }

    // Check if user has been active for more than 30 seconds without accessing profile
    const timer = setTimeout(() => {
      const now = Date.now();
      if (now - lastProfileAccess > 30000) { // 30 seconds
        setShowAlert(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isIncomplete, isDismissed, lastProfileAccess]);

  const handleProfileAccess = () => {
    setLastProfileAccess(Date.now());
    setShowAlert(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowAlert(false);
  };

  // Update last profile access when profile is clicked
  useEffect(() => {
    const handleProfileClick = () => {
      handleProfileAccess();
    };
    
    // Listen for profile icon clicks
    document.addEventListener('profile-click', handleProfileClick);
    return () => document.removeEventListener('profile-click', handleProfileClick);
  }, []);

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert className="border-yellow-200 bg-yellow-50 relative">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-yellow-100"
        >
          <X className="h-3 w-3" />
        </Button>
        <AlertDescription className="text-yellow-800 pr-8">
          Get better matches by completing your registration
          <Button
            variant="link"
            onClick={() => {
              handleProfileAccess();
              onProfileClick();
            }}
            className="p-0 h-auto text-yellow-600 underline ml-2"
          >
            Complete Profile
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}