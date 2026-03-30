export type ItemCategory = "Electronics" | "Stationary" | "Rent" | "Misseleneous";
export type ItemCondition = "New" | "Lightly_Used" | "Heavily_Used";
export type ItemStatus = "Active" | "Sold";
export type BidStatus = "Accepted" | "Pending" | "Rejected";

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
  status: ItemStatus;
  categories: ItemCategory[];
  condition: ItemCondition;
  images: ItemImageResponse[];
  bids: BidResponse[];
}