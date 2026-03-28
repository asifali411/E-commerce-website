import { useState } from "react";
import styles from "./Notification.module.css";
import Top from "../../components/top/Top";
import NavBar from "../../components/nav/NavBar";
import { LucideIcon, CheckCheck, Check, X, ArrowUp, Handshake, Banknote, Star, PartyPopper, Bell, Package } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = "all" | "bids" | "transactions" | "ratings";

type NotifType =
  | "bid_received"
  | "bid_accepted"
  | "bid_rejected"
  | "bid_updated"
  | "transaction_pending"
  | "transaction_completed"
  | "rating_pending"
  | "rating_received"
  | "item_sold";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  meta?: {
    itemTitle?: string;
    bidPrice?: number;
    username?: string;
    ratingScore?: number;
  };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "bid_received",
    title: "New Bid Received",
    message: "goat vishy placed a bid on your listing",
    timestamp: "2 min ago",
    read: false,
    meta: { itemTitle: "Tool kit", bidPrice: 85.0, username: "goat vishy" },
  },
  {
    id: 2,
    type: "bid_accepted",
    title: "Bid Accepted!",
    message: "Your bid was accepted by the seller",
    timestamp: "14 min ago",
    read: false,
    meta: { itemTitle: "Headphones", bidPrice: 210.0, username: "thaa yo lee" },
  },
  {
    id: 3,
    type: "transaction_pending",
    title: "Meetup Pending",
    message: "Arrange a meetup to complete your transaction",
    timestamp: "1 hr ago",
    read: false,
    meta: { itemTitle: "Camera", username: "bruce lee" },
  },
  {
    id: 4,
    type: "rating_pending",
    title: "Rate Your Experience",
    message: "How was your transaction with thaa yo lee?",
    timestamp: "3 hr ago",
    read: true,
    meta: { username: "thaa yo lee" },
  },
  {
    id: 5,
    type: "bid_rejected",
    title: "Bid Declined",
    message: "The seller declined your bid",
    timestamp: "5 hr ago",
    read: true,
    meta: { itemTitle: "Keyboard", bidPrice: 120.0, username: "vishy broski" },
  },
  {
    id: 6,
    type: "transaction_completed",
    title: "Transaction Complete",
    message: "Your deal has been marked as completed",
    timestamp: "Yesterday",
    read: true,
    meta: { itemTitle: "iPad", username: "georgy hottiee" },
  },
  {
    id: 7,
    type: "rating_received",
    title: "You Were Rated",
    message: "georgy baddie left you a 5-star rating",
    timestamp: "Yesterday",
    read: true,
    meta: { username: "georgy baddie", ratingScore: 5 },
  },
  {
    id: 8,
    type: "item_sold",
    title: "Item Sold 🎉",
    message: "Congratulations! Your item has been sold",
    timestamp: "2 days ago",
    read: true,
    meta: { itemTitle: "Electrical Uniform", username: "baddy binu" },
  },
  {
    id: 9,
    type: "bid_updated",
    title: "Bid Updated",
    message: "baddy binu updated their bid on your listing",
    timestamp: "2 days ago",
    read: true,
    meta: { itemTitle: "Polaroid Camera", bidPrice: 65.0, username: "baddy binu" },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<NotifType, NotifCategory> = {
  bid_received: "bids",
  bid_accepted: "bids",
  bid_rejected: "bids",
  bid_updated: "bids",
  transaction_pending: "transactions",
  transaction_completed: "transactions",
  rating_pending: "ratings",
  rating_received: "ratings",
  item_sold: "transactions",
};

const TYPE_CONFIG: Record<
  NotifType,
  { icon: LucideIcon; accent: string; label: string }
> = {
  bid_received:         { icon: Check,        accent: "primary",     label: "Bid"         },
  bid_accepted:         { icon: CheckCheck,   accent: "secondary",   label: "Bid"         },
  bid_rejected:         { icon: X,            accent: "error",       label: "Bid"         },
  bid_updated:          { icon: ArrowUp,      accent: "primary",     label: "Bid"         },
  transaction_pending:  { icon: Handshake,    accent: "cta",         label: "Transaction" },
  transaction_completed:{ icon: Banknote,     accent: "secondary",   label: "Transaction" },
  rating_pending:       { icon: Star,         accent: "cta",         label: "Rating"      },
  rating_received:      { icon: Star,         accent: "secondary",   label: "Rating"      },
  item_sold:            { icon: PartyPopper,  accent: "secondary",   label: "Transaction" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];

  return (
    <div
      className={`${styles.card} ${!notif.read ? styles.unread : ""} ${styles[`accent_${cfg.accent}`]}`}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      <div className={styles.cardIcon}>{<cfg.icon />}</div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{notif.title}</span>
          <span className={styles.cardTime}>{notif.timestamp}</span>
        </div>

        <p className={styles.cardMessage}>{notif.message}</p>

        {notif.meta?.itemTitle && (
          <span className={styles.cardChip}><Package/> {notif.meta.itemTitle}</span>
        )}
        {notif.meta?.bidPrice && (
          <span className={`${styles.cardChip} ${styles.chipPrice}`}>
            &#8377; {notif.meta.bidPrice.toFixed(2)}
          </span>
        )}
        {notif.meta?.ratingScore && (
          <span className={`${styles.cardChip} ${styles.chipRating}`}>
            {"★".repeat(notif.meta.ratingScore)}{"☆".repeat(5 - notif.meta.ratingScore)}
          </span>
        )}
      </div>

      {!notif.read && <div className={styles.unreadDot} />}

      <button
        className={styles.deleteBtn}
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        aria-label="Dismiss"
      >
        <X/>
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotifCategory>("all");

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const deleteNotif = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // const markAllRead = () =>
  //   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // const clearAll = () => setNotifications([]);

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => CATEGORY_MAP[n.type] === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const TABS: { key: NotifCategory; label: string }[] = [
    { key: "all",          label: "All"          },
    { key: "bids",         label: "Bids"         },
    { key: "transactions", label: "Transactions" },
    { key: "ratings",      label: "Ratings"      },
  ];

  return (
    <div className={styles.page}>

      <Top />

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Notifications
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </h1>
          <p className={styles.subtitle}>Stay on top of your activity</p>
        </div>

        {/* <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={`${styles.actionBtn} ${styles.actionBtnGhost}`} onClick={markAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div> */}
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {TABS.map(({ key, label }) => {
          const count =
            key === "all"
              ? notifications.filter((n) => !n.read).length
              : notifications.filter(
                  (n) => CATEGORY_MAP[n.type] === key && !n.read
                ).length;

          return (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
              {count > 0 && <span className={styles.tabBadge}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><Bell/></span>
            <p className={styles.emptyTitle}>You're all caught up</p>
            <p className={styles.emptyText}>No notifications in this category.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotifCard
              key={n.id}
              notif={n}
              onRead={markRead}
              onDelete={deleteNotif}
            />
          ))
        )}
      </div>

      <NavBar></NavBar>
    </div>
  );
}
