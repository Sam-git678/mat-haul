import { appStyles, colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({ icon, title, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D0D5DD', true: '#B2CCFF' }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const router = useRouter();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={appStyles.pageHeaderBetween}>
        <TouchableOpacity onPress={() => router.back()} style={appStyles.circleIconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={appStyles.pageHeaderTitle}>Notifications Settings</Text>
        <View style={appStyles.pageHeaderSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose how you want to receive updates about orders, wallet activity, and promotions.
        </Text>

        <View style={appStyles.settingsSectionCard}>
          <SettingRow
            icon="notifications-outline"
            title="Push Notifications"
            description="Receive alerts for important app activity and updates."
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="mail-outline"
            title="Email Notifications"
            description="Get account and activity updates by email."
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="pricetag-outline"
            title="Promotions"
            description="Receive product offers, discounts, and promotions."
            value={promotions}
            onValueChange={setPromotions}
          />
        </View>

        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  leftHeaderGap: {
    width: 40,
    height: 40,
  },
  rightHeaderGap: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#667085',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
  },
 
});
