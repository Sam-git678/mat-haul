import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';



const notifications = [
  {
    id: "1",
    title: "New Service Window",
    body: "Truck dispatch slots are now open for tomorrow morning.",
    time: "7m ago",
  },
  {
    id: "2",
    title: "Delivery Update",
    body: "Your material delivery has moved to the next checkpoint.",
    time: "31m ago",
  },
  {
    id: "3",
    title: "Service Promo",
    body: "Get discounted haulage fee on selected routes today.",
    time: "2h ago",
  },
];

export default function ServiceNotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <Text style={styles.cardBody}>{item.body}</Text>
          </View>
        ))}
      </ScrollView>
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

