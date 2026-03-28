import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import type { Item } from "../components/itemCard/ItemCard";

// --- Axios Instance -----------------------------------------
const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// --- Types --------------------------------------------------
interface User {
  username: string;
  email: string;
  phone_no: string;
  rating: number;
  locked: boolean;
  disabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean,
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    phone_no: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchAllItems: (skip?: number, limit?: number) => Promise<Item[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    await api.post("/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await fetchUser();
  };

  const register = async (data: {
    username: string;
    email: string;
    phone_no: string;
    password: string;
  }) => {
    await api.post("/register", data);
    await login(data.username, data.password);
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  const refresh = async () => {
    try {
      await api.post("/refresh");
      await fetchUser();
    } catch {
      setUser(null);
    }
  };

  // ---- Items ---------------------------------------------------
  const fetchAllItems = async (
    skip: number = 0,
    limit: number = 10,
  ): Promise<Item[]> => {
    try {
      const response = await api.get("/items/feed", {
        params: { skip, limit },
      });

      const data = response.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;

      console.log("Unexpected response:", data);
      return [];
    } catch (error) {
      console.error("fetchAllItems failed:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refresh,
    fetchAllItems
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
