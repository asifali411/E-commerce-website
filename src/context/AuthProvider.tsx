import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios, { type AxiosError } from "axios";
import type { PrivateUsersResponse } from "../global/schema";

// --- Axios Instance -----------------------------------------
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// --- Error Helper -------------------------------------------
export function extractErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const err = error as AxiosError<{
    detail?: string | { msg: string; loc: (string | number)[]; type: string }[];
  }>;

  const detail = err.response?.data?.detail;

  if (!detail) return fallback;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(", ");
  }

  return fallback;
}

// --- Auth Context Type --------------------------------------
interface AuthContextType {
  user: PrivateUsersResponse | null;
  isAuthenticated: boolean;
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
}

// --- Context ------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Provider -----------------------------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PrivateUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);

  const fetchUser = async () => {
    try {
      const res = await api.get<PrivateUsersResponse>("/profile/");
      if(res.data.username){
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Auth -------------------------------------------------

  const login = async (username: string, password: string): Promise<void> => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await api.post<PrivateUsersResponse>("/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    setUser(res.data);
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
    try {
      await api.post("/logout");
    } finally {
      setUser(null);
    }
  };

  const refresh = async () => {
    try {
      await api.post("/refresh");
      await fetchUser();
    } catch {
      setUser(null);
    }
  };

  // --- Interceptor ------------------------------------------
  useEffect(() => {

    fetchUser();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing.current) return Promise.reject(error);

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            await api.post("/refresh");
            isRefreshing.current = false;
            return api(originalRequest!);
          } catch (refreshError) {
            isRefreshing.current = false;
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
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