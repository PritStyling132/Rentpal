import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, uploadApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload } from 'lucide-react';

interface ProfileEditDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ProfileEditDialog = ({ open: controlledOpen, onOpenChange }: ProfileEditDialogProps = {}) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user && open) {
      loadProfile();
    }
  }, [user, open]);

  const loadProfile = async () => {
    if (!user) return;

    // Use profile from context if available, otherwise fetch
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || ''
      });
    } else {
      try {
        const data = await usersApi.getMe();
        setFormData({
          name: data.name || '',
          email: user.email || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const result = await uploadApi.uploadAvatar(file);

      setFormData(prev => ({ ...prev, avatarUrl: result.url }));

      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || 'Failed to upload image',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await usersApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl || undefined,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      setOpen(false);
      // Refresh profile in context instead of page reload
      if (refreshProfile) {
        await refreshProfile();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || 'Failed to update profile',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.avatarUrl && (
                <img
                  src={formData.avatarUrl}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              )}
              <div className="flex-1">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a profile picture
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#E5383B] hover:bg-[#E5383B]/90"
              disabled={loading || uploading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
