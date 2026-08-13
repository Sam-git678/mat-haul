import { appStyles, colors } from "@/constants";
import {
  authenticateWithFingerprint,
  disableBiometricLock,
  enableBiometricLock,
  hasBiometricHardware,
  isBiometricEnrolled,
  isBiometricLockEnabled
} from "@/src/services/biometric";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SecurityScreen() {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);


  const handleBiometricToggle = async () => {
    const enabled = await isBiometricLockEnabled();
    if (enabled) {
      await disableBiometricLock();
      setIsBiometricEnabled(false);
      return;
    }

    const hasHardware = await hasBiometricHardware();

    if (!hasHardware) {
      Alert.alert(
        "Biometric Authentication",
        "Your device doesn't support biometric authentication."
      );
      return;
    }

    const enrolled = await isBiometricEnrolled();

    if (!enrolled) {
      Alert.alert(
        "Biometric Authentication",
        "Please enroll a fingerprint in your device settings."
      );
      return;
    }

    const result = await authenticateWithFingerprint("Enable Biometric unlock");

    if (result.success) {
      await enableBiometricLock();
      setIsBiometricEnabled(true);
    }
  };

  useEffect(() => {
    const loadPreference = async () => {
      const enabled = await isBiometricLockEnabled();
      setIsBiometricEnabled(enabled);

      
    };
    loadPreference();
  }, []);

 

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Security</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <View style={appStyles.pageContent}>
        <View style={appStyles.settingsSectionCard}>
          <SecurityItem
            icon="lock-closed"
            label="Change Password"
            onPress={() => router.push("/reset-password")}
          />

          <View style={appStyles.divider} />

          <SecurityItem
            icon="keypad"
            label="Reset Transaction PIN"
            onPress={() => router.push("/change-transaction-pin")}
          />

          <View style={appStyles.divider} />

          <View style={appStyles.settingsRow}>
            <View style={appStyles.settingsIconBox}>
              <Ionicons name="finger-print" size={20} color="#1D2939" />
            </View>
            <Text style={appStyles.settingsLabel}>Biometrics</Text>
            <Switch
              trackColor={{ false: "#D0D5DD", true: colors.primary }}
              thumbColor="#fff"
              onValueChange={handleBiometricToggle}
              value={isBiometricEnabled}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const SecurityItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={appStyles.settingsRow} onPress={onPress}>
    <View style={appStyles.settingsIconBox}>
      <Ionicons name={icon} size={20} color="#1D2939" />
    </View>
    <Text style={appStyles.settingsLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#D0D5DD" />
  </TouchableOpacity>
);
