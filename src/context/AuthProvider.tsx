import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

import type {
  PrivateUsersResponse,
} from "../global/schema";

// --- Axios Instance -----------------------------------------
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// --- Auth Context Type --------------------------------------
interface AuthContextType {
  user: PrivateUsersResponse | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Auth
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    phone_no: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// --- Context ------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// --- Provider -----------------------------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PrivateUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  let isRefreshing = false;

  const fetchUser = async () => {
    try {
      const res = await api.get<PrivateUsersResponse>("/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Auth -------------------------------------------------
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

  // --- Effects ----------------------------------------------

  useEffect(() => {
    fetchUser();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            await api.post("/refresh");
            isRefreshing = false;
            return api(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // --- Context Value ----------------------------------------
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,

    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
