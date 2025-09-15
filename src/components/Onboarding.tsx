import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Heart, Upload, X, Camera } from "lucide-react";

interface OnboardingProps {
  currentMember: any;
  onComplete: () => void;
}

export const Onboarding = ({ currentMember, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const totalSteps = 5; // Added photo step
  const progress = (step / totalSteps) * 100;

  const [profileData, setProfileData] = useState({
    relationship_status: currentMember?.relationship_status || '',
    having_kid: currentMember?.having_kid || '',
    need_kids: currentMember?.need_kids || '',
    education_level: currentMember?.education_level || '',
    professionalism: currentMember?.professionalism || '',
    alcoholism: currentMember?.alcoholism || '',
    smoker: currentMember?.smoker || '',
    height: currentMember?.height || '',
    weight: currentMember?.weight || '',
    preferred_age_from: currentMember?.preferred_age_from || '25',
    preferred_age_to: currentMember?.preferred_age_to || '35',
    reasons: currentMember?.reasons || '',
    about_me: currentMember?.about_me || ''
  });

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentMember?.user_id) return;

    if (uploadedPhotos.length + files.length > 5) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 5 photos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Please upload only JPG, PNG, or WebP images",
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload images smaller than 5MB",
            variant: "destructive",
          });
          continue;
        }

        const fileName = `${currentMember.user_id}/${Date.now()}-${i}.${file.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);

        // Save to img_links table
        const { error: dbError } = await supabase
          .from('img_links')
          .insert({
            member_id: currentMember.id,
            img_id: fileName,
            is_primary: uploadedPhotos.length === 0 && i === 0
          });

        if (dbError) throw dbError;
      }

      setUploadedPhotos(prev => [...prev, ...newPhotos]);
      
      toast({
        title: "Photos uploaded!",
        description: `${newPhotos.length} photo(s) added to your profile`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract filename from URL
      const fileName = photoUrl.split('/').pop()?.split('?')[0];
      if (!fileName) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove([`${currentMember.user_id}/${fileName}`]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('img_links')
        .delete()
        .eq('img_id', `${currentMember.user_id}/${fileName}`);

      if (dbError) throw dbError;

      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Photo removed",
        description: "Photo deleted from your profile",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    if (!currentMember?.id) {
      toast({
        title: "Error",
        description: "Member profile not found. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('members')
        .update(profileData)
        .eq('id', currentMember.id);

      if (error) throw error;

      toast({
        title: "Profile completed! 🎉",
        description: "Your profile is now ready to find matches",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">About Your Life</h2>
        <p className="text-muted-foreground">Help us understand your current situation</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Relationship Status</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.relationship_status}
            onChange={(e) => updateField('relationship_status', e.target.value)}
          >
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <Label>Do you have children?</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.having_kid}
            onChange={(e) => updateField('having_kid', e.target.value)}
          >
            <option value="">Select option</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <Label>Do you want children?</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.need_kids}
            onChange={(e) => updateField('need_kids', e.target.value)}
          >
            <option value="">Select option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
            <option value="open_to_discussion">Open to discussion</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Education & Career</h2>
        <p className="text-muted-foreground">Tell us about your professional life</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Education Level</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.education_level}
            onChange={(e) => updateField('education_level', e.target.value)}
          >
            <option value="">Select education</option>
            <option value="high_school">High School</option>
            <option value="college">College</option>
            <option value="university">University</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="trade_school">Trade School</option>
          </select>
        </div>

        <div>
          <Label>Profession</Label>
          <Input
            placeholder="e.g., Software Engineer, Teacher, Artist..."
            value={profileData.professionalism}
            onChange={(e) => updateField('professionalism', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Lifestyle & Preferences</h2>
        <p className="text-muted-foreground">Share your lifestyle choices</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Height</Label>
            <Input
              placeholder="e.g., 170cm"
              value={profileData.height}
              onChange={(e) => updateField('height', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Weight</Label>
            <Input
              placeholder="e.g., 65kg"
              value={profileData.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Drinking Habits</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.alcoholism}
            onChange={(e) => updateField('alcoholism', e.target.value)}
          >
            <option value="">Select option</option>
            <option value="no">Don't drink</option>
            <option value="social">Social drinker</option>
            <option value="occasional">Occasionally</option>
            <option value="regular">Regularly</option>
          </select>
        </div>

        <div>
          <Label>Smoking</Label>
          <select
            className="w-full p-3 border border-input rounded-lg bg-background mt-1"
            value={profileData.smoker}
            onChange={(e) => updateField('smoker', e.target.value)}
          >
            <option value="">Select option</option>
            <option value="no">Non-smoker</option>
            <option value="social">Social smoker</option>
            <option value="occasional">Occasionally</option>
            <option value="regular">Regular smoker</option>
          </select>
        </div>

        <div>
          <Label>Preferred Age Range</Label>
          <div className="flex gap-4 mt-1">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="From"
                value={profileData.preferred_age_from}
                onChange={(e) => updateField('preferred_age_from', e.target.value)}
              />
            </div>
            <div className="flex items-center">to</div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="To"
                value={profileData.preferred_age_to}
                onChange={(e) => updateField('preferred_age_to', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Add Your Photos</h2>
        <p className="text-muted-foreground">Upload up to 5 photos to show your personality</p>
      </div>

      <div className="space-y-4">
        {/* Photo Upload Area */}
        <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploading || uploadedPhotos.length >= 5}
          />
          <label 
            htmlFor="photo-upload" 
            className={`cursor-pointer ${uploadedPhotos.length >= 5 ? 'opacity-50' : ''}`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Uploading...' : 
               uploadedPhotos.length >= 5 ? 'Maximum 5 photos reached' :
               'Click to upload photos or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP up to 5MB each
            </p>
          </label>
        </div>

        {/* Photo Preview Grid */}
        {uploadedPhotos.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo, index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Photos are automatically checked for policy violations. Fake or inappropriate photos will be removed.
        </p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Tell Your Story</h2>
        <p className="text-muted-foreground">Share what makes you unique</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>What are you looking for?</Label>
          <Textarea
            placeholder="e.g., Looking for genuine connections, long-term relationship, someone to share adventures with..."
            value={profileData.reasons}
            onChange={(e) => updateField('reasons', e.target.value)}
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div>
          <Label>About Me</Label>
          <Textarea
            placeholder="Tell potential matches about yourself, your interests, hobbies, what makes you laugh..."
            value={profileData.about_me}
            onChange={(e) => updateField('about_me', e.target.value)}
            className="mt-1 min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-background/95">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-primary mr-2 fill-current" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {isLoading ? "Saving..." : "Complete Profile"}
            </Button>
          )}
        </div>

        {step === 1 && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="w-full mt-4 text-muted-foreground"
          >
            Skip for now
          </Button>
        )}
      </Card>
    </div>
  );
};