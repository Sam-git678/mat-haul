import { NotificationItem } from "@/types/notification";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';





type Props = {
  notifications: NotificationItem[];
};

export default function TransactionNotificationsScreen({ notifications }: Props) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />


      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <Text style={styles.cardBody}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No notifications
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, gap: 12, paddingBottom: 120 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E9EDF3",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0F172A" },
  cardTime: { fontSize: 11, color: "#64748B" },
  cardBody: { fontSize: 13, color: "#475467", lineHeight: 19 },
});

