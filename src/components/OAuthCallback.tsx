import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          try {
            // Ensure user has proper profile and role setup
            // @ts-expect-error: 'ensure_user_setup' is a custom Postgres function not yet in TypeScript types
            await supabase.rpc('ensure_user_setup', {
              user_id: data.session.user.id
            });
            toast({
              title: "Welcome!",
              description: "Successfully logged in with Google",
            });
            setTimeout(async () => {
              try {
                await supabase.rpc('update_user_activity');
                await supabase.from('user_activity_logs').insert({
                  user_id: data.session!.user.id,
                  action: 'USER_LOGIN',
                  details: {
                    email: data.session!.user.email,
                    provider: 'google',
                    timestamp: new Date().toISOString()
                  }
                });
                await supabase.rpc('sync_top_profiles');
              } catch (logError) {
                console.error('Error logging OAuth login:', logError);
              }
            }, 100);
            
            navigate('/listings');
          } catch (setupError) {
            console.error('Error ensuring user setup:', setupError);
            toast({
              title: "Welcome!",
              description: "Successfully logged in with Google",
            });
            navigate('/listings');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication failed",
          description: "Failed to process Google login",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing your login...</p>
      </div>
    </div>
  );
};
export default OAuthCallback;
