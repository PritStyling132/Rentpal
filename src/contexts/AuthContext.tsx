import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'owner' | 'admin';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  pinCode: string | null;
  avatarUrl: string | null;
  userType: 'user' | 'owner';
  businessName: string | null;
  businessAddress: string | null;
  gstNumber: string | null;
  ownerVerified: boolean;
  totalListings: number;
  totalRentalsCompleted: number;
  ownerRating: number | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  userType: 'user' | 'owner' | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; userType?: 'user' | 'owner' }>;
  signup: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pinCode: string;
    userType: 'user' | 'owner';
    businessName?: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  upgradeToOwner: (businessData: {
    businessName: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userType, setUserType] = useState<'user' | 'owner' | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const updateAuthState = useCallback((data: {
    user: User;
    profile: UserProfile | null;
    isAdmin: boolean;
    isOwner: boolean;
  }) => {
    setUser(data.user);
    setProfile(data.profile);
    setIsAdmin(data.isAdmin);
    setIsOwner(data.isOwner);
    setUserType(data.profile?.userType || 'user');
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsOwner(false);
    setUserType(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response.data.success && response.data.data) {
        const { user: userData, profile: profileData, isAdmin: adminStatus, isOwner: ownerStatus } = response.data.data;
        updateAuthState({
          user: userData,
          profile: profileData,
          isAdmin: adminStatus,
          isOwner: ownerStatus,
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [updateAuthState]);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.data.success && response.data.data) {
          const { user: userData, profile: profileData, isAdmin: adminStatus, isOwner: ownerStatus } = response.data.data;
          updateAuthState({
            user: userData,
            profile: profileData,
            isAdmin: adminStatus,
            isOwner: ownerStatus,
          });
        } else {
          clearTokens();
          clearAuthState();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        clearTokens();
        clearAuthState();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, [updateAuthState, clearAuthState]);

  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pinCode: string;
    userType: 'user' | 'owner';
    businessName?: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => {
    try {
      const response = await authApi.signup({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        pinCode: userData.pinCode,
        userType: userData.userType,
        businessName: userData.businessName,
        businessAddress: userData.businessAddress,
        gstNumber: userData.gstNumber,
      });

      if (!response.data.success) {
        toast({
          title: 'Signup failed',
          description: response.data.error || 'Unable to create account.',
          variant: 'destructive',
        });
        return false;
      }

      const { user: newUser, profile: newProfile, isAdmin: adminStatus, isOwner: ownerStatus, accessToken, refreshToken } = response.data.data;

      // Store tokens
      setTokens(accessToken, refreshToken);

      // Update state
      updateAuthState({
        user: newUser,
        profile: newProfile,
        isAdmin: adminStatus,
        isOwner: ownerStatus,
      });

      toast({
        title: 'Account created successfully!',
        description: `Welcome to RentPal${userData.userType === 'owner' ? ' as an Owner' : ''}!`,
      });

      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Something went wrong while signing up.';
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (!response.data.success) {
        toast({
          title: 'Login failed',
          description: response.data.error || 'Invalid credentials.',
          variant: 'destructive',
        });
        return { success: false };
      }

      const { user: loggedInUser, profile: userProfile, isAdmin: adminStatus, isOwner: ownerStatus, accessToken, refreshToken } = response.data.data;

      // Store tokens
      setTokens(accessToken, refreshToken);

      // Update state
      updateAuthState({
        user: loggedInUser,
        profile: userProfile,
        isAdmin: adminStatus,
        isOwner: ownerStatus,
      });

      const detectedUserType = userProfile?.userType || 'user';

      toast({
        title: 'Welcome back!',
        description: `You are now logged in as ${detectedUserType === 'owner' ? 'an Owner' : 'a User'}.`,
      });

      return { success: true, userType: detectedUserType };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Unable to login. Please try again.';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      await authApi.logout(refreshToken || undefined);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      clearAuthState();

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const upgradeToOwner = async (businessData: {
    businessName: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => {
    if (!user?.id) return false;

    try {
      const response = await authApi.upgradeToOwner(businessData);

      if (!response.data.success) {
        toast({
          title: 'Upgrade failed',
          description: response.data.error || 'Could not upgrade your account to Owner.',
          variant: 'destructive',
        });
        return false;
      }

      const { user: updatedUser, profile: updatedProfile, isAdmin: adminStatus, isOwner: ownerStatus } = response.data.data;

      updateAuthState({
        user: updatedUser,
        profile: updatedProfile,
        isAdmin: adminStatus,
        isOwner: ownerStatus,
      });

      toast({
        title: 'Account upgraded!',
        description: 'You are now registered as an Owner. Start listing your items!',
      });

      return true;
    } catch (error: any) {
      console.error('Upgrade error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upgrade account.';
      toast({
        title: 'Upgrade failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isOwner,
        userType,
        authReady,
        login,
        signup,
        logout,
        upgradeToOwner,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
