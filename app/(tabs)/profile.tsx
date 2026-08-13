import Avatar from "@/components/Avatar";
import { appStyles, colors, profileMenuItems } from "@/constants";
import { openLink } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/authcontext";

const SUPPORT_EMAIL = 'support@charissatics.com';
const SUPPORT_PHONE = '+234 801 234 5678';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
 
  const [displayName, setDisplayName] = useState("Name Loading...");
  const [email, setEmail] = useState("email loading...");
  

  useEffect(() => {
    const fullName =
      user?.name?.trim() ||
      `${(user as any)?.firstname ?? ""} ${(user as any)?.lastname ?? ""}`.trim();

    setDisplayName(fullName);

    const email = (user as any)?.email?.trim();
    setEmail(email);

    
  }, [user]);

  

  const handleLogout = async () => {
    await logout();
  }

  

  return (
    <SafeAreaView style={appStyles.containerGray} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={appStyles.homeContent}
      >
        

        <View style={appStyles.headerSection}>
          <Text style={appStyles.headerTitle}>My Profile</Text>
          <Text style={appStyles.headerSubtitle}>Manage your account details, business information, and security preferences.</Text>
        </View>

        <View style={appStyles.profileHeroCard}>
          <Avatar />
          <View style={{ flex: 1 }}>
            <Text style={appStyles.profileName}>{displayName}</Text>
            <Text style={appStyles.profileEmail}>{email}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/edit-profile')} style={appStyles.profileChevronBtn}>
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={appStyles.profileMenuCard}
          activeOpacity={0.8}
          onPress={() => router.push("/account-overview")}
        >
          <View style={appStyles.profileMenuItem}>
            <View style={appStyles.profileMenuIconBox}>
              <Ionicons name="grid-outline" size={20} color={colors.primary} />
            </View>
            <View style={appStyles.profileMenuText}>
              <Text style={{fontSize: 14, fontWeight: '500'}}>Account</Text>
              <Text style={{ color: "#667085", fontSize: 12, marginTop: 2 }}>
                View your profile, account type, and status
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <View style={appStyles.profileMenuCard}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity onPress={() => {
              if (item.url) {
                openLink(item.url);
              } else {
                router.push(item.route as any);
              }
            }} key={index} style={appStyles.profileMenuItem} activeOpacity={0.7}>
              <View style={appStyles.profileMenuIconBox}>
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={appStyles.profileMenuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={appStyles.profileLogoutButton}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53E3E" style={{ marginRight: 8 }} />
          <Text style={appStyles.profileLogoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={[appStyles.profileMenuCard, styles.contactCard]}>
          <View style={[appStyles.profileMenuItem, styles.contactHeaderRow]}>
            
            <Text style={styles.contactCardTitle}>Contact Information</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[appStyles.profileMenuItem, styles.contactRow]}
            onPress={() => void openLink(`mailto:${SUPPORT_EMAIL}`)}
          >
            <View style={appStyles.profileMenuIconBox}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.contactTextWrap}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[appStyles.profileMenuItem, styles.contactRow, { marginBottom: 0 }]}
            onPress={() => void openLink(`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`)}
          >
            <View style={appStyles.profileMenuIconBox}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.contactTextWrap}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{SUPPORT_PHONE}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={appStyles.profileVersionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    marginTop: 10,
  },
  contactCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 15,
  },
  contactRow: {
    paddingVertical: 12,
  },
  contactTextWrap: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: '#667085',
    lineHeight: 21,
  },
  contactHeaderRow: {
    paddingVertical: 12,
  },
});
