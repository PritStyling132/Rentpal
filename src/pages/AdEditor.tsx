import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trash2, Plus, Edit, Upload } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  display_order: number;
}

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  display_duration: number;
  active: boolean;
}

const AdEditor = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    id: '',
    title: '',
    image_url: '',
    link_url: '',
    active: true,
    display_order: 0,
  });

  // Ad form state
  const [adForm, setAdForm] = useState({
    id: '',
    title: '',
    description: '',
    image_url: '',
    video_url: '',
    link_url: '',
    display_duration: 5,
    active: true,
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchBanners();
    fetchAds();
  }, [user, isAdmin, navigate]);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setBanners(data);
  };

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAds(data);
  };

  const handleBannerImageUpload = async (file: File) => {
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-content')
        .getPublicUrl(filePath);

      setBannerForm({ ...bannerForm, image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdImageUpload = async (file: File) => {
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-content')
        .getPublicUrl(filePath);

      setAdForm({ ...adForm, image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image_url) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (bannerForm.id) {
        // Update existing banner
        const { error } = await supabase
          .from('banners')
          .update({
            title: bannerForm.title,
            image_url: bannerForm.image_url,
            link_url: bannerForm.link_url || null,
            active: bannerForm.active,
            display_order: bannerForm.display_order,
          })
          .eq('id', bannerForm.id);

        if (error) throw error;
        toast({ title: "Banner updated successfully" });
      } else {
        // Create new banner
        const { error } = await supabase
          .from('banners')
          .insert({
            title: bannerForm.title,
            image_url: bannerForm.image_url,
            link_url: bannerForm.link_url || null,
            active: bannerForm.active,
            display_order: bannerForm.display_order,
            created_by: user?.id,
          });

        if (error) throw error;
        toast({ title: "Banner created successfully" });
      }

      // Reset form and refresh
      setBannerForm({
        id: '',
        title: '',
        image_url: '',
        link_url: '',
        active: true,
        display_order: 0,
      });
      fetchBanners();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Failed to save banner", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveAd = async () => {
    if (!adForm.title || (!adForm.image_url && !adForm.video_url)) {
      toast({ title: "Please fill title and add image or video", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (adForm.id) {
        // Update existing ad
        const { error } = await supabase
          .from('ads')
          .update({
            title: adForm.title,
            description: adForm.description || null,
            image_url: adForm.image_url || null,
            video_url: adForm.video_url || null,
            link_url: adForm.link_url || null,
            display_duration: adForm.display_duration,
            active: adForm.active,
          })
          .eq('id', adForm.id);

        if (error) throw error;
        toast({ title: "Ad updated successfully" });
      } else {
        // Create new ad
        const { error } = await supabase
          .from('ads')
          .insert({
            title: adForm.title,
            description: adForm.description || null,
            image_url: adForm.image_url || null,
            video_url: adForm.video_url || null,
            link_url: adForm.link_url || null,
            display_duration: adForm.display_duration,
            active: adForm.active,
            created_by: user?.id,
          });

        if (error) throw error;
        toast({ title: "Ad created successfully" });
      }

      // Reset form and refresh
      setAdForm({
        id: '',
        title: '',
        description: '',
        image_url: '',
        video_url: '',
        link_url: '',
        display_duration: 5,
        active: true,
      });
      fetchAds();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Failed to save ad", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Banner deleted successfully" });
      fetchBanners();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Failed to delete banner", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Ad deleted successfully" });
      fetchAds();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Failed to delete ad", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const editBanner = (banner: Banner) => {
    setBannerForm({
      id: banner.id,
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      active: banner.active,
      display_order: banner.display_order,
    });
  };

  const editAd = (ad: Ad) => {
    setAdForm({
      id: ad.id,
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      video_url: ad.video_url || '',
      link_url: ad.link_url || '',
      display_duration: ad.display_duration,
      active: ad.active,
    });
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
            Ad & Banner Editor
          </h1>
          <p className="text-muted-foreground">
            Manage promotional banners and popup advertisements
          </p>
        </div>

        <Tabs defaultValue="banners" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="ads">Popup Ads</TabsTrigger>
          </TabsList>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">
                {bannerForm.id ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="banner-title">Title *</Label>
                  <Input
                    id="banner-title"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>

                <div>
                  <Label>Banner Image *</Label>
                  <div className="space-y-2">
                    {bannerForm.image_url && (
                      <img src={bannerForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    )}
                    <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-primary transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerImageUpload(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <Upload className="w-8 h-8 text-primary" />
                        <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="banner-link">Link URL (Optional)</Label>
                  <Input
                    id="banner-link"
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="banner-order">Display Order</Label>
                  <Input
                    id="banner-order"
                    type="number"
                    value={bannerForm.display_order}
                    onChange={(e) => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={bannerForm.active}
                    onCheckedChange={(checked) => setBannerForm({ ...bannerForm, active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveBanner} disabled={loading}>
                    {bannerForm.id ? 'Update Banner' : 'Create Banner'}
                  </Button>
                  {bannerForm.id && (
                    <Button
                      variant="outline"
                      onClick={() => setBannerForm({
                        id: '',
                        title: '',
                        image_url: '',
                        link_url: '',
                        active: true,
                        display_order: 0,
                      })}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Banners List */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Existing Banners</h2>
              <div className="space-y-4">
                {banners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No banners yet</p>
                ) : (
                  banners.map((banner) => (
                    <div key={banner.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{banner.title}</h3>
                        <p className="text-sm text-muted-foreground">Order: {banner.display_order}</p>
                        <p className="text-sm">
                          Status: <span className={banner.active ? 'text-accent' : 'text-destructive'}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editBanner(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBanner(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">
                {adForm.id ? 'Edit Popup Ad' : 'Create New Popup Ad'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ad-title">Title *</Label>
                  <Input
                    id="ad-title"
                    value={adForm.title}
                    onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                    placeholder="Ad title"
                  />
                </div>

                <div>
                  <Label htmlFor="ad-description">Description</Label>
                  <Textarea
                    id="ad-description"
                    value={adForm.description}
                    onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                    placeholder="Ad description"
                  />
                </div>

                <div>
                  <Label>Ad Image</Label>
                  <div className="space-y-2">
                    {adForm.image_url && (
                      <img src={adForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    )}
                    <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-primary transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdImageUpload(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <Upload className="w-8 h-8 text-primary" />
                        <p className="text-sm text-muted-foreground">Click to upload ad image</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ad-video">Video URL (YouTube, etc.)</Label>
                  <Input
                    id="ad-video"
                    value={adForm.video_url}
                    onChange={(e) => setAdForm({ ...adForm, video_url: e.target.value })}
                    placeholder="https://youtube.com/embed/..."
                  />
                </div>

                <div>
                  <Label htmlFor="ad-link">Click Link URL</Label>
                  <Input
                    id="ad-link"
                    value={adForm.link_url}
                    onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="ad-duration">Display Duration (seconds)</Label>
                  <Input
                    id="ad-duration"
                    type="number"
                    value={adForm.display_duration}
                    onChange={(e) => setAdForm({ ...adForm, display_duration: parseInt(e.target.value) || 5 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={adForm.active}
                    onCheckedChange={(checked) => setAdForm({ ...adForm, active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveAd} disabled={loading}>
                    {adForm.id ? 'Update Ad' : 'Create Ad'}
                  </Button>
                  {adForm.id && (
                    <Button
                      variant="outline"
                      onClick={() => setAdForm({
                        id: '',
                        title: '',
                        description: '',
                        image_url: '',
                        video_url: '',
                        link_url: '',
                        display_duration: 5,
                        active: true,
                      })}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Ads List */}
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Existing Ads</h2>
              <div className="space-y-4">
                {ads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No ads yet</p>
                ) : (
                  ads.map((ad) => (
                    <div key={ad.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {ad.image_url && (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground">{ad.description}</p>
                        <p className="text-sm">Duration: {ad.display_duration}s</p>
                        <p className="text-sm">
                          Status: <span className={ad.active ? 'text-accent' : 'text-destructive'}>
                            {ad.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editAd(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAd(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdEditor;
