import { useEffect, useState } from "react";
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
import { useAuth } from "../../context/AuthProvider";
import type { NotificationResponse } from "../../global/schema";
import type { NotificationType } from "../../global/types";
import Spinner from "../../components/spinner/Spinner";
import { useNotifications } from "../../context/NotificationProvider";

// ── Types ──────────────────────────────────────────────────

type FilterChip = "All" | "Unread" | "Bids" | "Items" | "Ratings";

// ── Helpers ────────────────────────────────────────────────

function timeAgo(iso: string): string {
  if(!iso) return "";
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

function categoryOf(type: NotificationType): "Bids" | "Items" | "Ratings" {
  if (type.startsWith("Bid_")) return "Bids";
  if (type.startsWith("Item_")) return "Items";
  return "Ratings";
}

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
    default:
      return { icon: <Bell01 size={16} />, colorClass: styles.iconBlue };
  }
}

function routeFor(n: NotificationResponse): string {
  const cat = categoryOf(n.type);
  if (cat === "Bids") return "/bids";
  if (cat === "Ratings") return "/ratings";
  
  const itemId = n.payload?.item_id as number | undefined;
  return itemId ? `/items/${itemId}` : "/";
}

// ── Sub-components ─────────────────────────────────────────
function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationResponse;
  onClick: (n: NotificationResponse) => void;
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

  const { isAuthenticated } = useAuth();
  let loadingData = false;

  const { notifications, fetchNotifications, markAllRead } = useNotifications();
  const [activeChip, setActiveChip] = useState<FilterChip>("All");

  let unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (activeChip === "All") return true;
    if (activeChip === "Unread") return !n.is_read;
    return categoryOf(n.type) === activeChip;
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  function handleMarkAllRead() {
    markAllRead();
  }

  function handleClick(n: NotificationResponse) {
    
    navigate(routeFor(n));
  }

  function handleNotificationFeed() {
    if(loadingData){
      return (
        <div className={styles.empty}>
          <Spinner />
          <p className={styles.emptySubtitle}>Loading your Notifications…</p>
        </div>
      );
    } else if (filtered.length > 0){
      return (
        <div className={styles.feed}>
          {filtered.map((n, i) => {
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
      );
    } else {
      return (
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
      );
    }
  }

  const chips: FilterChip[] = ["All", "Unread", "Bids", "Items", "Ratings"];

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Notifications</h1>
          {isAuthenticated && unreadCount > 0 && (
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
      {handleNotificationFeed()}

    </div>
  );
}
