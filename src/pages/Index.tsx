import { useState, useEffect } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MatchModal } from "@/components/MatchModal";
import { ChatList } from "@/components/ChatList";
import { AuthPage } from "@/components/AuthPage";
import { Onboarding } from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles, Users, MessageSquare, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Mock data - will be replaced with actual database calls
const mockProfiles = [
  {
    id: 1,
    name: "Emma",
    age: 28,
    location: "New York, NY",
    about_me: "Love hiking, photography, and trying new coffee shops. Looking for genuine connections and someone who shares my love for adventure.",
    images: [],
    profession: "Graphic Designer",
    education: "NYU Graduate"
  },
  {
    id: 2,
    name: "Alex",
    age: 30,
    location: "Los Angeles, CA",
    about_me: "Fitness enthusiast and dog lover. Enjoy weekend getaways and cooking Italian food.",
    images: [],
    profession: "Software Engineer",
    education: "UCLA"
  },
  {
    id: 3,
    name: "Maya",
    age: 26,
    location: "Chicago, IL",
    about_me: "Artist by day, dancer by night. Always looking for new experiences and meaningful conversations.",
    images: [],
    profession: "Art Teacher",
    education: "Art Institute of Chicago"
  }
];

const mockChats = [
  {
    id: "1",
    user: { id: 1, name: "Emma", image: "" },
    lastMessage: "Hey! How's your day going?",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    isNewMatch: false
  },
  {
    id: "2",
    user: { id: 2, name: "Alex", image: "" },
    isNewMatch: true
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { user, session, loading, signOut } = useAuth();

  // Fetch user's member profile
  useEffect(() => {
    if (user) {
      fetchCurrentMember();
      fetchProfiles();
      fetchChats();
    }
  }, [user]);

  const fetchCurrentMember = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setCurrentMember(data);
      // Check if profile needs completion - require all essential fields
      const needsCompletion = !data.about_me || !data.reasons || 
                             !data.relationship_status || !data.professionalism ||
                             !data.education_level || !data.height || !data.weight;
      if (needsCompletion) {
        setShowOnboarding(true);
      }
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .neq('user_id', user.id)
      .limit(10);
    
    if (data) {
      setProfiles(data);
    }
  };

  const fetchChats = async () => {
    if (!currentMember) return;
    
    // For now, use mock data - will implement real chat functionality later
    setChats(mockChats);
  };

  // Show auth page if not logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse fill-current" />
          <p className="text-muted-foreground">Loading TrueHearted...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} />;
  }

  if (showOnboarding) {
    return (
      <Onboarding 
        currentMember={currentMember}
        onComplete={() => {
          setShowOnboarding(false);
          fetchCurrentMember(); // Refresh member data
        }}
      />
    );
  }

  const handleLike = async (profileId: string) => {
    if (!currentMember) return;
    
    const profile = profiles[currentProfileIndex];
    
    // Send like to database
    const { error } = await supabase
      .from('likes')
      .insert({
        sent_from: currentMember.id,
        sent_to: profileId,
        like_type: 'like'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if it's a match (they already liked us)
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('sent_from', profileId)
      .eq('sent_to', currentMember.id)
      .single();
    
    if (existingLike) {
      setMatchedUser({
        name: profile.name,
        image: ""
      });
      setShowMatchModal(true);
      
      toast({
        title: "It's a Match! 💖",
        description: `You and ${profile.name} liked each other!`,
      });
    } else {
      toast({
        title: "Like sent! 💕",
        description: `You liked ${profile.name}. Keep swiping to find more matches!`,
      });
    }
    
    nextProfile();
  };

  const handlePass = (profileId: string) => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      // Reset or load more profiles
      setCurrentProfileIndex(0);
      toast({
        title: "You've seen everyone for now!",
        description: "Check back later for more profiles.",
      });
    }
  };

  const handleSendMessage = (message: string) => {
    toast({
      title: "Message sent! 💬",
      description: "Your conversation has started!",
    });
  };

  const handleChatSelect = (chat: any) => {
    toast({
      title: "Chat feature coming soon!",
      description: "Full messaging will be available in the next update.",
    });
  };

  const renderDiscoverTab = () => {
    if (profiles.length === 0 || currentProfileIndex >= profiles.length) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 text-center max-w-sm">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No more profiles</h3>
            <p className="text-muted-foreground mb-4">
              You've seen everyone in your area. Check back later for new profiles!
            </p>
            <Button 
              onClick={() => setCurrentProfileIndex(0)}
              className="bg-gradient-to-r from-primary to-accent"
            >
              Review profiles again
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <ProfileCard
          profile={profiles[currentProfileIndex]}
          onLike={handleLike}
          onPass={handlePass}
        />
      </div>
    );
  };

  const renderLikesTab = () => (
    <div className="flex-1 p-6">
      <div className="text-center mb-8">
        <Heart className="w-16 h-16 text-primary mx-auto mb-4 fill-current" />
        <h2 className="text-2xl font-bold mb-2">Your Likes</h2>
        <p className="text-muted-foreground">
          People who liked you will appear here
        </p>
      </div>
      
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No likes yet</h3>
        <p className="text-muted-foreground text-sm">
          Keep swiping to increase your chances of getting likes!
        </p>
      </Card>
    </div>
  );

  const renderMessagesTab = () => (
    <div className="flex-1 p-6">
      <ChatList chats={chats} onChatSelect={handleChatSelect} />
    </div>
  );

  const renderProfileTab = () => (
    <div className="flex-1 p-6">
      <div className="text-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
          Y
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
        <p className="text-muted-foreground">
          Complete your profile to get better matches
        </p>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Profile completion</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Add photos</span>
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Required</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Write bio</span>
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Required</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Add interests</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-primary to-accent"
          onClick={() => setShowOnboarding(true)}
        >
          Complete Profile
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border p-4 safe-area-pt">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TrueHearted
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {activeTab === "discover" && renderDiscoverTab()}
        {activeTab === "likes" && renderLikesTab()}
        {activeTab === "messages" && renderMessagesTab()}
        {activeTab === "profile" && renderProfileTab()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedUser={matchedUser || { name: "", image: "" }}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Index;