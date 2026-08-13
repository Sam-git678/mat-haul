import { notificationApi } from '@/src/config/api';
import { RegisterDeviceTokenPayload } from '@/types/push-notification';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Must use a physical device for Push Notifications');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission denied');
    return null;
  }

  // Important newer Expo step:
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error('Project ID not found');
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  await SecureStore.setItemAsync('expo_push_token', token);


  return token;
}


export async function sendPushTokenToBackend(
  expoToken: string | null,
  accessToken: string | null
): Promise<void> {

  if (!expoToken || !accessToken) return;
  const payload: RegisterDeviceTokenPayload = {
    push_token: expoToken,
    platform: 'expo',
    device_os: Platform.OS === 'ios' ? 'ios' : 'android',
    device_name: Device.modelName ?? 'unknown',
    app_version: Constants.expoConfig?.version ?? 'unknown'
  };
  
  const result = await notificationApi.registerDeviceToken(
    payload,
    accessToken
  );
 

}

export async function unregisterPushTokenFromBackend(accessToken: string | null) {
  if (!accessToken) return;

  const push_token = await SecureStore.getItemAsync('expo_push_token');
  if (!push_token) return;

  const result = await notificationApi.unregisterDeviceToken({ push_token }, accessToken);
  console.log('Unregister device token result:', result);
  if (result?.success) {
    await SecureStore.deleteItemAsync('expo_push_token');
  }
}
