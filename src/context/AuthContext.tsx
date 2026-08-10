import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'STUDENT' | 'TUTOR' | 'PARENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  grade?: string;
  bio?: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (payload: { fullName?: string; avatarUrl?: string; bio?: string }) => Promise<AuthUser>;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  grade?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data as AuthUser;
    } catch (err) {
      console.error('Exception fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(user => {
          setCurrentUser(user);
          setIsLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await fetchUserProfile(session.user.id);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = useCallback(async (payload: { fullName?: string; avatarUrl?: string; bio?: string }): Promise<AuthUser> => {
    if (!currentUser) throw new Error('No authenticated user to update.');
    
    const { data, error } = await supabase
      .from('User')
      .update(payload)
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    const updatedUser = data as AuthUser;
    setCurrentUser(updatedUser);
    return updatedUser;
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Login failed');

      const userProfile = await fetchUserProfile(authData.user.id);
      if (!userProfile) throw new Error('Could not retrieve user profile from database.');
      
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      if (payload.role === 'TUTOR' && !payload.email.toLowerCase().endsWith('@komarovi.edu.ge')) {
        throw new Error('Signups are restricted to official Komarovi school email addresses (@komarovi.edu.ge).');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: payload.email, 
        password: payload.password 
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Registration failed');

      // Create User Profile
      const { data: userInsert, error: userError } = await supabase
        .from('User')
        .insert({
          id: authData.user.id,
          email: payload.email,
          passwordHash: 'managed-by-supabase-auth',
          fullName: payload.fullName,
          role: payload.role,
          grade: payload.grade || null,
        })
        .select()
        .single();

      if (userError) throw new Error(userError.message);

      // Create Tutor Profile if applicable
      if (payload.role === 'TUTOR') {
        const { error: tutorError } = await supabase
          .from('TutorProfile')
          .insert({
            userId: authData.user.id,
            headline: 'Mentora Academic Tutor',
            bio: 'I am a new tutor on Mentora.',
            hourlyRate: 15,
            institution: 'Komarovi Campus',
            degree: 'Undergraduate',
            graduationYear: new Date().getFullYear() + 4,
          });
        
        if (tutorError) throw new Error(tutorError.message);
      }

      const newUser = userInsert as AuthUser;
      setCurrentUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

