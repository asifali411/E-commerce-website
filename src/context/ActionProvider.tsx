import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { api } from "./AuthProvider";
import type {
  BidHistoryResponse,
  BuyerTransactionResponse,
  CreateItemResponse,
  ItemResponse,
  RatingResponse,
  ReportResponse,
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
  fetchFeed: (skip?: number, limit?: number) => Promise<ItemResponse[] | [] | null>;
  fetchSearchItems: (params: {
    search?: string;
    categories?: ItemCategory[];
    skip?: number;
    limit?: number;
  }) => Promise<ItemResponse[] | [] | null>;
  fetchSelledItems: (skip?: number, limit?: number) => Promise<ItemResponse[] | [] | null>;
  fetchBids: (skip?: number, limit?: number) => Promise<BidHistoryResponse[] | [] | null>;
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
  fetchSellerTransactions: () => Promise<SellerTransactionResponse[] | [] | null>;
  fetchBuyerTransactions: () => Promise<BuyerTransactionResponse[] | [] | null>;
  createTransaction: (itemId: number, bidId: number) => Promise<boolean>;

  // Ratings
  fetchMyRatings: () => Promise<RatingResponse[] | [] | null>;
  updateRating: (ratingId: number, score: number) => Promise<boolean>;

  // Reports
  reportItem: (itemId: number, data: ReportCreate) => Promise<ReportResponse | null>;

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

// --- Helpers ------------------------------------------------

interface ErrorType {
  error_code: number;
  message: string;
}

async function handleRequest_GET<T>(
  url: string,
  config?: any,
): Promise<T | [] | null> {
  try {
    const res = await api.get<T | ErrorType>(url, config);
    const data = res.data;

    if (typeof data === "object" && data !== null && "error_code" in data) {
      if (data.error_code === 404) return [];

      console.error(data.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function handleRequest_POST<T>(
  url: string,
  data?: any,
  config?: any,
): Promise<T | [] | null> {
  try {
    const res = await api.post<T | ErrorType>(url, data, config);
    const responseData = res.data;

    if (typeof responseData === "object" && responseData !== null && "error_code" in responseData) {
      console.error(responseData.message);
      return responseData.error_code === 404 ? [] : null;
    }

    return responseData;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function handleRequest_PATCH<T>(
  url: string,
  data?: any,
  config?: any,
): Promise<T | [] | null> {
  try {
    const res = await api.patch<T | ErrorType>(url, data, config);
    const responseData = res.data;

    if (typeof responseData === "object" && responseData !== null && "error_code" in responseData) {
      console.error(responseData.message);
      return responseData.error_code === 404 ? [] : null;
    }

    return responseData;
  } catch (err) {
    console.error(err);
    return [];
  }
}


// --- Provider -----------------------------------------------
export const ActionProvider = ({ children }: { children: ReactNode }) => {

  // --- Items ------------------------------------------------

  const fetchFeed = useCallback(
    async (skip = 0, limit = 10): Promise<ItemResponse[] | [] | null> => {
      return await handleRequest_GET("/items/feed", {
        params: { skip, limit },
      });
    }, []);

  const fetchSearchItems = useCallback(
    async ({
      search,
      categories,
      skip = 0,
      limit = 10,
    }: {
      search?: string;
      categories?: ItemCategory[];
      skip?: number;
      limit?: number;
    }): Promise<ItemResponse[] | [] | null> => {
      return handleRequest_GET("/items/search", {
        params: { search, categories, skip, limit },
      });
    }, []);

  const fetchSelledItems = useCallback(async (
    skip = 0,
    limit = 10,
  ): Promise<ItemResponse[] | [] | null> => {
    return await handleRequest_GET<ItemResponse[]>("/items/selled-items", {
      params: {skip, limit},
    });
  }, []);

  const fetchBids = useCallback(async (
    skip = 0,
    limit = 10,
  ): Promise<BidHistoryResponse[] | [] | null> => {
    return await handleRequest_GET<BidHistoryResponse[]>("/items/bided-items", {
      params: { skip, limit },
    });
  }, []);

  const fetchItem = useCallback(async (id: number): Promise<UniqueItemResponse | null> => {
    try {
      const res = await api.get<UniqueItemResponse | ErrorType | null>(`/items/${id}`);
      const data = res.data;

      if(!res || !data) return null;

      if (typeof data === "object" && data !== null && "error_code" in data) {
        console.error(data.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const createItem = useCallback(async (data: ItemCreate): Promise<CreateItemResponse | null> => {
    try {
      const result = await handleRequest_POST<CreateItemResponse>("/items/create", data);
      return result as CreateItemResponse | null;
    } catch (error) {
      console.error("createItem failed:", error);
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id: number, data: ItemUpdate): Promise<string> => {
    try {
      const result = await handleRequest_PATCH<string>(`/items/${id}`, data);
      return (result as string) ?? "";
    } catch (error) {
      console.error("updateItem failed:", error);
      return "";
    }
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/items/${id}`);
      return true;
    } catch (error) {
      console.error("deleteItem failed:", error);
      return false;
    }
  }, []);

  // --- Images -----------------------------------------------

  const uploadImage = useCallback(async (itemId: number, file: File): Promise<boolean> => {
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
  }, []);

  const deleteImage = useCallback(async (imageId: number): Promise<boolean> => {
    try {
      await api.delete(`/images/${imageId}`);
      return true;
    } catch (error) {
      console.error("deleteImage failed:", error);
      return false;
    }
  }, []);

  // --- Bids -------------------------------------------------

  const createBid = useCallback(async (
    itemId: number,
    data: BidCreate,
  ): Promise<boolean> => {
    try {
      const res = await api.post(`/bids/${itemId}`, data);
      return res.status === 200;
    } catch (error) {
      console.error("createBid failed:", error);
      return false;
    }
  }, []);

  const updateBid = useCallback(async (
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
  }, []);

  const deleteBid = useCallback(async (bidId: number): Promise<boolean> => {
    try {
      await api.delete(`/bids/${bidId}`);
      return true;
    } catch (error) {
      console.error("deleteBid failed:", error);
      return false;
    }
  }, []);

  // --- Transactions -----------------------------------------

  const fetchSellerTransactions = useCallback(async (): Promise<
    SellerTransactionResponse[] | [] | null
  > => {
    return await handleRequest_GET("/transactions/my-selled-transactions");
  }, []);

  const fetchBuyerTransactions = useCallback(async (): Promise<
    BuyerTransactionResponse[] | [] | null
  > => {
    return await handleRequest_GET("/transactions/my-buyed-transactions");
  }, []);

  const createTransaction = useCallback(async (
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
  }, []);

  // --- Ratings ----------------------------------------------

  const fetchMyRatings = useCallback(async (): Promise<RatingResponse[] | [] | null> => {
    return await handleRequest_GET("/ratings/my-ratings");
  }, []);

  const updateRating = useCallback(async (
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
  }, []);

  // --- Reports ----------------------------------------------

  const reportItem = useCallback(async (
    itemId: number,
    data: ReportCreate,
  ): Promise<ReportResponse | null> => {
    try {
      const result = await handleRequest_POST<ReportResponse>(`/reports/${itemId}`, data);
      return result as ReportResponse | null;
    } catch (error) {
      console.error("reportItem failed:", error);
      return null;
    }
  }, []);

  // --- Profile ----------------------------------------------

  const updateAvatar = useCallback(async (image: File): Promise<boolean> => {
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
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    
    // below deps is not neccessarily needed, but it makes linter happy :D
     [
      fetchFeed,
      fetchSearchItems,
      fetchSelledItems,
      fetchBids,
      fetchItem,
      fetchSellerTransactions,
      fetchBuyerTransactions,
      fetchMyRatings,
      createItem,
      createBid,
      createTransaction,
      updateItem,
      updateBid,
      updateRating,
      updateAvatar,
      deleteItem,
      deleteImage,
      deleteBid,
      uploadImage,
      reportItem,
    ],
  );

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  );
};
