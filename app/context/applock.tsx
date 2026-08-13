import AppLockScreen from '@/components/AppLockScreen';
import { isBiometricLockEnabled } from '@/src/services/biometric';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './authcontext';

type AppLockContextType = {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
};

const AppLockContext = createContext<AppLockContextType | null>(null);

export default function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { accesstoken, isLoading } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const backgroundTimeRef = useRef<number | null>(null);

  const lock = () => setIsLocked(true);
  const unlock = () => {
    void clearLastBackgroungTime();
    setIsLocked(false);
  };

  const clearLastBackgroungTime = async () => {
    await SecureStore.deleteItemAsync(
      "last_background_time"
    );
  }


  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (isLoading || !accesstoken) {
        return;
      }


      if (nextAppState === 'background') {
       
        
        const timestamp = Date.now();
        backgroundTimeRef.current = timestamp;
        await SecureStore.setItemAsync(
          "last_background_time",
          timestamp.toString()
        );

        return;
      }


      const lastBackground =
      await SecureStore.getItemAsync(
        "last_background_time"
      );


      if (nextAppState === 'active' && lastBackground) {
        

        const elapsed = Date.now() - Number(lastBackground);
        const twoMinutesInMilliseconds = 2 * 60 * 1000;
        if (elapsed >= twoMinutesInMilliseconds) {
          
          const enabled = await isBiometricLockEnabled();
          if (enabled) lock();
        }
        backgroundTimeRef.current = null;
        
      }




    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [accesstoken, isLoading]);

  return (
    <AppLockContext.Provider value={{ isLocked, lock, unlock }}>
      {children}
      {isLocked && <AppLockScreen />}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  return context;
}
