import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// OAuth callback is no longer needed with custom JWT auth
// This component redirects to login
const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // OAuth is no longer supported - redirect to login
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
