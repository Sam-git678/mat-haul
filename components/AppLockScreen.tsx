import { useAppLock } from "@/app/context/applock";
import { useAuth } from "@/app/context/authcontext";
import { appStyles, colors, typography } from "@/constants";
import { authenticateWithFingerprint } from "@/src/services/biometric";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";


export default function AppLockScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const insets = useSafeAreaInsets();
  const { unlock } = useAppLock();
  const { user } = useAuth();

  const handleUnlock = async () => {
    if (isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await authenticateWithFingerprint("Unlock CharisHaul");
      if (result.success) {
        unlock();
      }
    } finally {
      setIsAuthenticating(false);
    }
  };



  const displayName =
    user?.name?.trim() ||
    [user?.firstname, user?.lastname]
      .filter(Boolean)
      .map((part) => String(part).trim())
      .join(" ")
      .trim() ||
    "Welcome Back";




  return (
    <SafeAreaView style={[appStyles.containerGray, styles.overlay]} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgGray} />

      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />

      <View style={[appStyles.authContent, styles.content]}>
        <View style={appStyles.logoContainer}>


          <View style={appStyles.logoWrapper}>
            <Image
              source={require("../assets/images/charismat-icon.png")}
              style={appStyles.logo}
              resizeMode="contain"
            />



          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>

        </View>





        <View>


          <View style={styles.heroIconWrap}>
            <View style={styles.heroIconGlow} />
            <View style={styles.heroIcon}>
              <Ionicons name="finger-print" size={46} color={colors.primary} />
            </View>
          </View>




          <View style={styles.helperRow}>
            
            <View style={styles.helperPill}>
              <Ionicons name="time-outline" size={15} color={colors.textMuted} />
              <Text style={styles.helperText}>Session timed lock</Text>
            </View>
          </View>


        </View>

        <View style={[styles.actions, { bottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[appStyles.primaryButton, styles.primaryAction]}
            onPress={handleUnlock}
            disabled={isAuthenticating}
          >
            <Ionicons name="finger-print" size={20} color={colors.white} />
            <Text style={appStyles.primaryButtonText}>
              {isAuthenticating ? "Verifying..." : "Verify Fingerprint"}
            </Text>
          </TouchableOpacity>


        </View>

        <Text style={[appStyles.helperText, styles.footerText]}>
          Click to Log in with Fingerprint.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 120,
  },
  bgOrbTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(11, 74, 139, 0.08)",
  },
  bgOrbBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(11, 74, 139, 0.06)",
  },
  lockBadge: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  lockBadgeText: {
    color: colors.textBody,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  heroCard: {
    backgroundColor: colors.bg,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  userName: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: typography.fontWeight.extrabold,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  heroIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroIconGlow: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(11, 74, 139, 0.08)",
  },
  heroIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: "rgba(11, 74, 139, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginTop: 2,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
  },
  helperRow: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  helperPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.bgGray,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  instructionCard: {
    marginTop: 18,
    backgroundColor: colors.bgGray,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  instructionText: {
    flex: 1,
    color: colors.textBody,
    fontSize: typography.fontSize.md,
    lineHeight: 21,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    position: "absolute",
    left: 30,
    right: 30,
    gap: 12,
    paddingTop: 14,
    paddingBottom: 0,
    zIndex: 2,
  },
  primaryAction: {
    marginTop: 0,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryAction: {
    marginTop: 0,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  secondaryActionText: {
    fontWeight: typography.fontWeight.extrabold,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 14,
    paddingBottom: 4,

    paddingVertical: 16,

  },


});
