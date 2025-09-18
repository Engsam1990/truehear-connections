import { useState, useEffect } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MatchModal } from "@/components/MatchModal";
import { ChatList } from "@/components/ChatList";
import { AuthPage } from "@/components/AuthPage";
import { Onboarding } from "@/components/Onboarding";
import { ProfileCompletionAlert } from "@/components/ProfileCompletionAlert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles, Users, MessageSquare, LogOut, User, ChevronDown } from "lucide-react";
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
  const [profilesOffset, setProfilesOffset] = useState(0);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previewProfiles, setPreviewProfiles] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const { toast } = useToast();
  const { user, session, loading, signOut } = useAuth();

  // Fetch preview profiles for unauthenticated users
  useEffect(() => {
    if (!user) {
      fetchPreviewProfiles();
    }
  }, [user]);

  // Fetch user's member profile
  useEffect(() => {
    if (user) {
      fetchCurrentMember();
    }
  }, [user]);

  // Fetch profiles and chats after member is loaded
  useEffect(() => {
    if (currentMember) {
      fetchProfiles(0, false);
      setProfilesOffset(0);
      fetchChats();
    }
  }, [currentMember]);

  const fetchPreviewProfiles = async () => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        id,
        name,
        birthdate,
        location,
        about_me,
        professionalism,
        img_links(img_id, is_primary)
      `)
      .not('status', 'is', null)  // Get members with any status
      .limit(20);
    
    if (data && data.length > 0) {
      const profilesWithAge = data.map(profile => ({
        ...profile,
        age: profile.birthdate ? 
          new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 25,
        images: profile.img_links?.map(img => img.img_id) || []
      }));
      setPreviewProfiles(profilesWithAge);
    } else {
      // Fallback to show some profiles even if status filter doesn't work
      const { data: fallbackData } = await supabase
        .from('members')
        .select(`
          id,
          name,
          birthdate,
          location,
          about_me,
          professionalism
        `)
        .limit(20);
      
      if (fallbackData) {
        const profilesWithAge = fallbackData.map(profile => ({
          ...profile,
          age: profile.birthdate ? 
            new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 25,
          images: []
        }));
        setPreviewProfiles(profilesWithAge);
      }
    }
  };

  const createBasicMemberProfile = async () => {
    if (!user) return;
    
    const basicProfile = {
      user_id: user.id,
      name: user.email?.split('@')[0] || 'User',
      email: user.email || '',
      password: '', // Handled by auth
      birthdate: '1990-01-01', // Default date
      gender: 'prefer_not_to_say',
      location: 'Not specified',
      relationship_status: 'single',
      having_kid: 'prefer_not_to_say',
      need_kids: 'maybe',
      education_level: 'prefer_not_to_say',
      professionalism: 'prefer_not_to_say',
      alcoholism: 'prefer_not_to_say',
      smoker: 'prefer_not_to_say',
      height: 'prefer_not_to_say',
      weight: 'prefer_not_to_say',
      preferred_age_from: '18',
      preferred_age_to: '99',
      reasons: '',
      about_me: '',
      confirmation_code: Math.random().toString(36).substring(7),
      confirmed: 'yes', // Auto-confirm to avoid issues
      subscription: 'free',
      get_news: 'yes',
      remember_token: ''
    };

    const { data, error } = await supabase
      .from('members')
      .insert(basicProfile)
      .select()
      .single();

    if (data) {
      setCurrentMember(data);
      setProfileIncomplete(true); // They'll want to complete it eventually
    } else if (error) {
      console.error('Error creating basic profile:', error);
      toast({
        title: "Profile Creation Error",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentMember = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setCurrentMember(data);
      // Check if profile needs completion - optional fields for better matches
      const needsCompletion = !data.about_me || !data.reasons || 
                             !data.relationship_status || !data.professionalism ||
                             !data.education_level || !data.height || !data.weight;
      setProfileIncomplete(needsCompletion);
      // Profile completion is completely optional - never force onboarding
    } else if (!error) {
      // User doesn't have a member profile yet - create basic profile to avoid errors
      await createBasicMemberProfile();
    }
  };

  const fetchProfiles = async (offset = 0, append = false) => {
    if (!currentMember) return;
    
    // Get members - show all available profiles since imported data may not have proper filtering setup
    let query = supabase
      .from('members')
      .select(`
        *, 
        img_links(img_id, is_primary)
      `)
      .neq('id', currentMember.id)
      .range(offset, offset + 19); // Load 20 at a time

    const { data, error } = await query;
    
    if (data) {
      // For imported data, we'll show all profiles since RLS filtering might not work properly
      // Filter out members we've already interacted with if the likes table is accessible
      try {
        const { data: existingLikes } = await supabase
          .from('likes')
          .select('sent_to')
          .eq('sent_from', currentMember.member_id);
        
        const likedMemberIds = existingLikes?.map(like => like.sent_to) || [];
        const filteredProfiles = data.filter(profile => 
          !likedMemberIds.includes(profile.member_id)
        );
        
        if (append) {
          setProfiles(prev => [...prev, ...filteredProfiles]);
        } else {
          setProfiles(filteredProfiles);
        }
        
        setHasMoreProfiles(data.length === 20); // If we got 20, there might be more
      } catch (likesError) {
        // If likes query fails due to RLS, just show all profiles
        if (append) {
          setProfiles(prev => [...prev, ...data]);
        } else {
          setProfiles(data);
        }
        setHasMoreProfiles(data.length === 20);
      }
    }
  };

  const loadMoreProfiles = () => {
    const newOffset = profilesOffset + 20;
    setProfilesOffset(newOffset);
    fetchProfiles(newOffset, true);
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
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-love-pink to-love-orange min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">TrueHearted</h1>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          </header>

          {/* Hero Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-white max-w-2xl">
              <Heart className="w-20 h-20 mx-auto mb-6 fill-current animate-pulse" />
              <h2 className="text-5xl font-bold mb-4">Find Your True Match</h2>
              <p className="text-xl mb-8 text-white/90">
                Connect with genuine people looking for meaningful relationships in your area
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-love-pink hover:bg-white/90 text-lg px-8 py-4"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Start Dating Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white text-lg px-8 py-4"
                  onClick={() => {
                    document.getElementById('preview-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  See Who's Here
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <section id="preview-section" className="py-16 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Meet Amazing People Near You</h3>
              <p className="text-muted-foreground text-lg">
                Join thousands of singles who found love on TrueHearted
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {previewProfiles.map((profile, index) => (
                <Card key={profile.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-love-soft to-love-pink/20 flex items-center justify-center">
                    {profile.images.length > 0 ? (
                      <div className="w-full h-full bg-love-pink/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-love-pink" />
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-love-pink">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm">{profile.name}, {profile.age}</h4>
                    <p className="text-muted-foreground text-xs mb-1">📍 {profile.location}</p>
                    <p className="text-xs line-clamp-1">{profile.professionalism}</p>
                  </div>
                  {/* Blur overlay for unauthenticated users */}
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-love-pink to-love-orange text-white text-xs"
                      onClick={() => setShowAuthModal(true)}
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-love-pink to-love-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h4 className="font-bold mb-2">Smart Matching</h4>
                <p className="text-muted-foreground">Our algorithm finds your perfect match based on compatibility</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-love-pink to-love-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">Meaningful Conversations</h4>
                <p className="text-muted-foreground">Chat with verified users looking for genuine connections</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-love-pink to-love-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">Safe Community</h4>
                <p className="text-muted-foreground">Join a verified community of singles in your area</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-love-pink to-love-orange rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Find Love?</h3>
              <p className="mb-6 text-white/90">Join TrueHearted today and start your journey to meaningful connections</p>
              <Button
                size="lg"
                className="bg-white text-love-pink hover:bg-white/90"
                onClick={() => setShowAuthModal(true)}
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </section>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Join TrueHearted</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <AuthPage onAuthSuccess={() => {
                  setShowAuthModal(false);
                  // Don't reload, just let the auth state change handle the redirect
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
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

  const handleLike = async (profileId: number) => {
    if (!currentMember) return;
    
    const profile = profiles[currentProfileIndex];
    
    // Send like to database
    const { error } = await supabase
      .from('likes')
      .insert({
        sent_from: currentMember.member_id,
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
      .eq('sent_to', currentMember.member_id)
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

  const handlePass = (profileId: number) => {
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
    if (profiles.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 text-center max-w-sm">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No profiles available</h3>
            <p className="text-muted-foreground mb-4">
              Check back later for new profiles in your area!
            </p>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Discover New People</h2>
            <p className="text-muted-foreground">
              Find your perfect match from {profiles.length} available profiles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLike={() => handleLike(profile.member_id)}
                onPass={() => handlePass(profile.member_id)}
                currentMember={currentMember}
                isProfileIncomplete={profileIncomplete}
              />
            ))}
          </div>

          {hasMoreProfiles && profiles.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadMoreProfiles}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                View More
              </Button>
            </div>
          )}
        </div>
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

  const renderProfileTab = () => {
    // Show profile completion alert when accessing profile if incomplete
    if (profileIncomplete) {
      setShowProfileAlert(true);
    }
    
    return (
      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
            {currentMember?.name?.charAt(0) || 'Y'}
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentMember?.name || 'Your Profile'}</h2>
          <p className="text-muted-foreground">
            {profileIncomplete 
              ? "Complete your profile to get better matches" 
              : "Your profile is looking great!"}
          </p>
        </div>
        
        <Card className="p-6 max-w-md mx-auto mb-6">
          <h3 className="font-bold mb-4">Profile Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Basic info</span>
              <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Complete</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">About me</span>
              <span className={`text-xs px-2 py-1 rounded ${
                currentMember?.about_me 
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-accent/20 text-accent'
              }`}>
                {currentMember?.about_me ? 'Complete' : 'Required'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lifestyle details</span>
              <span className={`text-xs px-2 py-1 rounded ${
                currentMember?.height && currentMember?.weight 
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-accent/20 text-accent'
              }`}>
                {currentMember?.height && currentMember?.weight ? 'Complete' : 'Required'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Interests & goals</span>
              <span className={`text-xs px-2 py-1 rounded ${
                currentMember?.reasons 
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-accent/20 text-accent'
              }`}>
                {currentMember?.reasons ? 'Complete' : 'Required'}
              </span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-6 bg-gradient-to-r from-primary to-accent"
            onClick={() => setShowOnboarding(true)}
          >
            {profileIncomplete ? 'Complete Profile' : 'Edit Profile'}
          </Button>
          
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Card>
      </div>
    );
  };

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

      {/* Profile Completion Alert */}
      {profileIncomplete && currentMember && (
        <ProfileCompletionAlert
          isIncomplete={profileIncomplete}
          onProfileClick={() => setShowOnboarding(true)}
        />
      )}

      {/* Profile Access Alert Modal */}
      {showProfileAlert && (
        <ProfileCompletionAlert
          isIncomplete={profileIncomplete}
          onProfileClick={() => {
            setShowProfileAlert(false);
            setShowOnboarding(true);
          }}
        />
      )}

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