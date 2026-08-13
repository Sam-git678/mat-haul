import { notificationApi } from "@/src/config/api";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authcontext";
type NotificationContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (value: number) => void;
  loading: boolean;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export default function NotificationProvider({ children }: {children: React.ReactNode}) {
  const { accesstoken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshUnreadCount = React.useCallback(async () => {
    if (!accesstoken) return;
    try {
      setLoading(true);
      const result = await notificationApi.getNotifications(accesstoken);
      
      if (result?.success) {
        const unreadCount = result.data.unread_count ?? 0;
        setUnreadCount(unreadCount);
        
      }
    } catch (error) {
      console.warn("Failed to load unread notifications", error);
    } finally {
      setLoading(false)
    }
  }, [accesstoken]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside provider");
  return context;
};