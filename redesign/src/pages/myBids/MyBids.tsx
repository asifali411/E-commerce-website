import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Edit01,
  Trash01,
  Monitor01,
  PencilLine,
  Building07,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  CurrencyRupee,
  ShoppingBag01,
} from "@untitledui/icons";
import styles from "./MyBids.module.css";
import type {
  ItemCategory,
  ItemCondition,
} from "../../components/itemCard/ItemCard";

// ── Types ──────────────────────────────────────────────────
type BidStatus = "Pending" | "Accepted" | "Rejected";

interface MyBid {
  bidId: number;
  itemId: number;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  seller: string;
  itemMinPrice: number;
  myBidPrice: number;
  myBidQuantity: number;
  status: BidStatus;
  placedAt: string;
}

type FilterTab = "All" | "Pending" | "Accepted" | "Rejected";

// ── Mock data ──────────────────────────────────────────────
const MOCK_BIDS: MyBid[] = [
  {
    bidId: 101,
    itemId: 1,
    title: 'Dell Monitor 24"',
    description: "Full HD IPS panel, barely used. Original box included.",
    category: "Electronics",
    condition: "Lightly Used",
    seller: "arjun_k",
    itemMinPrice: 3500,
    myBidPrice: 3800,
    myBidQuantity: 1,
    status: "Pending",
    placedAt: "2025-06-13",
  },
  {
    bidId: 102,
    itemId: 2,
    title: "DS Cormen Textbook",
    description: "Introduction to Algorithms, 3rd edition. Some highlights.",
    category: "Stationary",
    condition: "Heavily Used",
    seller: "ananya_t",
    itemMinPrice: 900,
    myBidPrice: 950,
    myBidQuantity: 1,
    status: "Accepted",
    placedAt: "2025-06-10",
  },
  {
    bidId: 103,
    itemId: 3,
    title: "HP Laptop 8GB RAM",
    description: "HP Pavilion, Core i5, 256GB SSD. Charger included.",
    category: "Electronics",
    condition: "Lightly Used",
    seller: "rohit_d",
    itemMinPrice: 18000,
    myBidPrice: 19500,
    myBidQuantity: 1,
    status: "Rejected",
    placedAt: "2025-05-29",
  },
  {
    bidId: 104,
    itemId: 4,
    title: "Single Room (Hostel)",
    description: "Ground floor, attached bath, available from July.",
    category: "Rent",
    condition: "New",
    seller: "vikram_s",
    itemMinPrice: 800,
    myBidPrice: 850,
    myBidQuantity: 1,
    status: "Pending",
    placedAt: "2025-06-14",
  },
  {
    bidId: 105,
    itemId: 5,
    title: "Scientific Calculator",
    description: "Casio fx-991ES Plus, perfect for engineering exams.",
    category: "Electronics",
    condition: "Lightly Used",
    seller: "kavitha_n",
    itemMinPrice: 350,
    myBidPrice: 370,
    myBidQuantity: 2,
    status: "Rejected",
    placedAt: "2025-06-05",
  },
  {
    bidId: 106,
    itemId: 6,
    title: "Wildcraft Backpack 45L",
    description: "Barely used, ideal for trekking or daily college use.",
    category: "Miscellaneous",
    condition: "New",
    seller: "suresh_m",
    itemMinPrice: 650,
    myBidPrice: 700,
    myBidQuantity: 1,
    status: "Accepted",
    placedAt: "2025-06-02",
  },
];

// ── Helpers ────────────────────────────────────────────────
const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Miscellaneous: <Package size={11} />,
};

const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  "Lightly Used": styles.conditionLight,
  "Heavily Used": styles.conditionHeavy,
};

