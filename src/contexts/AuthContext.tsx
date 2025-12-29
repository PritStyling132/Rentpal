import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pin_code: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
      else setIsAdmin(false);
      setAuthReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
      setAuthReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  // ✅ FIXED SIGNUP FUNCTION (no 422 error)
  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pin_code: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            pin_code: userData.pin_code,
          },
          // ✅ correct redirect key (Supabase v2)
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: 'Signup failed',
          description: error.message || 'Unable to create account.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Account created successfully 🎉',
        description: 'Please check your email to verify your account.',
      });

      return true;
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while signing up.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = (error.message || '').toLowerCase();
        const isUnconfirmed = message.includes('confirm') || message.includes('not confirmed');
        if (isUnconfirmed) {
          try {
            await supabase.auth.resend({
              type: 'signup',
              email,
              options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            toast({
              title: 'Verify your email',
              description: 'We resent the verification email. Please check your inbox.',
            });
          } catch (_) {
            // fall through to generic error toast
          }
        }
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Welcome back!',
        description: 'You are now logged in.',
      });

      if (data.user) {
        await supabase.rpc('update_user_activity');
        await supabase.from('user_activity_logs').insert({
          user_id: data.user.id,
          action: 'USER_LOGIN',
          details: {
            email,
            timestamp: new Date().toISOString(),
          },
        });
        await supabase.rpc('sync_top_profiles');
      }

      return true;
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: 'Unable to login. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    if (user?.id) {
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        action: 'USER_LOGOUT',
        details: { timestamp: new Date().toISOString() },
      });
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);

    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, authReady, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
