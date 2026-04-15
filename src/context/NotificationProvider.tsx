import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { NotificationResponse } from "../global/schema";
import { api, useAuth } from "./AuthProvider";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const isMounted = useRef(true);
  const esRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<NotificationResponse[]>("/notifications/");
      const data = Array.isArray(res.data) ? res.data : [];
      if (!isMounted.current) return;
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      if (isMounted.current) setNotifications([]);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.get("/notifications/read_all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }, []);

  useEffect(() => {
    const connect = () => {
      esRef.current = new EventSource(`api/notifications/stream`);

      esRef.current.addEventListener("notification", (e) => {
        const data = JSON.parse(e.data);
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    };

    connect();
    fetchNotifications();

    return () => {
      isMounted.current = false;
      esRef.current?.close();
    };
  }, [fetchNotifications, user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAllRead }}
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
