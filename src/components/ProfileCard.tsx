import { useState } from "react";
import { Heart, X, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileCardProps {
  profile: {
    id: string;
    member_id: number;
    name: string;
    age?: number;
    birthdate?: string;
    location: string;
    about_me?: string;
    images?: string[];
    profession?: string;
    professionalism?: string;
    education?: string;
    education_level?: string;
  };
  onLike: (member_id: number) => void;
  onPass: (member_id: number) => void;
}

export const ProfileCard = ({ profile, onLike, onPass }: ProfileCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = profile.images || [];
  const age = profile.age || (profile.birthdate ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 0);
  const profession = profile.profession || profile.professionalism || '';
  const education = profile.education || profile.education_level || '';

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev < images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : images.length - 1
      );
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-card shadow-[var(--card-shadow)] overflow-hidden">
      <div className="relative h-96 bg-gradient-to-br from-love-soft to-background">
        {images.length > 0 && images[currentImageIndex] ? (
          <img
            src={images[currentImageIndex]}
            alt={`${profile.name}'s photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground text-6xl font-bold">
            {profile.name.charAt(0)}
          </div>
        )}
        
        {/* Image navigation */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex">
            <button
              onClick={prevImage}
              className="w-1/2 h-full opacity-0 hover:opacity-10 bg-gradient-to-r from-black transition-opacity"
            />
            <button
              onClick={nextImage}
              className="w-1/2 h-full opacity-0 hover:opacity-10 bg-gradient-to-l from-black transition-opacity"
            />
          </div>
        )}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">
            {profile.name}{age > 0 && `, ${age}`}
          </h2>
          <div className="flex items-center gap-1 text-sm opacity-90 mb-2">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </div>
          {profession && <p className="text-sm opacity-80 mb-1">{profession}</p>}
          {education && <p className="text-xs opacity-70">{education}</p>}
        </div>
      </div>

      {/* About section */}
      {profile.about_me && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {profile.about_me}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 p-6 pt-2">
        <Button
          onClick={() => onPass(profile.member_id)}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-2 hover:bg-destructive/10 hover:border-destructive"
        >
          <X className="w-6 h-6 text-destructive" />
        </Button>
        <Button
          onClick={() => onLike(profile.member_id)}
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--button-shadow)] transition-all duration-300 transform hover:scale-105"
        >
          <Heart className="w-6 h-6 fill-current" />
        </Button>
      </div>
    </Card>
  );
};