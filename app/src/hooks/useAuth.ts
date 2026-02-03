import { useState, useEffect, useCallback } from 'react';
import { signIn, signUp, signOut, getCurrentUser, type AuthUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(async (email: string, password: string, organizationName: string) => {
    const result = await signUp(email, password, organizationName);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
  };
}
