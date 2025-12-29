import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { termsSchema } from '@/lib/validation';

const TermsManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchCurrentTerms = async () => {
      try {
        const { data, error } = await supabase
          .from('terms_and_conditions')
          .select('content')
          .eq('active', true)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentTerms();
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate content
      const validatedData = termsSchema.parse({ content });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Deactivate all current terms
      await supabase
        .from('terms_and_conditions')
        .update({ active: false })
        .eq('active', true);

      // Get the latest version
      const { data: latestVersion } = await supabase
        .from('terms_and_conditions')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const newVersion = latestVersion ? latestVersion.version + 1 : 1;

      // Insert new terms
      const { error } = await supabase
        .from('terms_and_conditions')
        .insert({
          content: validatedData.content,
          version: newVersion,
          active: true,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Terms and conditions updated successfully',
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Error updating terms:', error);
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast({
            title: 'Validation Error',
            description: `${err.path.join('.')}: ${err.message}`,
            variant: 'destructive',
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update terms and conditions',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Manage Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Update the terms and conditions that users must agree to
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Terms and Conditions Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the terms and conditions..."
                  className="min-h-[400px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use markdown formatting for better readability. Each paragraph should be on a new line.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="premium"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Terms & Conditions'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsManagement;
