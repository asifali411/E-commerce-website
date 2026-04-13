import { createContext, useContext, type ReactNode } from "react";
import { api } from "./AuthProvider";
import type {
  BidHistoryResponse,
  BuyerTransactionResponse,
  CreateItemResponse,
  ItemResponse,
  RatingResponse,
  SellerTransactionResponse,
  UniqueItemResponse,
} from "../global/schema";
import type { ItemCategory } from "../global/types";
import type {
  BidCreate,
  BidUpdate,
  ItemCreate,
  ItemUpdate,
  ReportCreate,
} from "../global/request";

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
  fetchItem: (id: number) => Promise<UniqueItemResponse | null>;
  createItem: (data: ItemCreate) => Promise<CreateItemResponse | null>;
  updateItem: (id: number, data: ItemUpdate) => Promise<string>;
  deleteItem: (id: number) => Promise<boolean>;

  // Images
  uploadImage: (itemId: number, file: File) => Promise<boolean>;
  deleteImage: (imageId: number) => Promise<boolean>;

  // Bids
  createBid: (itemId: number, data: BidCreate) => Promise<boolean>;
  updateBid: (bidId: number, data: BidUpdate) => Promise<boolean>;
  deleteBid: (bidId: number) => Promise<boolean>;

  // Transactions
  fetchSellerTransactions: () => Promise<SellerTransactionResponse[]>;
  fetchBuyerTransactions: () => Promise<BuyerTransactionResponse[]>;
  createTransaction: (itemId: number, bidId: number) => Promise<boolean>;

  // Ratings
  fetchMyRatings: () => Promise<RatingResponse[]>;
  updateRating: (ratingId: number, score: number) => Promise<boolean>;

  // Reports
  reportItem: (itemId: number, data: ReportCreate) => Promise<boolean>;

  // Profile
  updateAvatar: (image: File) => Promise<boolean>;
}

// --- Context ------------------------------------------------
const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const useAction = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("useAction must be used within ActionProvider");
  }
  return context;
};

// --- Provider -----------------------------------------------
export const ActionProvider = ({ children }: { children: ReactNode }) => {

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

  const fetchItem = async (id: number): Promise<UniqueItemResponse | null> => {
    try {
      const res = await api.get<UniqueItemResponse>(`/items/${id}`);
      return res.data;
    } catch (error) {
      console.error("fetchItem failed:", error);
      return null;
    }
  };

  const createItem = async (data: ItemCreate): Promise<CreateItemResponse | null> => {
    try {
      const res = await api.post("/items/create", data);
      if(res.status === 200){
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("createItem failed:", error);
      return null;
    }
  };

  const updateItem = async (id: number, data: ItemUpdate): Promise<string> => {
    try {
      const res = await api.patch<string>(`/items/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("updateItem failed:", error);
      return "";
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

  const uploadImage = async (itemId: number, file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.post(`/images/${itemId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return true;
    } catch (error) {
      console.error("uploadImage failed:", error);
      return false;
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
  ): Promise<boolean> => {
    try {
      const res = await api.post(`/bids/${itemId}`, data);
      if(res.status === 200){
        return true;
      }
      return false;
    } catch (error) {
      console.error("createBid failed:", error);
      return false;
    }
  };

  const updateBid = async (
    bidId: number,
    data: BidUpdate,
  ): Promise<boolean> => {
    try {
      await api.patch(`/bids/${bidId}`, data);
      return true;
    } catch (error) {
      console.error("updateBid failed:", error);
      return false;
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
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
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
  ): Promise<boolean> => {
    try {
      await api.post(`/transactions/${itemId}/${bidId}`);
      return true;
    } catch (error) {
      console.error("createTransaction failed:", error);
      return false;
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
  ): Promise<boolean> => {
    try {
      await api.get(`/ratings/${ratingId}/${score}`);
      return true;
    } catch (error) {
      console.error("updateRating failed:", error);
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

  // --- Profile ----------------------------------------------

  const updateAvatar = async (image: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      await api.post("/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return true;
    } catch (error) {
      console.error("updateAvatar failed:", error);
      return false;
    }
  };

  const value: ActionContextType = {
    // fetch
    fetchFeed,
    fetchSearchItems,
    fetchSelledItems,
    fetchBids,
    fetchItem,
    fetchSellerTransactions,
    fetchBuyerTransactions,
    fetchMyRatings,

    // create
    createItem,
    createBid,
    createTransaction,

    // update
    updateItem,
    updateBid,
    updateRating,
    updateAvatar,

    // delete
    deleteItem,
    deleteImage,
    deleteBid,

    // other
    uploadImage,
    reportItem,
  };

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  );
};
