"use client";

import { useState, useEffect, useCallback } from "react";
import { authAdapter } from "@/lib/auth/voipms";
import { AuthCredentials } from "@/lib/auth/types";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authAdapter.isAuthenticated());
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const result = await authAdapter.login(credentials);
    if (result.success) {
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authAdapter.logout();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    credentials: authAdapter.getCredentials(),
  };
}
