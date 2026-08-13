export type LoginData = {
  user: { name: string; email: string };
  tokens: { accesstoken: string; refreshtoken: string };
};

export type RefreshedTokens = {
  accesstoken: string;
  refreshtoken?: string | null;
};

export type AuthActionData = {
  message?: string;
  expires_in?: number;
  otp?: string;
  [key: string]: unknown;
};


export type sessionConfig = {
  
  idleTimeoutSeconds: number;
  keepAliveIntervalSeconds: number;
    
}

export type keepAlive = {
  user?: { name: string; email: string };
}