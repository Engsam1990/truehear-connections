import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MemberData {
  id: string;
  name: string;
  email: string;
  birthdate: string;
  gender: string;
  location: string;
  about_me: string;
  profession: string;
  education_level: string;
  relationship_status: string;
  having_kid: string;
  need_kids: string;
  height: string;
  weight: string;
  alcoholism: string;
  smoker: string;
  reasons: string;
  preferred_age_from: string;
  preferred_age_to: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMemberMapping = (user: User | null) => {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [isMapping, setIsMapping] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkMemberMapping();
    } else {
      setMemberData(null);
      setLoading(false);
    }
  }, [user]);

  const checkMemberMapping = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First check if mapping exists
      const { data: mapping, error: mappingError } = await supabase
        .from('user_mappings')
        .select('member_id')
        .eq('supabase_user_id', user.id)
        .single();

      if (mapping) {
        // Mapping exists, get member data
        const { data: memberData, error: memberError } = await supabase
          .rpc('get_current_member');

        if (memberData && memberData.length > 0) {
          setMemberData(memberData[0]);
        } else if (memberError) {
          console.error('Error fetching member data:', memberError);
        }
      } else {
        // No mapping exists, check if user has legacy member account by email
        const { data: existingMember, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'active')
          .single();

        if (existingMember) {
          // Create mapping for existing member
          await createUserMapping(existingMember.id);
        }
      }
    } catch (error) {
      console.error('Error checking member mapping:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserMapping = async (memberId: string) => {
    if (!user) return false;

    try {
      setIsMapping(true);
      
      const { error } = await supabase
        .from('user_mappings')
        .insert({
          supabase_user_id: user.id,
          member_id: memberId,
          migration_status: 'completed',
          migration_notes: 'Auto-mapped during login'
        });

      if (error) {
        console.error('Error creating user mapping:', error);
        toast({
          title: "Mapping Error",
          description: "Failed to link your account. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Refresh member data
      await checkMemberMapping();
      
      toast({
        title: "Account Linked",
        description: "Your account has been successfully linked!",
      });
      
      return true;
    } catch (error) {
      console.error('Error in createUserMapping:', error);
      return false;
    } finally {
      setIsMapping(false);
    }
  };

  const createNewMemberProfile = async (profileData: Partial<MemberData>) => {
    if (!user) return false;

    try {
      setIsMapping(true);

      // Create new member record
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
          name: profileData.name || user.user_metadata?.name || '',
          email: user.email || '',
          birthdate: profileData.birthdate,
          gender: profileData.gender,
          location: profileData.location || '',
          about_me: profileData.about_me || '',
          professionalism: profileData.profession || '',
          education_level: profileData.education_level || '',
          relationship_status: profileData.relationship_status || '',
          having_kid: profileData.having_kid || '',
          need_kids: profileData.need_kids || '',
          height: profileData.height || '',
          weight: profileData.weight || '',
          alcoholism: profileData.alcoholism || '',
          smoker: profileData.smoker || '',
          reasons: profileData.reasons || '',
          preferred_age_from: profileData.preferred_age_from || '18',
          preferred_age_to: profileData.preferred_age_to || '35',
          status: 'active',
          confirmation_code: '',
          password: ''
        })
        .select()
        .single();

      if (memberError) {
        console.error('Error creating member:', memberError);
        toast({
          title: "Profile Creation Error",
          description: "Failed to create your profile. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Create mapping
      const success = await createUserMapping(newMember.id);
      return success;
    } catch (error) {
      console.error('Error creating new member profile:', error);
      return false;
    } finally {
      setIsMapping(false);
    }
  };

  return {
    memberData,
    loading,
    isMapping,
    createUserMapping,
    createNewMemberProfile,
    refreshMemberData: checkMemberMapping
  };
};