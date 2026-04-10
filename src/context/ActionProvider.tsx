import { createContext, useContext, type ReactNode } from "react";
import { api } from "./AuthProvider";
import type { AdminItemResponse, AdminUniqueItemResponse, BidHistoryResponse, BidResponse, BuyerTransactionResponse, ItemImageResponse, ItemResponse, RatingResponse, SellerTransactionResponse } from "../global/schema";
import type { ItemCategory } from "../global/types";
import type { BidCreate, BidUpdate, ItemCreate, ItemUpdate, ReportCreate } from "../global/request";
import { useNotifications } from "./NotificationProvides";

interface ActionContextType {
  fetchFeed: (skip?: number, limit?: number) => Promise<ItemResponse[]>;
  fetchSearchItems: (params: {
    search?: string;
    categories?: ItemCategory[];
    skip?: number;
    limit?: number;
  }) => Promise<ItemResponse[]>;
  fetchSelledItems: (skip?: number, limit?: number) => Promise<ItemResponse[]>;
  fetchBids: (skip?: number, limit?: number) => Promise<BidHistoryResponse[]>;
  fetchItem: (id: number) => Promise<ItemResponse | null>;
  createItem: (data: ItemCreate) => Promise<ItemResponse | null>;
  updateItem: (id: number, data: ItemUpdate) => Promise<string | null>;
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
const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const useAction = () => {
    const context = useContext(ActionContext);
    if(!context){
        throw new Error("useAction must be used within ActionProvider");
    }
    return context;
}

// --- Provider -----------------------------------------------
export const ActionProvider = ({ children }: { children: ReactNode }) => {
  const { fetchNotifications } = useNotifications();

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

  const fetchBids = async (
    skip = 0,
    limit = 10,
  ): Promise<BidHistoryResponse[]> => {
    try {
      const res = await api.get<BidHistoryResponse[]>("/items/bided-items", {
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
      await fetchNotifications();
      return res.data;
    } catch (error) {
      console.error("createItem failed:", error);
      return null;
    }
  };

  const updateItem = async (
    id: number,
    data: ItemUpdate,
  ): Promise<string | null> => {
    try {
      const res = await api.patch<string>(`/items/${id}`, data);
      await fetchNotifications();
      return res.data;
    } catch (error) {
      console.error("updateItem failed:", error);
      return null;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/items/${id}`);
      await fetchNotifications();
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

      switch (res.status) {
        case 200:
          await fetchNotifications();
          return res.data;
        default:
          console.error("uploadImage failed", res);
          return null;
      }
    } catch (error) {
      console.error("uploadImage failed:", error);
      return null;
    }
  };

  const deleteImage = async (imageId: number): Promise<boolean> => {
    try {
      await api.delete(`/images/${imageId}`);
      await fetchNotifications();
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

      switch (res.status) {
        case 200:
          await fetchNotifications();
          return res.data;
        default:
          console.error("createBid failed", res);
          return null;
      }
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
      await fetchNotifications();
      return res.data;
    } catch (error) {
      console.error("updateBid failed:", error);
      return null;
    }
  };

  const deleteBid = async (bidId: number): Promise<boolean> => {
    try {
      await api.delete(`/bids/${bidId}`);
      await fetchNotifications();
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
      switch (res.status) {
        case 200:
          return Array.isArray(res.data) ? res.data : [];
        case 404:
          break;
        default:
          console.error("fetchSellerTransactions failed:", res);
      }
      return [];
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
      switch (res.status) {
        case 200:
          return Array.isArray(res.data) ? res.data : [];
        case 404:
          break;
        default:
          console.error("fetchBuyerTransactions failed:", res);
      }
      return [];
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
      switch (res.status) {
        case 200:
          await fetchNotifications();
          return res.data;
        default:
          console.error("uploadImage failed", res);
          return null;
      }
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
      const res = await api.patch<RatingResponse>(
        `/ratings/${ratingId}/${score}`,
      );
      await fetchNotifications();
      return res.data;
    } catch (error) {
      console.error("updateRating failed:", error);
      return null;
    }
  };

  // --- Reports ----------------------------------------------
  const reportItem = async (
    itemId: number,
    data: ReportCreate,
  ): Promise<boolean> => {
    try {
      await api.post(`/reports/${itemId}`, data);
      await fetchNotifications();
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

  const value: ActionContextType = {
    //fetch
    fetchFeed,
    fetchSearchItems,
    fetchSelledItems,
    fetchBids,
    fetchItem,
    fetchSellerTransactions,
    fetchBuyerTransactions,
    fetchMyRatings,
    fetchReportedItems,
    fetchAdminItem,

    //create
    createItem,
    createBid,
    createTransaction,

    //update
    updateItem,
    updateBid,
    updateRating,
    
    //delete
    deleteItem,
    deleteImage,
    deleteBid,
    deleteAdminItem,

    //other
    uploadImage,
    reportItem,
  };

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  );
};