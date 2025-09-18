import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiscoverPageProps {
  currentMember: any;
  profileIncomplete: boolean;
}

interface DiscoverProfile {
  id: string;
  member_id: number;
  name: string;
  birthdate: string;
  gender: string;
  location: string;
  about_me: string;
  professionalism: string;
  education_level: string;
  images?: string[];
}

export function DiscoverPage({ currentMember, profileIncomplete }: DiscoverPageProps) {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSmartMessages, setShowSmartMessages] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [currentMember]);

  const fetchProfiles = async () => {
    if (!currentMember) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .neq('id', currentMember.id);

      // Filter by users with minimal required data
      query = query
        .not('reasons', 'is', null)
        .neq('reasons', '')
        .not('relationship_status', 'is', null)
        .neq('relationship_status', '');

      if (currentMember.gender && currentMember.gender !== 'prefer_not_to_say') {
        // Show opposite gender
        const oppositeGender = currentMember.gender === 'male' ? 'female' : 'male';
        query = query.eq('gender', oppositeGender);
      }

      // If profile is complete, apply smart matching
      if (!profileIncomplete && currentMember.preferred_age_from && currentMember.preferred_age_to) {
        const today = new Date();
        const minBirthYear = today.getFullYear() - parseInt(currentMember.preferred_age_to);
        const maxBirthYear = today.getFullYear() - parseInt(currentMember.preferred_age_from);
        
        query = query
          .gte('birthdate', `${minBirthYear}-01-01`)
          .lte('birthdate', `${maxBirthYear}-12-31`);
      }

      // Get member_id from current member
      const memberIdQuery = await supabase
        .from('user_mappings')
        .select('member_id')
        .eq('supabase_user_id', currentMember.user_id)
        .single();

      if (!memberIdQuery.data?.member_id) return;
      const memberIdNum = Number(memberIdQuery.data.member_id);

      // Exclude already liked/passed profiles
      const { data: interactions } = await supabase
        .from('likes')
        .select('sent_to')
        .eq('sent_from', memberIdNum);

      if (interactions && interactions.length > 0) {
        const interactedIds = interactions.map(i => i.sent_to);
        query = query.not('member_id', 'in', `(${interactedIds.join(',')})`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      // Fetch images for each profile
      const profilesWithImages = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: images } = await supabase
            .from('img_links')
            .select('img_id')
            .eq('member_id', profile.member_id)
            .order('is_primary', { ascending: false });

          const imageUrls = images?.map(img => {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(img.img_id);
            return publicUrl;
          }) || [];

          return {
            ...profile,
            images: imageUrls
          };
        })
      );

      setProfiles(profilesWithImages);
      setCurrentIndex(0);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentMember || !profiles[currentIndex]) return;

    try {
      // Get member_id from user_mappings
      const memberIdQuery = await supabase
        .from('user_mappings')
        .select('member_id')
        .eq('supabase_user_id', currentMember.user_id)
        .single();

      if (!memberIdQuery.data?.member_id) return;

      const { error } = await supabase
        .from('likes')
        .insert({
          sent_from: Number(memberIdQuery.data.member_id),
          sent_to: Number(profiles[currentIndex].member_id),
          like_type: 'like'
        });

      if (error) throw error;

      toast.success("Profile liked! 💕");
      nextProfile();
    } catch (error: any) {
      toast.error("Failed to like profile");
    }
  };

  const handlePass = async () => {
    if (!currentMember || !profiles[currentIndex]) return;

    try {
      // Get member_id from user_mappings
      const memberIdQuery = await supabase
        .from('user_mappings')
        .select('member_id')
        .eq('supabase_user_id', currentMember.user_id)
        .single();

      if (!memberIdQuery.data?.member_id) return;

      const { error } = await supabase
        .from('likes')
        .insert({
          sent_from: Number(memberIdQuery.data.member_id),
          sent_to: Number(profiles[currentIndex].member_id),
          like_type: 'pass'
        });

      if (error) throw error;

      nextProfile();
    } catch (error: any) {
      toast.error("Failed to record action");
    }
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Load more profiles
      fetchProfiles();
    }
  };

  const handleMessage = () => {
    if (profileIncomplete) {
      toast.error("Complete your profile to send messages", {
        description: "Get better matches by completing your registration",
      });
      return;
    }
    setShowSmartMessages(true);
  };

  const sendSmartMessage = async (message: string) => {
    if (!currentMember || !profiles[currentIndex]) return;

    try {
      // Get member_id from user_mappings
      const memberIdQuery = await supabase
        .from('user_mappings')
        .select('member_id')
        .eq('supabase_user_id', currentMember.user_id)
        .single();

      if (!memberIdQuery.data?.member_id) return;
      const senderMemberId = memberIdQuery.data.member_id;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: Number(senderMemberId),
          receiver_id: Number(profiles[currentIndex].member_id),
          message,
          chat_id: `${Math.min(Number(senderMemberId), Number(profiles[currentIndex].member_id))}_${Math.max(Number(senderMemberId), Number(profiles[currentIndex].member_id))}`
        });

      if (error) throw error;

      toast.success("Message sent! 💌");
      setShowSmartMessages(false);
      nextProfile();
    } catch (error: any) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding amazing people for you...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No more profiles to show</h3>
        <p className="text-muted-foreground mb-4">
          {profileIncomplete 
            ? "Complete your profile to see more matches!" 
            : "Check back later for new members"}
        </p>
        <Button onClick={fetchProfiles} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const age = currentProfile.birthdate ? 
    new Date().getFullYear() - new Date(currentProfile.birthdate).getFullYear() : 25;

  const smartMessages = [
    `Hi ${currentProfile.name}! I noticed we both value education and growth. I'd love to get to know you better!`,
    `Hello! Your profile caught my attention. What's your favorite way to spend weekends?`,
    `Hi there! I'm really impressed by your ${currentProfile.professionalism || 'career'}. Would love to chat and see if we connect!`,
    `Hey ${currentProfile.name}! Your interests seem really fascinating. Mind if we start a conversation?`
  ];

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        <div className="aspect-[4/5] bg-muted relative">
          {currentProfile.images && currentProfile.images.length > 0 ? (
            <img 
              src={currentProfile.images[0]} 
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-6xl font-bold">
              {currentProfile.name.charAt(0)}
            </div>
          )}
          
          {/* Profile incomplete overlay */}
          {profileIncomplete && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <p className="text-sm mb-2">Complete your profile to interact</p>
                <Button size="sm" variant="secondary">
                  Complete Profile
                </Button>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{currentProfile.name}, {age}</h2>
            <p className="text-muted-foreground">{currentProfile.location}</p>
            {currentProfile.professionalism && (
              <p className="text-sm text-muted-foreground mt-1">{currentProfile.professionalism}</p>
            )}
          </div>

          {currentProfile.about_me && (
            <div className="mb-4">
              <p className="text-sm leading-relaxed">{currentProfile.about_me}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handlePass}
              className="flex-1"
              disabled={profileIncomplete}
            >
              <X className="w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleMessage}
              className="flex-1"
              disabled={profileIncomplete}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            <Button
              size="lg"
              onClick={handleLike}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
              disabled={profileIncomplete}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Smart Messages Modal */}
          {showSmartMessages && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Smart Messages</h3>
                  </div>
                  <div className="space-y-2">
                    {smartMessages.map((message, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start h-auto p-3"
                        onClick={() => sendSmartMessage(message)}
                      >
                        <span className="text-sm">{message}</span>
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSmartMessages(false)}
                    className="w-full mt-3"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile counter */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {currentIndex + 1} of {profiles.length}
      </div>
    </div>
  );
}