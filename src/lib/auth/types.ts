export interface AuthCredentials {
  email: string;
  apiPassword: string;
}

export interface AuthAdapter {
  login(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }>;
  logout(): Promise<void>;
  getCredentials(): AuthCredentials | null;
  isAuthenticated(): boolean;
}
