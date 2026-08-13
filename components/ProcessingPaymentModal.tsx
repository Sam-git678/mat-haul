import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BRAND_BLUE = "#0B4A8B";

interface Props {
  visible: boolean;
  reference: string;
  amount: number;
  onClose: () => void;
  onCheckStatus: () => void;
}

export default function ProcessingPaymentModal({
  visible,
  reference,
  amount,
  onClose,
  onCheckStatus,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="reload-circle-outline"
                size={24}
                color={BRAND_BLUE}
              />
              <Text style={styles.title}>Payment Pending</Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Awaiting ALATPay confirmation</Text>
            <Text style={styles.alertMessage}>
              Your order payment has been started. The order will be submitted for review once ALATPay confirms the payment.
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{reference}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amount}>
              NGN {amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onCheckStatus}>
            <Text style={styles.buttonText}>Recheck Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    color: "#111827",
  },
  alertBox: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  alertTitle: {
    color: "#C2410C",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6,
  },
  alertMessage: {
    color: "#9A3412",
    lineHeight: 20,
    fontSize: 13,
  },
  item: {
    marginBottom: 14,
  },
  label: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  amount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
