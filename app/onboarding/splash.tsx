import SplashScreen from "@/components/Splash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/authcontext";

export default function Splash() {
  const router = useRouter();
  const { accesstoken, isLoading } = useAuth();

  const hasNavigatedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load
    if (hasNavigatedRef.current) return;
    
    const checkOnboarding = async () => {
      const onboarded = await AsyncStorage.getItem("onboarded");
      timeoutRef.current = setTimeout(() => {
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;
        if (!onboarded) {
          router.replace("/onboarding/screen");
          return;
        }
        if (accesstoken) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      }, 2500);
    };

    checkOnboarding();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, accesstoken, router]);

  return <SplashScreen />;
}
