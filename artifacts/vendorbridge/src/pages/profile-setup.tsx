import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdateUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabase";
import { UploadCloud, CheckCircle2, Phone, User as UserIcon, Camera } from "lucide-react";
import { Logo } from "@/components/logo";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect to login if no user
  if (!user) {
    setLocation('/login');
    return null;
  }

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 5) {
      toast({ variant: "destructive", title: "Invalid phone number", description: "Please enter a valid phone number." });
      return;
    }
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Image must be under 2MB." });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsUploading(true);
      let uploadedAvatarUrl = user.avatarUrl;

      // Upload to Supabase Storage if a new file was selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw new Error(uploadError.message || "Failed to upload image");
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        uploadedAvatarUrl = publicUrlData.publicUrl;
      }

      // Update user record via backend API
      // Since useUpdateUser generated types might lack 'phone'/'avatarUrl', we cast to any
      const updateData: any = { phone };
      if (uploadedAvatarUrl) {
        updateData.avatarUrl = uploadedAvatarUrl;
      }

      const response = await updateUserMutation.mutateAsync({
        id: user.id,
        data: updateData
      });

      // Update local auth context
      // Assuming login method overrides user state if we pass the same token
      const token = localStorage.getItem("vendorbridge_auth_token") || "";
      login(response, token);

      toast({
        title: "Profile setup complete!",
        description: "Your profile has been successfully updated.",
      });

      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "An error occurred while saving your profile.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-3xl tracking-tight">
            <Logo className="w-12 h-12 shrink-0" />
            <span>
              <span style={{ color: '#235A7B' }}>Vendor</span>
              <span style={{ color: '#79AE61' }}>Bridge</span>
            </span>
          </div>
        </div>

        <Card className="border-border shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
            <div className="bg-primary h-full transition-all duration-500 ease-out w-1/2" />
            <div className={`h-full transition-all duration-500 ease-out w-1/2 ${step === 2 ? 'bg-primary' : ''}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
                  <CardDescription className="text-center">
                    Let's start by verifying your contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Used for urgent procurement notifications</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handlePhoneSubmit}>
                    Continue to Step 2
                  </Button>
                </CardFooter>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Upload Profile Picture</CardTitle>
                  <CardDescription className="text-center">
                    Personalize your account with a photo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <div className="w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-sm">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-950">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">JPG or PNG. Max size 2MB.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={isUploading}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleFinalSubmit} disabled={isUploading}>
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Complete Setup <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {step === 2 && !isUploading && (
          <div className="mt-6 text-center">
            <button onClick={() => setLocation("/dashboard")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}