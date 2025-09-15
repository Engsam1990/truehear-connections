import { Heart, MessageCircle, User, Compass } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "discover", icon: Compass, label: "Discover" },
    { id: "likes", icon: Heart, label: "Likes" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 safe-area-pb">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${
                  isActive ? "fill-current" : ""
                }`} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};