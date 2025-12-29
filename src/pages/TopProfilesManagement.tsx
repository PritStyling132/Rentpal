import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TopProfilesManagement = () => {
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    streak: 0,
    display_order: 0,
    active: true,
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-top-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('top_profiles')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: visibility } = useQuery({
    queryKey: ['section-visibility', 'top_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_visibility')
        .select('*')
        .eq('section_name', 'top_profiles')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async (isVisible: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('section_visibility')
        .update({ is_visible: isVisible, updated_by: user?.id })
        .eq('section_name', 'top_profiles');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-visibility'] });
      toast.success('Visibility updated');
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (profile: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingProfile) {
        const { error } = await supabase
          .from('top_profiles')
          .update({ ...profile, created_by: user?.id })
          .eq('id', editingProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('top_profiles')
          .insert([{ ...profile, user_id: user?.id, created_by: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-top-profiles'] });
      toast.success(editingProfile ? 'Profile updated' : 'Profile added');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('top_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-top-profiles'] });
      toast.success('Profile deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatar_url: '',
      streak: 0,
      display_order: 0,
      active: true,
    });
    setEditingProfile(null);
  };

  const handleEdit = (profile: any) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar_url: profile.avatar_url,
      streak: profile.streak,
      display_order: profile.display_order,
      active: profile.active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Top Profiles Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="section-visible">Show Section</Label>
            <Switch
              id="section-visible"
              checked={visibility?.is_visible}
              onCheckedChange={(checked) => toggleVisibility.mutate(checked)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProfile ? 'Edit Profile' : 'Add Profile'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar_url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="streak">Streak</Label>
                  <Input
                    id="streak"
                    type="number"
                    value={formData.streak}
                    onChange={(e) =>
                      setFormData({ ...formData, streak: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button onClick={() => saveProfile.mutate(formData)} className="w-full">
                  {editingProfile ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">Streak: {profile.streak}</p>
                <p className="text-sm text-muted-foreground">
                  Order: {profile.display_order}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {profile.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(profile)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteProfile.mutate(profile.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopProfilesManagement;
