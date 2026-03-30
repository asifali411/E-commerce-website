export type ItemCategory = "All" | "Electronics" | "Stationary" | "Rent" | "Misseleneous";
export type ItemCondition = "New" | "Lightly_Used" | "Heavily_Used";
export type ItemStatus = "Active" | "Sold";
export type BidStatus = "Accepted" | "Pending" | "Rejected";
export type TransactionStatus = "Pending" | "Completed";
export type RatingStatus = "Pending" | "Completed";
export type UserRole = "User" | "Admin";
export type NotificationType =
  | "Item_Created"
  | "Item_Updated"
  | "Item_Deleted"
  | "Bid_Created"
  | "Bid_Updated"
  | "Bid_Accepted"
  | "Bid_Rejected"
  | "Bid_Deleted"
  | "Rating_Pending"
  | "Rating_Received"
  | "Reported_Successfully";
export type ReportCategory =
  | "Illegal_Items"
  | "Explicit_or_Adult_Content"
  | "Restricted_or_Prohibited_Items"
  | "Inappropriate_Content";