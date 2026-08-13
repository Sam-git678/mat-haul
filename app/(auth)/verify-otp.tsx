import { appStyles, colors } from "@/constants";
import { authApi } from "@/src/config/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email || isResending || countdown > 0) return;

    setIsResending(true);
    try {
      const result = await authApi.resendVerification({ email });
      Alert.alert(
        result.success ? "Verification Sent" : "Unable to Send",
        result.message || "Please try again in a moment."
      );
      if (result.success) {
        setCountdown(60);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (isVerifying) return;

  

    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Incomplete Code", "Please enter the 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await authApi.verifyOtp({
        email,
        code,
        purpose: "verify",
      });

      if (result.success) {
        
        router.replace("/signup-success")
      
      } else {
        Alert.alert(
          "Verification Failed. Please try again."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.containerWhite} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={appStyles.otpScreenContent}
      >
       

        <View style={appStyles.otpHeaderBlock}>
          <Text style={appStyles.authTitle}>Verify Account</Text>
          <Text style={appStyles.subHeaderText}>
            Enter the 6-digit code sent to {email || "your email"}.
          </Text>
        </View>

        <View style={appStyles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[appStyles.otpInputBox, digit ? appStyles.otpInputBoxActive : null]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[appStyles.primaryButton, isVerifying && appStyles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={appStyles.primaryButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={appStyles.otpFooterRow}>
          <Text style={appStyles.helperText}>Didn't receive a code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={isResending || !email || countdown > 0}
          >
            {isResending ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={[
                  appStyles.otpResendText,
                  { color: countdown > 0 ? colors.textSubtle : colors.primary },
                ]}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Now"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