// ── Sub-components ─────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function BidRow({
  bid,
  onEdit,
  onWithdraw,
  onViewTransaction,
}: {
  bid: MyBid;
  onEdit: (bidId: number) => void;
  onWithdraw: (bidId: number) => void;
  onViewTransaction: (itemId: number) => void;
}) {
  const isPending = bid.status === "Pending";
  const isAccepted = bid.status === "Accepted";
  const isRejected = bid.status === "Rejected";

  return (
    <article
      className={`${styles.row} ${isRejected ? styles.rowRejected : ""}`}
    >
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        <Package size={20} className={styles.rowThumbIcon} />
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <h3 className={styles.rowTitle}>{bid.title}</h3>
          <span className={styles.sellerChip}>by {bid.seller}</span>
        </div>
        <p className={styles.rowDesc}>{bid.description}</p>
        <div className={styles.rowTags}>
          <span className={styles.categoryTag}>
            {CATEGORY_ICON[bid.category]}
            {bid.category}
          </span>
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[bid.condition]}`}
          >
            {bid.condition}
          </span>
          <span className={styles.metaChip}>Placed {bid.placedAt}</span>
        </div>
      </div>

      {/* My bid */}
      <div className={styles.rowBidAmount}>
        <span className={styles.rowBidLabel}>Your bid</span>
        <span className={styles.rowBidValue}>
          ₹{bid.myBidPrice.toLocaleString("en-IN")}
        </span>
        {bid.myBidQuantity > 1 && (
          <span className={styles.rowBidQty}>× {bid.myBidQuantity}</span>
        )}
      </div>

      {/* Item min price */}
      <div className={styles.rowMinPrice}>
        <span className={styles.rowMinPriceLabel}>Min. price</span>
        <span className={styles.rowMinPriceValue}>
          ₹{bid.itemMinPrice.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Status */}
      <div className={styles.rowStatus}>
        {isPending && (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            <Clock size={11} />
            Pending
          </span>
        )}
        {isAccepted && (
          <span className={`${styles.statusBadge} ${styles.statusAccepted}`}>
            <CheckCircle size={11} />
            Accepted
          </span>
        )}
        {isRejected && (
          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
            <XCircle size={11} />
            Rejected
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={styles.rowActions}>
        {isPending && (
          <>
            <button
              className={styles.actionBtn}
              onClick={() => onEdit(bid.bidId)}
              title="Edit bid"
            >
              <Edit01 size={14} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
              onClick={() => onWithdraw(bid.bidId)}
              title="Withdraw bid"
            >
              <Trash01 size={14} />
            </button>
          </>
        )}
        {isAccepted && (
          <button
            className={styles.actionBtnTransaction}
            onClick={() => onViewTransaction(bid.itemId)}
            title="View transaction"
          >
            View transaction
            <ArrowRight size={13} />
          </button>
        )}
        {isRejected && (
          <button
            className={styles.actionBtnBidAgain}
            onClick={() => onEdit(bid.bidId)}
            title="Place a new bid"
          >
            Bid again
            <CurrencyRupee size={13} />
          </button>
        )}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function MyBids() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const countFor = (status: BidStatus) =>
    MOCK_BIDS.filter((b) => b.status === status).length;

  const filtered = MOCK_BIDS.filter((b) =>
    activeTab === "All" ? true : b.status === activeTab,
  );

  function handleEdit(bidId: number) {
    // TODO: PATCH /bids/{bid_id}
    console.log("edit bid", bidId);
  }

  function handleWithdraw(bidId: number) {
    // TODO: DELETE /bids/{bid_id}
    console.log("withdraw bid", bidId);
  }

  function handleViewTransaction(itemId: number) {
    // TODO: Handle transactions
    navigate("/me/transactions");
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My Bids</h1>
          <div className={styles.stats}>
            <StatPill label="Total" value={MOCK_BIDS.length} />
            <StatPill label="Pending" value={countFor("Pending")} />
            <StatPill label="Accepted" value={countFor("Accepted")} />
            <StatPill label="Rejected" value={countFor("Rejected")} />
          </div>
        </div>
        <button className={styles.btnBrowse} onClick={() => navigate("/")}>
          <ShoppingBag01 size={15} />
          Browse listings
        </button>
      </header>

      {/* ── Filter tabs ── */}
      <div className={styles.tabs}>
        {(["All", "Pending", "Accepted", "Rejected"] as FilterTab[]).map(
          (tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Pending" && <span className={styles.tabDotPending} />}
              {tab === "Accepted" && <span className={styles.tabDotAccepted} />}
              {tab === "Rejected" && <span className={styles.tabDotRejected} />}
              {tab}
              <span className={styles.tabCount}>
                {tab === "All" ? MOCK_BIDS.length : countFor(tab as BidStatus)}
              </span>
            </button>
          ),
        )}
      </div>

      {/* ── Bid rows ── */}
      {filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((bid) => (
            <BidRow
              key={bid.bidId}
              bid={bid}
              onEdit={handleEdit}
              onWithdraw={handleWithdraw}
              onViewTransaction={handleViewTransaction}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <ShoppingBag01 size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No bids here</p>
          <p className={styles.emptySubtitle}>
            {activeTab === "Rejected"
              ? "None of your bids have been rejected."
              : activeTab === "Accepted"
                ? "No bids have been accepted yet."
                : "You haven't placed any bids yet."}
          </p>
          {activeTab === "All" && (
            <button className={styles.btnBrowse} onClick={() => navigate("/")}>
              <ShoppingBag01 size={15} />
              Browse listings
            </button>
          )}
        </div>
      )}
    </div>
  );
}
