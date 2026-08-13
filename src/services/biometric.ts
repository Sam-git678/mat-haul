import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from 'expo-secure-store';

export const authenticateWithFingerprint = async (promptMessage: string) => {
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "Use device passcode",
  });
};




export const BIOMETRIC_KEY = "biometric_enabled";

/**
 * Returns whether the user enabled biometric lock in your app.
 */
export async function isBiometricLockEnabled(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(BIOMETRIC_KEY);
    return value === "true";
}

/**
 * Enable biometric lock.
 */
export async function enableBiometricLock(): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, "true");
}

/**
 * Disable biometric lock.
 */
export async function disableBiometricLock(): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, "false");
}

/**
 * Returns true if the device supports biometric authentication.
 */
export async function hasBiometricHardware(): Promise<boolean> {
    return LocalAuthentication.hasHardwareAsync();
}

/**
 * Returns true if the user has enrolled a fingerprint or Face ID.
 */
export async function isBiometricEnrolled(): Promise<boolean> {
    return LocalAuthentication.isEnrolledAsync();
}



    
