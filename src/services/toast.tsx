import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";

let lastToastKey = "";
let lastToastAt = 0;

type ToastOptions = {
  duration?: number;
  position?: number;
};

type ToastVariant = "default" | "success" | "error";

const getToastTheme = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return {
        textColor: "#027A48",
        iconColor: "#027A48",
        iconName: "checkmark-circle-outline" as const,
      };
    case "error":
      return {
        textColor: "#B42318",
        iconColor: "#B42318",
        iconName: "close-circle-outline" as const,
      };
    default:
      return {
        textColor: "#0F172A",
        iconColor: "#475467",
        iconName: "information-circle-outline" as const,
      };
  }
};

const showToast = (
  message: string,
  variant: ToastVariant = "default",
  options: ToastOptions = {}
) => {
  const normalizedMessage = String(message ?? "").trim();
  if (!normalizedMessage) return;

  const now = Date.now();
  const toastKey = `${variant}:${normalizedMessage}:${options.position ?? "default"}`;

  if (toastKey === lastToastKey && now - lastToastAt < 1500) {
    return;
  }

  lastToastKey = toastKey;
  lastToastAt = now;

  const theme = getToastTheme(variant);
  const iconSize = variant === "default" ? 18 : 19;
  const content = (
    <View style={styles.toastContent}>
      <Ionicons
        name={theme.iconName}
        size={iconSize}
        color={theme.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: theme.textColor }]}>{normalizedMessage}</Text>
    </View>
  );

  Toast.show(content, {
    duration: options.duration ?? Toast.durations.SHORT,
    position: options.position ?? Toast.positions.BOTTOM,
    shadow: true,
    shadowColor: "#CBD5E1",
    animation: true,
    hideOnPress: true,
    delay: 0,
    opacity: 1,
    backgroundColor: "#FFFFFF",
    textColor: theme.textColor,
  });
};

export const showGlobalToast = (message: string, options: ToastOptions = {}) =>
  showToast(message, "default", options);

export const showSuccessToast = (message: string, options: ToastOptions = {}) =>
  showToast(message, "success", options);

export const showErrorToast = (message: string, options: ToastOptions = {}) =>
  showToast(message, "error", options);

export const showOfflineToast = () => {
  showErrorToast("No internet connection. Please try again.");
};

const styles = StyleSheet.create({
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 320,
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  message: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
