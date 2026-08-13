import { appStyles } from '@/constants';
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BRAND_BLUE = "#0B4A8B";

interface LoaderModalProps {
  visible: boolean;
  title: string;
  message: string;
  subtext: string;
}

export default function LoaderModal(
  {
    visible, 
    title, 
    message, 
    subtext
  }: LoaderModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={appStyles.divider} />
          <ActivityIndicator
            size="small"
            color={BRAND_BLUE}
            style={{ marginVertical: 20 }}
          />

          <Text style={styles.message}>
            {message}
          </Text>

          <Text style={styles.subText}>
            {subtext}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    paddingBottom: 8,
  },

  message: {
    textAlign: "center",
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 8,
    lineHeight: 20,
  },

  subText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 16,
  },
});
