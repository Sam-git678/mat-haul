import { ErrorBoundary } from "@/components/ErrorBoundary";
import { authApi } from '@/src/config/api';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '@/src/services/pushNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { useEffect, useRef } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import AppLockProvider from "./context/applock";
import AuthProvider, { useAuth } from "./context/authcontext";
import NotificationProvider from "./context/notificationcontext";
import WalletProvider from "./context/walletcontext";

const queryClient = new QueryClient();


function InitializePushNotifications() {
  const { accesstoken, user } = useAuth();

  const lastSentTokenRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accesstoken) return;

    const initPush = async () => {
      const pushtoken = await registerForPushNotificationsAsync();
      if (!pushtoken) return;

      const currentUserId = (user as any)?.id ?? null;

      const sameToken = lastSentTokenRef.current === pushtoken;
      const sameUser = lastUserIdRef.current === currentUserId;

      if (sameToken && sameUser) {
        console.log('Push token unchanged; skipping backend registration');
        return;
      }

      await sendPushTokenToBackend(pushtoken, accesstoken);

      lastSentTokenRef.current = pushtoken;
      lastUserIdRef.current = currentUserId;
    };

    initPush();
  }, [accesstoken, user]);

  return null;
}

// keep alive
function InitializeSessionConfig() {
  const { accesstoken, logout } = useAuth();


  useEffect(() => {
    if (!accesstoken) return;

    let intervalId: ReturnType<typeof setInterval>;

    const initSessionConfig = async () => {
      const response = await authApi.sessionConfig(accesstoken);


      if (!response.success) return;


      const sessionConfig = response.data;



      const keepAliveEveryMs = sessionConfig.keepAliveIntervalSeconds * 1000;

      intervalId = setInterval(async () => {
        const response = await authApi.me(accesstoken);

        if (!response.success) {
          clearInterval(intervalId);
          await logout();
        }



      }, keepAliveEveryMs);



    };

    initSessionConfig()

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [accesstoken])

  return null
}






export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppLockProvider>
          <RootSiblingParent>
            <InitializeSessionConfig />
            <InitializePushNotifications />
            <QueryClientProvider client={queryClient}>
              <NotificationProvider>
                <WalletProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="onboarding/splash" />
                    <Stack.Screen name="onboarding/screen" />

                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />

                    <Stack.Screen name="(wallet)" />
                    <Stack.Screen name="(order)" />
                    <Stack.Screen name="alatpay-checkout" />
                    <Stack.Screen name="(profile)" />
                    <Stack.Screen name="notifications" />
                  </Stack>
                </WalletProvider>
              </NotificationProvider>
            </QueryClientProvider>
          </RootSiblingParent>
        </AppLockProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
