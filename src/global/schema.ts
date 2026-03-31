import type {
  ItemStatus,
  ItemCategory,
  ItemCondition,
  UserRole,
  BidStatus,
  ReportCategory,
  TransactionStatus,
  RatingStatus,
  NotificationType
} from "./types";

export interface Item {
  id: number;
  seller: {
    username: string;
    rating: number;
  };
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  status: ItemStatus;
  categories: ItemCategory[];
  condition: ItemCondition;
  images: string[];
}

export interface PublicUsersResponse {
  username: string;
  rating: number;
}

export interface ProtectedUserResponse {
  username: string;
  rating: number;
  phone_no: string;
  email: string;
}

export interface PrivateUsersResponse {
  username: string;
  email: string;
  phone_no: string;
  rating: number;
  locked: boolean;
  role: UserRole;
  disabled: boolean;
}

export interface ItemImageResponse {
  id: number;
  image_path: string;
}

export interface BidResponse {
  id: number;
  price: number;
  quantity: number;
  bider: PublicUsersResponse;
  status: BidStatus;
}

export interface ItemResponse {
  id: number;
  seller: PublicUsersResponse;
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  bid_count: number;
  status: ItemStatus;
  categories: ItemCategory[];
  condition: ItemCondition;
  images: ItemImageResponse[];
  bids: BidResponse[];
}

export interface ItemResponse {
  id: number;
  seller: PublicUsersResponse;
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  status: ItemStatus;
  categories: ItemCategory[];
  condition: ItemCondition;
  images: ItemImageResponse[];
}

export interface BidResponse {
  id: number;
  price: number;
  quantity: number;
  bider: PublicUsersResponse;
  status: BidStatus;
}

export interface AdminItemResponse {
  id: number;
  seller: ProtectedUserResponse;
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  status: ItemStatus;
  categories: ItemCategory[];
  condition: ItemCondition;
  images: ItemImageResponse[];
}

export interface ReportResponse {
  category: ReportCategory;
  description?: string | null;
  reporter: ProtectedUserResponse;
}

export interface AdminUniqueItemResponse extends AdminItemResponse {
  reports: ReportResponse[];
}

export interface SellerTransactionResponse {
  buyer: ProtectedUserResponse;
  price: number;
  status: TransactionStatus;
  quantity: number;
  item: ItemResponse;
}

export interface BuyerTransactionResponse {
  seller: ProtectedUserResponse;
  price: number;
  status: TransactionStatus;
  quantity: number;
  item: ItemResponse;
}

export interface RatingResponse {
  id: number;
  rated_user: PublicUsersResponse;
  score?: number | null;
  created_at: string;
  status: RatingStatus;
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  payload: Record<string, unknown>;
  created_at: string;
}