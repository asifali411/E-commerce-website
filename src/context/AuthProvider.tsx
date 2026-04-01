import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

import type { ItemCategory } from "../global/types";
import type {
  PrivateUsersResponse,
  ItemImageResponse,
  ItemResponse,
  BidResponse,
  SellerTransactionResponse,
  BuyerTransactionResponse,
  RatingResponse,
  NotificationResponse,
  AdminItemResponse,
  AdminUniqueItemResponse,
} from "../global/schema";
import type { ItemCreate, ItemUpdate, BidCreate, BidUpdate, ReportCreate } from "../global/request";

// --- Axios Instance -----------------------------------------
const api = axios.create({
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

  // Items
  fetchFeed: (skip?: number, limit?: number) => Promise<ItemResponse[]>;
  fetchSearchItems: (params: {
    search?: string;
    categories?: ItemCategory[];
    skip?: number;
    limit?: number;
  }) => Promise<ItemResponse[]>;
  fetchSelledItems: (skip?: number, limit?: number) => Promise<ItemResponse[]>;
  fetchBidedItems: (skip?: number, limit?: number) => Promise<ItemResponse[]>;
  fetchItem: (id: number) => Promise<ItemResponse | null>;
  createItem: (data: ItemCreate) => Promise<ItemResponse | null>;
  updateItem: (id: number, data: ItemUpdate) => Promise<ItemResponse | null>;
  deleteItem: (id: number) => Promise<boolean>;

  // Images
  uploadImage: (
    itemId: number,
    file: File,
  ) => Promise<ItemImageResponse | null>;
  deleteImage: (imageId: number) => Promise<boolean>;

  // Bids
  createBid: (itemId: number, data: BidCreate) => Promise<BidResponse | null>;
  updateBid: (bidId: number, data: BidUpdate) => Promise<BidResponse | null>;
  deleteBid: (bidId: number) => Promise<boolean>;

  // Transactions
  fetchSellerTransactions: () => Promise<SellerTransactionResponse[]>;
  fetchBuyerTransactions: () => Promise<BuyerTransactionResponse[]>;
  createTransaction: (
    itemId: number,
    bidId: number,
  ) => Promise<SellerTransactionResponse | null>;

  // Ratings
  fetchMyRatings: () => Promise<RatingResponse[]>;
  updateRating: (
    ratingId: number,
    score: number,
  ) => Promise<RatingResponse | null>;

  // Notifications
  fetchNotifications: () => Promise<NotificationResponse[]>;
  readAllNotifications: () => Promise<boolean>;

  // Reports
  reportItem: (itemId: number, data: ReportCreate) => Promise<boolean>;

  // Admin
  fetchReportedItems: (
    skip?: number,
    limit?: number,
  ) => Promise<AdminItemResponse[]>;
  fetchAdminItem: (itemId: number) => Promise<AdminUniqueItemResponse | null>;
  deleteAdminItem: (itemId: number) => Promise<boolean>;
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

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await api.post("/refresh");

            return api(originalRequest);
          } catch (refreshError) {
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

  // --- Items ------------------------------------------------
  const fetchFeed = async (skip = 0, limit = 10): Promise<ItemResponse[]> => {
    try {
      const res = await api.get<ItemResponse[]>("/items/feed", {
        params: { skip, limit },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchFeed failed:", error);
      return [];
    }
  };

  const fetchSearchItems = async ({
    search,
    categories,
    skip = 0,
    limit = 10,
  }: {
    search?: string;
    categories?: ItemCategory[];
    skip?: number;
    limit?: number;
  }): Promise<ItemResponse[]> => {
    try {
      const res = await api.get<ItemResponse[]>("/items/search", {
        params: { search, categories, skip, limit },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchSearchItems failed:", error);
      return [];
    }
  };

  const fetchSelledItems = async (
    skip = 0,
    limit = 10,
  ): Promise<ItemResponse[]> => {
    try {
      const res = await api.get<ItemResponse[]>("/items/selled-items", {
        params: { skip, limit },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchSelledItems failed:", error);
      return [];
    }
  };

  const fetchBidedItems = async (
    skip = 0,
    limit = 10,
  ): Promise<ItemResponse[]> => {
    try {
      const res = await api.get<ItemResponse[]>("/items/bided-items", {
        params: { skip, limit },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchBidedItems failed:", error);
      return [];
    }
  };

  const fetchItem = async (id: number): Promise<ItemResponse | null> => {
    try {
      const res = await api.get<ItemResponse>(`/items/${id}`);
      return res.data;
    } catch (error) {
      console.error("fetchItem failed:", error);
      return null;
    }
  };

  const createItem = async (data: ItemCreate): Promise<ItemResponse | null> => {
    try {
      const res = await api.post<ItemResponse>("/items/create", data);
      return res.data;
    } catch (error) {
      console.error("createItem failed:", error);
      return null;
    }
  };

  const updateItem = async (
    id: number,
    data: ItemUpdate,
  ): Promise<ItemResponse | null> => {
    try {
      const res = await api.patch<ItemResponse>(`/items/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("updateItem failed:", error);
      return null;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/items/${id}`);
      return true;
    } catch (error) {
      console.error("deleteItem failed:", error);
      return false;
    }
  };

  // --- Images -----------------------------------------------
  const uploadImage = async (
    itemId: number,
    file: File,
  ): Promise<ItemImageResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post<ItemImageResponse>(
        `/images/${itemId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
    } catch (error) {
      console.error("uploadImage failed:", error);
      return null;
    }
  };

  const deleteImage = async (imageId: number): Promise<boolean> => {
    try {
      await api.delete(`/images/${imageId}`);
      return true;
    } catch (error) {
      console.error("deleteImage failed:", error);
      return false;
    }
  };

  // --- Bids -------------------------------------------------
  const createBid = async (
    itemId: number,
    data: BidCreate,
  ): Promise<BidResponse | null> => {
    try {
      const res = await api.post<BidResponse>(`/bids/${itemId}`, data);
      return res.data;
    } catch (error) {
      console.error("createBid failed:", error);
      return null;
    }
  };

  const updateBid = async (
    bidId: number,
    data: BidUpdate,
  ): Promise<BidResponse | null> => {
    try {
      const res = await api.patch<BidResponse>(`/bids/${bidId}`, data);
      return res.data;
    } catch (error) {
      console.error("updateBid failed:", error);
      return null;
    }
  };

  const deleteBid = async (bidId: number): Promise<boolean> => {
    try {
      await api.delete(`/bids/${bidId}`);
      return true;
    } catch (error) {
      console.error("deleteBid failed:", error);
      return false;
    }
  };

  // --- Transactions -----------------------------------------
  const fetchSellerTransactions = async (): Promise<
    SellerTransactionResponse[]
  > => {
    try {
      const res = await api.get<SellerTransactionResponse[]>(
        "/transactions/my-selled-transactions",
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchSellerTransactions failed:", error);
      return [];
    }
  };

  const fetchBuyerTransactions = async (): Promise<
    BuyerTransactionResponse[]
  > => {
    try {
      const res = await api.get<BuyerTransactionResponse[]>(
        "/transactions/my-buyed-transactions",
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchBuyerTransactions failed:", error);
      return [];
    }
  };

  const createTransaction = async (
    itemId: number,
    bidId: number,
  ): Promise<SellerTransactionResponse | null> => {
    try {
      const res = await api.post<SellerTransactionResponse>(
        `/transactions/${itemId}/${bidId}`,
      );
      return res.data;
    } catch (error) {
      console.error("createTransaction failed:", error);
      return null;
    }
  };

  // --- Ratings ----------------------------------------------
  const fetchMyRatings = async (): Promise<RatingResponse[]> => {
    try {
      const res = await api.get<RatingResponse[]>("/ratings/my-ratings");
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchMyRatings failed:", error);
      return [];
    }
  };

  const updateRating = async (
    ratingId: number,
    score: number,
  ): Promise<RatingResponse | null> => {
    try {
      const res = await api.get<RatingResponse>(
        `/ratings/${ratingId}/${score}`,
      );
      return res.data;
    } catch (error) {
      console.error("updateRating failed:", error);
      return null;
    }
  };

  // --- Notifications ----------------------------------------
  const fetchNotifications = async (): Promise<NotificationResponse[]> => {
    try {
      const res = await api.get<NotificationResponse[]>("/notifications/");
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchNotifications failed:", error);
      return [];
    }
  };

  const readAllNotifications = async (): Promise<boolean> => {
    try {
      await api.get("/notifications/read_all");
      return true;
    } catch (error) {
      console.error("readAllNotifications failed:", error);
      return false;
    }
  };

  // --- Reports ----------------------------------------------
  const reportItem = async (
    itemId: number,
    data: ReportCreate,
  ): Promise<boolean> => {
    try {
      await api.post(`/reports/${itemId}`, data);
      return true;
    } catch (error) {
      console.error("reportItem failed:", error);
      return false;
    }
  };

  // --- Admin ------------------------------------------------
  const fetchReportedItems = async (
    skip = 0,
    limit = 10,
  ): Promise<AdminItemResponse[]> => {
    try {
      const res = await api.get<AdminItemResponse[]>("/admin/reported-items", {
        params: { skip, limit },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("fetchReportedItems failed:", error);
      return [];
    }
  };

  const fetchAdminItem = async (
    itemId: number,
  ): Promise<AdminUniqueItemResponse | null> => {
    try {
      const res = await api.get<AdminUniqueItemResponse>(`/admin/${itemId}`);
      return res.data;
    } catch (error) {
      console.error("fetchAdminItem failed:", error);
      return null;
    }
  };

  const deleteAdminItem = async (itemId: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/${itemId}`);
      return true;
    } catch (error) {
      console.error("deleteAdminItem failed:", error);
      return false;
    }
  };

  // --- Effects ----------------------------------------------
  useEffect(() => {
    fetchUser();
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

    fetchFeed,
    fetchSearchItems,
    fetchSelledItems,
    fetchBidedItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,

    uploadImage,
    deleteImage,

    createBid,
    updateBid,
    deleteBid,

    fetchSellerTransactions,
    fetchBuyerTransactions,
    createTransaction,

    fetchMyRatings,
    updateRating,

    fetchNotifications,
    readAllNotifications,

    reportItem,

    fetchReportedItems,
    fetchAdminItem,
    deleteAdminItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
