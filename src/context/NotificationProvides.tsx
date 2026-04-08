import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { NotificationResponse } from "../global/schema";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

interface NotificationContextType {
  notifications: NotificationResponse[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const unreadCountRef = useRef(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationResponse[]>("/notifications/");
      const data = Array.isArray(res.data) ? res.data : [];

      if(notifications.length != data.length){
        setNotifications(data);
      }

      unreadCountRef.current = data.filter((n) => !n.is_read).length;
    } catch (err) {
      setNotifications([]);
    }
  };

  const markAllRead = async () => {
    await api.get("/notifications/read_all");

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    unreadCountRef.current = 0;
  };

  useEffect(() => {

    let interval: any;

    async function startPolling() {
      await fetchNotifications();

      interval = setInterval(async () => {
        await fetchNotifications();
      }, 2 * 60000);
    }

    startPolling();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: unreadCountRef.current,
        fetchNotifications,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within provider");
  return ctx;
};
