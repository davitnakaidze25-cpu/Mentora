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
      // ── 1. Client-side email domain guard for Tutors ──
      if (payload.role === 'TUTOR' && !payload.email.toLowerCase().endsWith('@students.gov.ge')) {
        throw new Error('Tutors must use a valid @students.gov.ge email address.');
      }

      // ── 2. Create the Supabase Auth user, passing metadata so DB triggers can use it ──
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName,
            role: payload.role,
            grade: payload.grade ?? null,
          },
        },
      });

      if (authError) {
        console.error('[Mentora] Supabase signUp error:', authError);
        throw new Error(authError.message);
      }
      if (!authData.user) {
        throw new Error('Registration failed: Supabase did not return a user object.');
      }

      // ── 3. Insert into the custom User table (only after auth succeeds) ──
      // Use upsert/fallback select to handle conflicts gracefully if the database trigger already inserted the user profile.
      let userInsert: any = null;
      let userError: any = null;
      try {
        const res = await supabase
          .from('User')
          .upsert({
            id: authData.user.id,
            email: payload.email,
            passwordHash: 'managed-by-supabase-auth',
            fullName: payload.fullName,
            role: payload.role,
            grade: payload.grade || null,
          }, {
            onConflict: 'id'
          })
          .select()
          .single();
        userInsert = res.data;
        userError = res.error;
      } catch (err) {
        console.warn('[Mentora] Custom User upsert exception, attempting select fallback:', err);
      }

      // If upsert failed, attempt to fetch the pre-created profile row (e.g. from trigger)
      if (!userInsert) {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (data) {
          userInsert = data;
          userError = null;
        } else {
          userError = error || new Error('Failed to retrieve or create user profile.');
        }
      }

      if (userError) {
        console.error('[Mentora] User profile retrieval/creation failed:', userError);
        throw new Error(`Profile creation failed: ${userError.message}`);
      }

      // ── 4. Create TutorProfile row if role is TUTOR ──
      if (payload.role === 'TUTOR') {
        const { error: tutorError } = await supabase
          .from('TutorProfile')
          .upsert({
            userId: authData.user.id,
            headline: 'Mentora Academic Tutor',
            bio: 'I am a new tutor on Mentora.',
            hourlyRate: 15,
            institution: 'Komarovi Campus',
            degree: 'Undergraduate',
            graduationYear: new Date().getFullYear() + 4,
          }, {
            onConflict: 'userId'
          });

        if (tutorError) {
          console.error('[Mentora] TutorProfile insert error:', tutorError);
          throw new Error(`Tutor profile creation failed: ${tutorError.message}`);
        }
      }

      const newUser = userInsert as AuthUser;
      setCurrentUser(newUser);
      return newUser;
    } catch (err: any) {
      // Re-throw so callers (AuthModal) can display the message in the UI
      console.error('[Mentora] register() exception:', err);
      throw err;
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

