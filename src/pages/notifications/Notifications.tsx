import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell01,
  CheckCircle,
  XCircle,
  Star01,
  Plus,
  Edit01,
  Trash01,
  CurrencyRupee,
  CheckDone01,
  Tag01,
} from "@untitledui/icons";
import styles from "./Notifications.module.css";

// ── Types ──────────────────────────────────────────────────
type NotificationType =
  | "Item_Created"
  | "Item_Updated"
  | "Item_Deleted"
  | "Bid_Created"
  | "Bid_Updated"
  | "Bid_Accepted"
  | "Bid_Rejected"
  | "Bid_Deleted"
  | "Rating_Pending"
  | "Rating_Received";

type FilterChip = "All" | "Unread" | "Bids" | "Items" | "Ratings";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  payload?: Record<string, unknown>;
  created_at: string; // ISO string
}

// ── Mock data ──────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "Bid_Accepted",
    title: "Your bid was accepted!",
    message: 'arjun_k accepted your bid of ₹3,800 on "Dell Monitor 24"".',
    is_read: false,
    payload: { item_id: 1 },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 min ago
  },
  {
    id: 2,
    type: "Bid_Created",
    title: "New bid on your listing",
    message: 'meera_p placed a bid of ₹900 on "DS Cormen Textbook".',
    is_read: false,
    payload: { item_id: 2 },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
  },
  {
    id: 3,
    type: "Rating_Pending",
    title: "Rate your recent transaction",
    message: "You completed a transaction with suresh_m. Leave a rating now.",
    is_read: false,
    payload: { rating_id: 201 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hr ago
  },
  {
    id: 4,
    type: "Bid_Rejected",
    title: "Your bid was rejected",
    message: 'rohit_d rejected your bid on "HP Laptop 8GB RAM".',
    is_read: true,
    payload: { item_id: 3 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hr ago
  },
  {
    id: 5,
    type: "Item_Updated",
    title: "A listing you bid on was updated",
    message:
      'vikram_s updated "Single Room (Hostel)" — min price changed to ₹750.',
    is_read: true,
    payload: { item_id: 4 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hr ago
  },
  {
    id: 6,
    type: "Rating_Received",
    title: "You received a new rating",
    message:
      'priya_r gave you ★ 4 after your transaction on "Single Room (Hostel)".',
    is_read: true,
    payload: { rating_id: 3 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // yesterday
  },
  {
    id: 7,
    type: "Bid_Updated",
    title: "A bid on your listing was updated",
    message: 'kavitha_n updated their bid on "Scientific Calculator" to ₹400.',
    is_read: true,
    payload: { item_id: 8 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 8,
    type: "Item_Created",
    title: "Your listing is live",
    message: '"Wildcraft Backpack 45L" is now active and visible to buyers.',
    is_read: true,
    payload: { item_id: 7 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
  {
    id: 9,
    type: "Bid_Deleted",
    title: "A bid was withdrawn",
    message: 'suresh_m withdrew their bid on "Dell Monitor 24"".',
    is_read: true,
    payload: { item_id: 1 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
  },
  {
    id: 10,
    type: "Item_Deleted",
    title: "A listing you bid on was removed",
    message: 'ananya_t removed "Engineering Drawing Set" from the marketplace.',
    is_read: true,
    payload: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
  },
];

// ── Helpers ────────────────────────────────────────────────

// Relative time
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// Category of notification
function categoryOf(type: NotificationType): "Bids" | "Items" | "Ratings" {
  if (type.startsWith("Bid_")) return "Bids";
  if (type.startsWith("Item_")) return "Items";
  return "Ratings";
}

// Per-type icon + colour class
interface TypeMeta {
  icon: React.ReactNode;
  colorClass: string;
}

function getTypeMeta(type: NotificationType): TypeMeta {
  switch (type) {
    case "Bid_Accepted":
      return { icon: <CheckCircle size={16} />, colorClass: styles.iconGreen };
    case "Bid_Rejected":
      return { icon: <XCircle size={16} />, colorClass: styles.iconRed };
    case "Bid_Created":
      return { icon: <CurrencyRupee size={16} />, colorClass: styles.iconBlue };
    case "Bid_Updated":
      return { icon: <Edit01 size={16} />, colorClass: styles.iconBlue };
    case "Bid_Deleted":
      return { icon: <Trash01 size={16} />, colorClass: styles.iconRed };
    case "Item_Created":
      return { icon: <Plus size={16} />, colorClass: styles.iconTeal };
    case "Item_Updated":
      return { icon: <Edit01 size={16} />, colorClass: styles.iconBlue };
    case "Item_Deleted":
      return { icon: <Trash01 size={16} />, colorClass: styles.iconRed };
    case "Rating_Pending":
      return { icon: <Star01 size={16} />, colorClass: styles.iconAmber };
    case "Rating_Received":
      return { icon: <Star01 size={16} />, colorClass: styles.iconAmber };
  }
}

// Route to navigate to on click
function routeFor(n: Notification): string {
  const cat = categoryOf(n.type);
  if (cat === "Bids") return "/me/bids";
  if (cat === "Ratings") return "/me/ratings";
  
  const itemId = n.payload?.item_id as number | undefined;
  return itemId ? `/items/${itemId}` : "/";
}

// ── Sub-components ─────────────────────────────────────────
function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: (n: Notification) => void;
}) {
  const { icon, colorClass } = getTypeMeta(notification.type);
  const isUnread = !notification.is_read;

  return (
    <article
      className={`${styles.row} ${isUnread ? styles.rowUnread : ""}`}
      onClick={() => onClick(notification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(notification)}
    >
      {/* Type icon */}
      <div className={`${styles.rowIcon} ${colorClass}`}>{icon}</div>

      {/* Content */}
      <div className={styles.rowContent}>
        <p className={styles.rowTitle}>{notification.title}</p>
        <p className={styles.rowMessage}>{notification.message}</p>
      </div>

      {/* Right side: timestamp + unread dot */}
      <div className={styles.rowRight}>
        <span className={styles.rowTime}>
          {timeAgo(notification.created_at)}
        </span>
        {isUnread && <span className={styles.unreadDot} />}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeChip, setActiveChip] = useState<FilterChip>("All");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (activeChip === "All") return true;
    if (activeChip === "Unread") return !n.is_read;
    return categoryOf(n.type) === activeChip;
  });

  function handleMarkAllRead() {
    // TODO: GET /notifications/read_all
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function handleClick(n: Notification) {
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
    );
    navigate(routeFor(n));
  }

  const chips: FilterChip[] = ["All", "Unread", "Bids", "Items", "Ratings"];

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>

        {unreadCount > 0 && (
          <button className={styles.btnMarkRead} onClick={handleMarkAllRead}>
            <CheckDone01 size={15} />
            Mark all as read
          </button>
        )}
      </header>

      {/* ── Filter chips ── */}
      <div className={styles.chipRow}>
        {chips.map((chip) => (
          <button
            key={chip}
            className={`${styles.chip} ${activeChip === chip ? styles.chipActive : ""}`}
            onClick={() => setActiveChip(chip)}
          >
            {chip === "Bids" && <CurrencyRupee size={12} />}
            {chip === "Items" && <Tag01 size={12} />}
            {chip === "Ratings" && <Star01 size={12} />}
            {chip === "Unread" && unreadCount > 0 && (
              <span className={styles.chipUnreadDot} />
            )}
            {chip}
            {chip === "Unread" && unreadCount > 0 && (
              <span className={styles.chipCount}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification feed ── */}
      {filtered.length > 0 ? (
        <div className={styles.feed}>
          {filtered.map((n, i) => {
            // Date separator logic
            const currDay = new Date(n.created_at).toDateString();
            const prevDay =
              i > 0
                ? new Date(filtered[i - 1].created_at).toDateString()
                : null;
            const showSeparator = i === 0 || currDay !== prevDay;
            const separatorLabel = (() => {
              const diff = Math.floor(
                (Date.now() - new Date(n.created_at).getTime()) / 86400000,
              );
              if (diff === 0) return "Today";
              if (diff === 1) return "Yesterday";
              return new Date(n.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            })();

            return (
              <div key={n.id}>
                {showSeparator && (
                  <div className={styles.dateSeparator}>
                    <span className={styles.dateSeparatorLabel}>
                      {separatorLabel}
                    </span>
                  </div>
                )}
                <NotificationRow notification={n} onClick={handleClick} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <Bell01 size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            {activeChip === "Unread"
              ? "All caught up!"
              : "No notifications here"}
          </p>
          <p className={styles.emptySubtitle}>
            {activeChip === "Unread"
              ? "You have no unread notifications."
              : "Activity from bids, listings, and ratings will show up here."}
          </p>
        </div>
      )}
    </div>
  );
}
