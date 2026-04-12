import type {
  ItemStatus,
  ItemCategory,
  ItemCondition,
  UserRole,
  BidStatus,
  ReportCategory,
  TransactionStatus,
  RatingStatus,
  NotificationType,
} from "./types";

export interface PublicUsersResponse {
  username: string;
  rating: number;
  image_path: string | null;
}

export interface ProtectedUserResponse {
  username: string;
  rating: number;
  phone_no: string;
  email: string;
  image_path: string | null;
}

export interface PrivateUsersResponse {
  username: string;
  email: string;
  phone_no: string;
  rating: number;
  locked: boolean;
  role: UserRole;
  image_path: string | null;
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
}

export interface UniqueItemResponse extends ItemResponse {
  bids: BidResponse[];
}

export interface AdminItemResponse {
  id: number;
  seller: ProtectedUserResponse;
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  bid_count: number;
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

export interface BidItemResponse {
  id: number;
  title: string;
  seller: PublicUsersResponse;
  min_price: number;
  categories: ItemCategory[];
  condition: ItemCondition;
}

export interface BidHistoryResponse {
  id: number;
  price: number;
  quantity: number;
  bider: PublicUsersResponse;
  status: BidStatus;
  item: BidItemResponse;
}

export interface SellerTransactionItemResponse {
  id: number;
  title: string;
  categories: ItemCategory[];
  condition: ItemCondition;
}

export interface SellerTransactionResponse {
  buyer: ProtectedUserResponse;
  price: number;
  status: TransactionStatus;
  quantity: number;
  item: SellerTransactionItemResponse;
}

export interface BuyerTransactionItemResponse {
  id: number;
  title: string;
  seller: ProtectedUserResponse;
  categories: ItemCategory[];
  condition: ItemCondition;
}

export interface BuyerTransactionResponse {
  price: number;
  status: TransactionStatus;
  quantity: number;
  item: BuyerTransactionItemResponse;
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
