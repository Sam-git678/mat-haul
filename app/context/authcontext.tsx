// context/AuthContext.tsx
import { setTokenSyncHandler } from "@/src/config/api";
import { unregisterPushTokenFromBackend } from '@/src/services/pushNotifications';
import type { UserProfile } from "@/types/profile";
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

type User = UserProfile & {
  usertype?: string;
  status?: string;
  hastransactionpin?: boolean;
  createdat?: string;
  updatedat?: string;
  emailverifiedat?: string;
  phoneverifiedat?: string;
};

type AuthContextType = {
  accesstoken: string | null;
  refreshtoken: string | null;
  setTokens: (tokens: { accesstoken: string; refreshtoken?: string | null }) => Promise<void>;
  user: User | null;
  login: (data: { tokens: { accesstoken: string; refreshtoken: string }; user: User }) => Promise<void>;
  updateUser: (partial: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accesstoken, setAccessToken] = useState<string | null>(null);
  const [refreshtoken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  // grabs user and token object when app starts
  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('accesstoken'),
      SecureStore.getItemAsync('refreshtoken'),
      SecureStore.getItemAsync('user')
    ]).then(([storedAccessToken, storedRefreshToken, storedUser]) => {
      if (storedAccessToken) setAccessToken(storedAccessToken);
      if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    }).catch((error) => {
      console.error("Auth bootstrap failed:", error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  

  // set new token after token refresh
  const setTokens = async ({accesstoken, refreshtoken}: {accesstoken: string; refreshtoken?: string | null}) => {
    setAccessToken(accesstoken);
    await SecureStore.setItemAsync("accesstoken", accesstoken);
    if (refreshtoken) {
      setRefreshToken(refreshtoken);
      await SecureStore.setItemAsync("refreshtoken", refreshtoken)
      
    }
  }

  useEffect(() => {
    setTokenSyncHandler(setTokens);
    return () => setTokenSyncHandler(null);
  }, []);


  const login = async (data: { tokens: { accesstoken: string; refreshtoken: string }; user: User }) => {
    setAccessToken(data.tokens.accesstoken);
    setRefreshToken(data.tokens.refreshtoken);
    setUser(data.user);
    await SecureStore.setItemAsync('accesstoken', data.tokens.accesstoken);
    await SecureStore.setItemAsync('refreshtoken', data.tokens.refreshtoken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
  };

  const updateUser = async (partial: Partial<User>) => {
    const currentRaw = await SecureStore.getItemAsync('user');
    const current = currentRaw ? (JSON.parse(currentRaw) as User) : ({} as User);

    const merged: User = { ...current, ...partial };
    setUser(merged);
    await SecureStore.setItemAsync('user', JSON.stringify(merged));
  };


  const logout = async () => {
    await unregisterPushTokenFromBackend(accesstoken);

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('accesstoken');
    await SecureStore.deleteItemAsync('refreshtoken');
    await SecureStore.deleteItemAsync('user');

    await SecureStore.deleteItemAsync('expo_push_token');
  };

  return (
    <AuthContext.Provider value={{ accesstoken, refreshtoken, setTokens, user, login, updateUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
