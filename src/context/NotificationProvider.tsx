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
import { api } from "./AuthProvider";

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

  const isMounted = useRef(true);

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
    } catch {
      
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();

    const es = new EventSource("/api/sse/notifications/", {
      withCredentials: true,
    });

    es.onmessage = (event) => {
      if (!isMounted.current) return;
      try {
        const notification: NotificationResponse = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.is_read) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch {
        
      }
    };

    es.onerror = () => {
      console.warn("SSE connection lost, retrying...");
    };

    return () => {
      isMounted.current = false;
      es.close();
    };
  }, [fetchNotifications]);

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
