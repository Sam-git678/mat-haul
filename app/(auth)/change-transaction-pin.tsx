import { appStyles, colors } from "@/constants";
import { profileApi } from "@/src/config/api";
import { handleSessionExpired } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";

export default function ChangePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accesstoken, logout, updateUser } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinsMatch = pin.length === 4 && pin === confirmPin;
  const showMismatch = confirmPin.length === 4 && pin !== confirmPin;

  const handleSubmitPin = async () => {
    if (!pinsMatch || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await profileApi.changeTransactionPin(
        { pin, confirm_pin: confirmPin },
        accesstoken
      );

      if (await handleSessionExpired(result, logout, (path) => router.replace(path as any))) {
        return;
      }

      if (!result.success) {
        setError(result.message || "Unable to update your transaction PIN. Please try again.");
        return;
      }

      await updateUser({
        hastransactionpin: true,
        has_transaction_pin: true,
      } as any);

      Alert.alert(
        "Transaction PIN Updated",
        result.message || "Your transaction PIN has been updated successfully.",
        [{ text: "Done", onPress: () => router.back() }]
      );
    } catch {
      setError("Unable to update your transaction PIN. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.containerGray} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={appStyles.pageHeaderBetween}>
          <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={appStyles.pageHeaderTitle}>Reset Transaction PIN</Text>
          <View style={appStyles.pageHeaderSpacer} />
        </View>

        <View style={appStyles.pageContent}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>
              Create a new 4-digit transaction PIN. You will use this PIN to authorize payments.
            </Text>

            <View style={styles.inputSection}>
              <Text style={appStyles.formLabel}>New PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={(text) => setPin(text.replace(/\D/g, ""))}
                placeholder="• • • •"
                placeholderTextColor={colors.textSubtle}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={appStyles.formLabel}>Confirm PIN</Text>
              <TextInput
                style={[styles.pinInput, showMismatch && styles.pinInputError]}
                value={confirmPin}
                onChangeText={(text) => setConfirmPin(text.replace(/\D/g, ""))}
                placeholder="• • • •"
                placeholderTextColor={colors.textSubtle}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              {showMismatch ? <Text style={styles.errorText}>PINs do not match.</Text> : null}
            </View>

            {error ? <Text style={appStyles.errorText}>{error}</Text> : null}
          </View>
        </View>

        <View style={[appStyles.footerPadding, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[
              appStyles.roundButton,
              { opacity: pinsMatch && !isSubmitting ? 1 : 0.55 },
            ]}
            disabled={!pinsMatch || isSubmitting}
            onPress={handleSubmitPin}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={appStyles.roundButtonText}>Update PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475467",
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 14,
  },
  pinInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 20,
    letterSpacing: 10,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "center",
  },
  pinInputError: {
    borderColor: "#F04438",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#B42318",
    fontWeight: "600",
  },
});
