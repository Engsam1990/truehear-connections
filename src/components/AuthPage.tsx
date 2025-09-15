import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Mail, Lock, User, Calendar, MapPin } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    name: "",
    birthdate: "",
    gender: "",
    location: "",
    relationship_status: "",
    having_kid: "",
    need_kids: "",
    education_level: "",
    professionalism: "",
    alcoholism: "",
    smoker: "",
    height: "",
    weight: "",
    preferred_age_from: "",
    preferred_age_to: "",
    reasons: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back! 💕",
        description: "Successfully logged in to TrueHear",
      });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: signupData.name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create member profile
        const { error: profileError } = await supabase
          .from('members')
          .insert({
            user_id: data.user.id,
            name: signupData.name,
            email: signupData.email,
            password: '', // Password handled by auth
            birthdate: signupData.birthdate,
            gender: signupData.gender,
            location: signupData.location,
            relationship_status: signupData.relationship_status,
            having_kid: signupData.having_kid,
            need_kids: signupData.need_kids,
            education_level: signupData.education_level,
            professionalism: signupData.professionalism,
            alcoholism: signupData.alcoholism,
            smoker: signupData.smoker,
            height: signupData.height,
            weight: signupData.weight,
            preferred_age_from: signupData.preferred_age_from,
            preferred_age_to: signupData.preferred_age_to,
            reasons: signupData.reasons,
            confirmation_code: Math.random().toString(36).substring(7),
            confirmed: 'no',
            subscription: 'free',
            get_news: 'yes',
            remember_token: ''
          });

        if (profileError) throw profileError;
      }

      toast({
        title: "Welcome to TrueHear! 💖",
        description: "Your account has been created successfully",
      });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-background/95">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary mr-2 fill-current" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TrueHear
            </h1>
          </div>
          <p className="text-muted-foreground">
            Find your perfect match
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="Your name"
                      className="pl-10"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-birthdate">Birthdate</Label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="signup-birthdate"
                      type="date"
                      className="pl-10"
                      value={signupData.birthdate}
                      onChange={(e) => setSignupData({...signupData, birthdate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">Gender</Label>
                  <select
                    id="signup-gender"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={signupData.gender}
                    onChange={(e) => setSignupData({...signupData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-location">Location</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="signup-location"
                      placeholder="City, Country"
                      className="pl-10"
                      value={signupData.location}
                      onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional fields with defaults for quick signup */}
              <input type="hidden" value="single" onChange={(e) => setSignupData({...signupData, relationship_status: e.target.value})} />
              <input type="hidden" value="no" onChange={(e) => setSignupData({...signupData, having_kid: e.target.value})} />
              <input type="hidden" value="maybe" onChange={(e) => setSignupData({...signupData, need_kids: e.target.value})} />
              <input type="hidden" value="college" onChange={(e) => setSignupData({...signupData, education_level: e.target.value})} />
              <input type="hidden" value="employed" onChange={(e) => setSignupData({...signupData, professionalism: e.target.value})} />
              <input type="hidden" value="social" onChange={(e) => setSignupData({...signupData, alcoholism: e.target.value})} />
              <input type="hidden" value="no" onChange={(e) => setSignupData({...signupData, smoker: e.target.value})} />
              <input type="hidden" value="170cm" onChange={(e) => setSignupData({...signupData, height: e.target.value})} />
              <input type="hidden" value="70kg" onChange={(e) => setSignupData({...signupData, weight: e.target.value})} />
              <input type="hidden" value="25" onChange={(e) => setSignupData({...signupData, preferred_age_from: e.target.value})} />
              <input type="hidden" value="35" onChange={(e) => setSignupData({...signupData, preferred_age_to: e.target.value})} />
              <input type="hidden" value="Looking for genuine connections" onChange={(e) => setSignupData({...signupData, reasons: e.target.value})} />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};