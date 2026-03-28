import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Monitor01,
  PencilLine,
  Building07,
  CheckCircle,
  Clock,
  Star01,
  ArrowRight,
  User01,
  ShoppingBag01,
  Tag01,
} from "@untitledui/icons";
import styles from "./Transactions.module.css";
import type {
  ItemCategory,
  ItemCondition,
} from "../../components/itemCard/ItemCard";

// ── Types ──────────────────────────────────────────────────
type TransactionStatus = "Pending" | "Completed";
type RatingStatus = "Pending" | "Completed" | "N/A";
type Role = "Buyer" | "Seller";
type FilterTab = "All" | "Pending" | "Completed";

interface Transaction {
  id: number;
  itemId: number;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  agreedPrice: number;
  quantity: number;
  counterparty: string; // seller name (as buyer) or buyer name (as seller)
  role: Role;
  status: TransactionStatus;
  ratingStatus: RatingStatus;
  ratingId?: number;
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  // ── As Buyer ──
  {
    id: 1,
    itemId: 2,
    title: "DS Cormen Textbook",
    description: "Introduction to Algorithms, 3rd edition. Some highlights.",
    category: "Stationary",
    condition: "Heavily Used",
    agreedPrice: 950,
    quantity: 1,
    counterparty: "ananya_t",
    role: "Buyer",
    status: "Completed",
    ratingStatus: "Pending",
    ratingId: 201,
    createdAt: "2025-06-11",
  },
  {
    id: 2,
    itemId: 6,
    title: "Wildcraft Backpack 45L",
    description: "Barely used, ideal for trekking or daily college use.",
    category: "Miscellaneous",
    condition: "New",
    agreedPrice: 700,
    quantity: 1,
    counterparty: "suresh_m",
    role: "Buyer",
    status: "Pending",
    ratingStatus: "N/A",
    createdAt: "2025-06-03",
  },
  // ── As Seller ──
  {
    id: 3,
    itemId: 1,
    title: 'Dell Monitor 24"',
    description: "Full HD IPS panel, barely used. Original box included.",
    category: "Electronics",
    condition: "Lightly Used",
    agreedPrice: 3800,
    quantity: 1,
    counterparty: "meera_p",
    role: "Seller",
    status: "Completed",
    ratingStatus: "Completed",
    createdAt: "2025-06-09",
  },
  {
    id: 4,
    itemId: 4,
    title: "Single Room (Hostel)",
    description: "Ground floor, attached bath, available from July.",
    category: "Rent",
    condition: "New",
    agreedPrice: 850,
    quantity: 1,
    counterparty: "priya_r",
    role: "Seller",
    status: "Pending",
    ratingStatus: "N/A",
    createdAt: "2025-06-15",
  },
  {
    id: 5,
    itemId: 7,
    title: "HP Laptop 8GB RAM",
    description: "HP Pavilion, Core i5, 256GB SSD. Charger included.",
    category: "Electronics",
    condition: "Lightly Used",
    agreedPrice: 19500,
    quantity: 1,
    counterparty: "rohit_d",
    role: "Seller",
    status: "Completed",
    ratingStatus: "Pending",
    ratingId: 202,
    createdAt: "2025-05-30",
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

// ── Star rating picker ─────────────────────────────────────
function StarPicker({ onRate }: { onRate: (score: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.starPicker}>
      <span className={styles.starPickerLabel}>Rate:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={`${styles.starBtn} ${hovered >= n ? styles.starBtnActive : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(n)}
          title={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star01 size={15} />
        </button>
      ))}
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Transaction row ────────────────────────────────────────
function TransactionRow({
  tx,
  onMarkComplete,
  onRate,
}: {
  tx: Transaction;
  onMarkComplete: (id: number) => void;
  onRate: (ratingId: number, score: number) => void;
}) {
  const isPending = tx.status === "Pending";
  const isCompleted = tx.status === "Completed";
  const needsRating =
    isCompleted && tx.ratingStatus === "Pending" && tx.ratingId != null;
  const ratedDone = isCompleted && tx.ratingStatus === "Completed";

  return (
    <article className={`${styles.row} ${isPending ? styles.rowPending : ""}`}>
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        <Package size={20} className={styles.rowThumbIcon} />
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <h3 className={styles.rowTitle}>{tx.title}</h3>
          <span
            className={`${styles.roleChip} ${tx.role === "Buyer" ? styles.roleChipBuyer : styles.roleChipSeller}`}
          >
            {tx.role === "Buyer" ? "Bought" : "Sold"}
          </span>
        </div>
        <p className={styles.rowDesc}>{tx.description}</p>
        <div className={styles.rowTags}>
          <span className={styles.categoryTag}>
            {CATEGORY_ICON[tx.category]}
            {tx.category}
          </span>
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[tx.condition]}`}
          >
            {tx.condition}
          </span>
          <span className={styles.metaChip}>{tx.createdAt}</span>
        </div>
      </div>

      {/* Counterparty */}
      <div className={styles.rowParty}>
        <span className={styles.rowPartyLabel}>
          {tx.role === "Buyer" ? "Seller" : "Buyer"}
        </span>
        <div className={styles.rowPartyName}>
          <User01 size={12} className={styles.rowPartyIcon} />
          {tx.counterparty}
        </div>
      </div>

      {/* Agreed price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Agreed price</span>
        <span className={styles.rowPriceValue}>
          ₹{tx.agreedPrice.toLocaleString("en-IN")}
        </span>
        {tx.quantity > 1 && (
          <span className={styles.rowPriceQty}>× {tx.quantity}</span>
        )}
      </div>

      {/* Status */}
      <div className={styles.rowStatus}>
        {isPending ? (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            <Clock size={11} />
            Pending
          </span>
        ) : (
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
            <CheckCircle size={11} />
            Completed
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={styles.rowActions}>
        {/* Seller can mark pending transactions as complete */}
        {isPending && tx.role === "Seller" && (
          <button
            className={styles.actionBtnComplete}
            onClick={() => onMarkComplete(tx.id)}
            title="Mark as completed"
          >
            <CheckCircle size={13} />
            Mark complete
          </button>
        )}

        {isPending && tx.role === "Buyer" && (
          <span className={styles.awaitingLabel}>
            <Clock size={12} />
            Awaiting seller
          </span>
        )}

        {needsRating && (
          <StarPicker onRate={(score) => onRate(tx.ratingId!, score)} />
        )}

        {ratedDone && (
          <span className={styles.ratedLabel}>
            <Star01 size={12} />
            Rated
          </span>
        )}

        {isCompleted && tx.ratingStatus === "N/A" && (
          <span className={styles.noActions}>—</span>
        )}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function Transactions() {
  const navigate = useNavigate();
  const [roleView, setRoleView] = useState<Role>("Buyer");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const roleFiltered = MOCK_TRANSACTIONS.filter((t) => t.role === roleView);
  const countFor = (status: TransactionStatus) =>
    roleFiltered.filter((t) => t.status === status).length;

  const filtered = roleFiltered.filter((t) =>
    activeTab === "All" ? true : t.status === activeTab,
  );

  const buyerCount = MOCK_TRANSACTIONS.filter((t) => t.role === "Buyer").length;
  const sellerCount = MOCK_TRANSACTIONS.filter(
    (t) => t.role === "Seller",
  ).length;

  function handleMarkComplete(id: number) {
    // TODO: POST /transactions/{item_id}/{bid_id}
    console.log("mark complete", id);
  }

  function handleRate(ratingId: number, score: number) {
    // TODO GET /ratings/{rating_id}/{score}
    console.log("rate", ratingId, score);
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <div className={styles.stats}>
            <StatPill label="Total" value={roleFiltered.length} />
            <StatPill label="Pending" value={countFor("Pending")} />
            <StatPill label="Completed" value={countFor("Completed")} />
          </div>
        </div>

        {/* Role switcher */}
        <div className={styles.roleSwitcher}>
          <button
            className={`${styles.roleBtn} ${roleView === "Buyer" ? styles.roleBtnActive : ""}`}
            onClick={() => {
              setRoleView("Buyer");
              setActiveTab("All");
            }}
          >
            <ShoppingBag01 size={14} />
            As Buyer
            <span className={styles.roleBtnCount}>{buyerCount}</span>
          </button>
          <button
            className={`${styles.roleBtn} ${roleView === "Seller" ? styles.roleBtnActive : ""}`}
            onClick={() => {
              setRoleView("Seller");
              setActiveTab("All");
            }}
          >
            <Tag01 size={14} />
            As Seller
            <span className={styles.roleBtnCount}>{sellerCount}</span>
          </button>
        </div>
      </header>

      {/* ── Filter tabs ── */}
      <div className={styles.tabs}>
        {(["All", "Pending", "Completed"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Pending" && <span className={styles.tabDotPending} />}
            {tab === "Completed" && <span className={styles.tabDotCompleted} />}
            {tab}
            <span className={styles.tabCount}>
              {tab === "All"
                ? roleFiltered.length
                : countFor(tab as TransactionStatus)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Transaction rows ── */}
      {filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onMarkComplete={handleMarkComplete}
              onRate={handleRate}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <ArrowRight size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No transactions here</p>
          <p className={styles.emptySubtitle}>
            {roleView === "Buyer"
              ? "Transactions appear here when a seller accepts your bid."
              : "Transactions appear here when you accept a buyer's bid."}
          </p>
          {roleView === "Buyer" && (
            <button
              className={styles.btnSecondary}
              onClick={() => navigate("/")}
            >
              <ShoppingBag01 size={15} />
              Browse listings
            </button>
          )}
          {roleView === "Seller" && (
            <button
              className={styles.btnSecondary}
              onClick={() => navigate("/me/listings")}
            >
              <Tag01 size={15} />
              View my listings
            </button>
          )}
        </div>
      )}
    </div>
  );
}
