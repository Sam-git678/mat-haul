export type RegisterDeviceTokenPayload = {
  push_token: string;
  platform: 'expo';
  device_os: 'ios' | 'android';
  device_name?: string;
  app_version?: string;
};

export type RegisterDeviceTokenData = {
  registered: boolean;
};

export type UnregisterDeviceTokenPayload = {
  push_token: string;
};

export type UnregisterDeviceTokenData = {
  unregistered: boolean;
};