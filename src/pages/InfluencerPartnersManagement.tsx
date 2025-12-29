import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { influencerPartnerSchema } from '@/lib/validation';
import { ImageUpload } from '@/components/ImageUpload';

const InfluencerPartnersManagement = () => {
  const queryClient = useQueryClient();
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    bio: '',
    followers_count: 0,
    platform: '',
    profile_url: '',
    display_order: 0,
    active: true,
  });

  const { data: partners, isLoading } = useQuery({
    queryKey: ['admin-influencer-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_partners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: visibility } = useQuery({
    queryKey: ['section-visibility', 'influencer_partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_visibility')
        .select('*')
        .eq('section_name', 'influencer_partners')
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
        .eq('section_name', 'influencer_partners');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-visibility'] });
      toast.success('Visibility updated');
    },
  });

  const savePartner = useMutation({
    mutationFn: async (partner: any) => {
      // Validate the partner data
      influencerPartnerSchema.parse(partner);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingPartner) {
        const { error } = await supabase
          .from('influencer_partners')
          .update({ ...partner, created_by: user?.id })
          .eq('id', editingPartner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('influencer_partners')
          .insert([{ ...partner, created_by: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencer-partners'] });
      toast.success(editingPartner ? 'Partner updated' : 'Partner added');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast.error(`${err.path.join('.')}: ${err.message}`);
        });
      } else {
        toast.error('Failed to save partner');
      }
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('influencer_partners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencer-partners'] });
      toast.success('Partner deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatar_url: '',
      bio: '',
      followers_count: 0,
      platform: '',
      profile_url: '',
      display_order: 0,
      active: true,
    });
    setEditingPartner(null);
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      avatar_url: partner.avatar_url,
      bio: partner.bio,
      followers_count: partner.followers_count,
      platform: partner.platform,
      profile_url: partner.profile_url,
      display_order: partner.display_order,
      active: partner.active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Influencer Partners Management</h1>
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
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPartner ? 'Edit Partner' : 'Add Partner'}
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
                  <Label>Profile Image</Label>
                  <ImageUpload
                    onImagesUploaded={(urls) => setFormData({ ...formData, avatar_url: urls[0] || '' })}
                    currentImages={formData.avatar_url ? [formData.avatar_url] : []}
                    userId="admin"
                    maxImages={1}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="followers_count">Followers Count</Label>
                  <Input
                    id="followers_count"
                    type="number"
                    value={formData.followers_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followers_count: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="profile_url">Profile URL</Label>
                  <Input
                    id="profile_url"
                    value={formData.profile_url}
                    onChange={(e) =>
                      setFormData({ ...formData, profile_url: e.target.value })
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
                <Button onClick={() => savePartner.mutate(formData)} className="w-full">
                  {editingPartner ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partners?.map((partner) => (
          <Card key={partner.id} className="p-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {partner.avatar_url && (
                <img 
                  src={partner.avatar_url} 
                  alt={partner.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{partner.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{partner.platform}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {partner.bio}
                </p>
                <p className="text-sm text-muted-foreground">
                  Followers: {partner.followers_count?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Order: {partner.display_order}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {partner.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex gap-2 self-start">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(partner)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deletePartner.mutate(partner.id)}
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

export default InfluencerPartnersManagement;
