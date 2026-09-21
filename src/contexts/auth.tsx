import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { OnboardingData, Profile } from "../types/auth";

// Complete any pending web browser authentication sessions (native only)
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

interface AuthContextType {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  devSignIn: (testEmail?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: (
    data: OnboardingData,
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error && error.code === "PGRST116") {
          // Profile does not exist yet; create it
          const newProfile: Partial<Profile> = {
            id: userId,
            name: "Learner",
            onboarding_completed: false,
            premium_status: false,
          };
          const { data: created, error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select("*")
            .single();

          if (insertError) {
            console.warn("Could not insert profile:", insertError.message);
            return null;
          }
          return created as Profile;
        }

        if (error) {
          console.warn("Error fetching profile:", error.message);
          return null;
        }

        return data as Profile;
      } catch (err) {
        console.warn("Unexpected profile fetch error:", err);
        return null;
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) {
      setProfile(p);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
      setIsInitialized(true);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      setIsLoading(true);

      if (Platform.OS === "web") {
        const redirectTo =
          typeof window !== "undefined" ? window.location.origin : undefined;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });
        if (error) return { error };
        return { error: null };
      }

      // Native (iOS/Android) via expo-auth-session
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "kubes",
        path: "auth/callback",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      if (!data?.url) {
        setIsLoading(false);
        return {
          error: new Error("No authorization URL returned from Supabase."),
        };
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (res.type === "success" && res.url) {
        const parsedUrl = new URL(res.url);
        // Extract hash params or query params (access_token, refresh_token)
        const params = new URLSearchParams(
          parsedUrl.hash ? parsedUrl.hash.substring(1) : parsedUrl.search,
        );
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            setIsLoading(false);
            return { error: sessionError };
          }
        }
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  /**
   * Dev/Mock Sign-In: Enables rapid developer testing of onboarding & dashboard
   * without requiring live Google OAuth credentials to be configured.
   */
  const devSignIn = async (
    testEmail = "test.user@kubes.app",
  ): Promise<{ error: Error | null }> => {
    try {
      setIsLoading(true);
      const mockUserId = "dev-user-00000000-0000-0000-0000-000000000001";
      const devUser = { id: mockUserId, email: testEmail };

      // Check if local dev profile exists or create mock
      let existingProfile: Profile | null = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", mockUserId)
          .single();
        if (data) existingProfile = data as Profile;
      } catch {
        // Fallback to local state if Supabase connection isn't reached
      }

      if (!existingProfile) {
        existingProfile = {
          id: mockUserId,
          name: "Kubes Explorer",
          avatar_url: null,
          goal: null,
          experience_level: null,
          interest_area: null,
          onboarding_completed: false,
          premium_status: false,
          premium_purchased_at: null,
          created_at: new Date().toISOString(),
        };
      }

      setUser(devUser);
      setProfile(existingProfile);
      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (
    data: OnboardingData,
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return {
        error: new Error("User must be signed in to complete onboarding."),
      };
    }

    try {
      setIsLoading(true);

      const updatePayload = {
        goal: data.goal,
        experience_level: data.experience_level,
        interest_area: data.interest_area,
        onboarding_completed: true,
      };

      // Attempt write to database
      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);

      if (error) {
        console.warn(
          "Supabase update error (falling back to memory state if local dev):",
          error.message,
        );
      }

      // Update in-memory profile state so UI is immediately unblocked
      setProfile((prev) => {
        if (!prev) {
          return {
            id: user.id,
            name: "Learner",
            avatar_url: null,
            goal: data.goal,
            experience_level: data.experience_level,
            interest_area: data.interest_area,
            onboarding_completed: true,
            premium_status: false,
            premium_purchased_at: null,
            created_at: new Date().toISOString(),
          };
        }
        return {
          ...prev,
          ...updatePayload,
        };
      });

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isInitialized,
        signInWithGoogle,
        devSignIn,
        signOut,
        completeOnboarding,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
