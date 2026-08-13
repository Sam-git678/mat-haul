import Avatar from "@/components/Avatar";
import { appStyles, colors } from "@/constants";
import { profileApi } from "@/src/config/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/authcontext";

type AccountAction = "deactivate" | "delete";

type OverviewItemProps = {
  label: string;
  value: string;
};

function OverviewItem({ label, value }: OverviewItemProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function AccountOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, accesstoken, logout } = useAuth();
  const [activeAction, setActiveAction] = useState<AccountAction | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName =
    user?.name?.trim() ||
    `${String(user?.firstname ?? "").trim()} ${String(user?.lastname ?? "").trim()}`.trim() ||
    "-";
  const email = user?.email?.trim() || "-";
  const phone = user?.phone?.trim() || "-";
  const accountType = formatProfileValue(user?.usertype, "label");
  const accountStatus = formatProfileValue(user?.status, "label");
  const memberSince = formatProfileValue(user?.createdat, "date");

  const statusStyle =
    accountStatus.toLowerCase() === "active"
      ? styles.statusActive
      : accountStatus.toLowerCase() === "suspended"
        ? styles.statusSuspended
        : styles.statusNeutral;
  const isDeactivateAction = activeAction === "deactivate";
  const isDeleteAction = activeAction === "delete";

  const canDelete =
    deleteText.trim().toUpperCase() === "DELETE" &&
    password.trim().length > 0 &&
    !isDeleting &&
    isDeleteAction;

  const canDeactivate =
    password.trim().length > 0 &&
    !isDeleting &&
    isDeactivateAction;

  const closeActionModal = () => {
    setActiveAction(null);
    setDeleteText("");
    setPassword("");
    setError(null);
  };

  const handleAccountAction = async () => {
    if ((!canDelete && activeAction === "delete") || (!canDeactivate && activeAction === "deactivate")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      if (!accesstoken) {
        setError("You are not signed in.");
        return;
      }

      const actionResult =
        activeAction === "deactivate"
          ? await profileApi.deactivateAccount({ password }, accesstoken)
          : await profileApi.deleteAccount({ password }, accesstoken);

      if (!actionResult.success) {
        setError(actionResult.message || "Unable to complete this action. Please try again.");
        return;
      }

      Alert.alert(
        activeAction === "deactivate" ? "Account Deactivated" : "Account Deleted",
        actionResult.message || "Your account action completed successfully.",
        [
          {
            text: "Ok",
            onPress: async () => {
              await logout();
              router.replace("/login");
            },
          },
        ]
      );

      closeActionModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.containerGray} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Account Overview</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          appStyles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.heroCard}>
          <Avatar />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{displayName}</Text>
            <Text style={styles.heroSubtitle}>{email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <OverviewItem label="Full Name" value={displayName} />
          <OverviewItem label="Email" value={email} />
          <OverviewItem label="Phone" value={phone} />
          <OverviewItem label="Account Type" value={accountType} />
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Account Status</Text>
            <View style={[styles.statusPill, statusStyle]}>
              <Text style={styles.statusText}>{accountStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <OverviewItem label="Member Since" value={memberSince} />
          {user?.companyname ? (
            <OverviewItem label="Company Name" value={String(user.companyname).trim()} />
          ) : null}
          {user?.companyaddress ? (
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.label}>Company Address</Text>
              <Text style={styles.value}>{String(user.companyaddress).trim()}</Text>
            </View>
          ) : null}
        </View>

        <View style={[appStyles.settingsSectionCard, styles.actionCard]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveAction("deactivate")}
            style={styles.actionButton}
          >
            <View style={[appStyles.settingsIconBox, styles.deactivateIconBox]}>
              <Ionicons name="pause-circle-outline" size={20} color="#B54708" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Deactivate Account</Text>
              <Text style={styles.actionSubtitle}>
                Temporarily disable login access. Support can help reactivate it.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D0D5DD" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[appStyles.settingsSectionCard, styles.deleteCard]}
          onPress={() => setActiveAction("delete")}
          activeOpacity={0.85}
        >
          <View style={appStyles.settingsRow}>
            <View style={[appStyles.settingsIconBox, styles.deleteIconBox]}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </View>
            <Text style={[appStyles.settingsLabel, styles.deleteLabel]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={activeAction !== null} transparent animationType="fade" onRequestClose={closeActionModal}>
        <Pressable
          style={appStyles.modalBackdrop}
          onPress={closeActionModal}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {isDeactivateAction ? "Deactivate Account" : "Delete Account"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isDeactivateAction
                ? "Enter your password to confirm deactivation."
                : "This action is permanent. Type DELETE and enter your password to continue."}
            </Text>

            {error ? <Text style={styles.modalError}>{error}</Text> : null}

            {isDeleteAction ? (
              <>
                <Text style={styles.modalLabel}>Type DELETE</Text>
                <TextInput
                  value={deleteText}
                  onChangeText={setDeleteText}
                  autoCapitalize="characters"
                  placeholder="DELETE"
                  placeholderTextColor="#98A2B3"
                  style={styles.modalInput}
                />
              </>
            ) : null}

            <Text style={styles.modalLabel}>
              {isDeactivateAction ? "Current Password" : "Password"}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
              placeholderTextColor="#98A2B3"
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeActionModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAccountAction}
                disabled={isDeleteAction ? !canDelete : !canDeactivate}
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor:
                      isDeleteAction
                        ? canDelete
                          ? "#B42318"
                          : "#FECACA"
                        : canDeactivate
                          ? "#B54708"
                          : "#FCD38D",
                  },
                ]}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeleting
                    ? isDeleteAction
                      ? "Deleting..."
                      : "Deactivating..."
                    : isDeleteAction
                      ? "Delete Account"
                      : "Deactivate"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function formatProfileValue(value?: string, variant: "label" | "date" = "label") {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return "-";
  }

  if (variant === "date") {
    const parsedDate = new Date(trimmedValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return trimmedValue;
    }

    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      
    }).format(parsedDate);
  }

  return trimmedValue.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 3,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    color: "#667085",
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: "#101828",
    fontSize: 15,
    fontWeight: "600",
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: "#109f5c",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusActive: {
    backgroundColor: "#74e0ae73",
  },
  statusSuspended: {
    backgroundColor: "#F04438",
  },
  statusNeutral: {
    backgroundColor: "#667085",
  },
  deleteCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  deleteIconBox: {
    backgroundColor: "#FEF2F2",
  },
  deactivateIconBox: {
    backgroundColor: "#FFFAEB",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D2939",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#667085",
    marginTop: 2,
  },
  deleteLabel: {
    color: "#B42318",
  },
  
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#475467",
    marginBottom: 14,
  },
  modalError: {
    color: "#B42318",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    color: "#101828",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: "#475467",
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
