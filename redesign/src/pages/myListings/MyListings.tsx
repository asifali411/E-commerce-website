import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Edit01,
  Trash01,
  Monitor01,
  PencilLine,
  Building07,
  CheckCircle,
  Users01,
  Tag01,
} from "@untitledui/icons";
import styles from "./MyListings.module.css";
import type {
  ItemCategory,
  ItemCondition,
} from "../../components/itemCard/ItemCard";

// ── Types ──────────────────────────────────────────────────
type ItemStatus = "Active" | "Sold";

interface MyListing {
  id: number;
  title: string;
  description: string;
  minPrice: number;
  quantity: number;
  status: ItemStatus;
  category: ItemCategory;
  condition: ItemCondition;
  bids: number;
  createdAt: string;
}

type FilterTab = "All" | "Active" | "Sold";

// ── Mock data ──────────────────────────────────────────────
const MOCK_LISTINGS: MyListing[] = [
  {
    id: 1,
    title: 'Dell Monitor 24"',
    description: "Full HD IPS panel, barely used. Original box included.",
    minPrice: 3500,
    quantity: 1,
    status: "Active",
    category: "Electronics",
    condition: "Lightly Used",
    bids: 4,
    createdAt: "2025-06-12",
  },
  {
    id: 2,
    title: "DS Cormen Textbook",
    description: "Introduction to Algorithms, 3rd edition. Some highlights.",
    minPrice: 900,
    quantity: 1,
    status: "Active",
    category: "Stationary",
    condition: "Heavily Used",
    bids: 6,
    createdAt: "2025-06-10",
  },
  {
    id: 3,
    title: "HP Laptop 8GB RAM",
    description: "HP Pavilion, Core i5, 256GB SSD. Charger included.",
    minPrice: 18000,
    quantity: 1,
    status: "Sold",
    category: "Electronics",
    condition: "Lightly Used",
    bids: 9,
    createdAt: "2025-05-28",
  },
  {
    id: 4,
    title: "Single Room (Hostel)",
    description: "Ground floor, attached bath, available from July.",
    minPrice: 800,
    quantity: 1,
    status: "Active",
    category: "Rent",
    condition: "New",
    bids: 1,
    createdAt: "2025-06-14",
  },
  {
    id: 5,
    title: "Wildcraft Backpack 45L",
    description: "Barely used, ideal for trekking or daily college use.",
    minPrice: 650,
    quantity: 1,
    status: "Sold",
    category: "Miscellaneous",
    condition: "New",
    bids: 3,
    createdAt: "2025-06-01",
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

function ListingRow({
  listing,
  onEdit,
  onDelete,
}: {
  listing: MyListing;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isSold = listing.status === "Sold";

  return (
    <article className={`${styles.row} ${isSold ? styles.rowSold : ""}`}>
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        <Package size={20} className={styles.rowThumbIcon} />
        {isSold && <div className={styles.soldStamp}>Sold</div>}
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <h3 className={styles.rowTitle}>{listing.title}</h3>
        <p className={styles.rowDesc}>{listing.description}</p>
        <div className={styles.rowTags}>
          <span className={styles.categoryTag}>
            {CATEGORY_ICON[listing.category]}
            {listing.category}
          </span>
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[listing.condition]}`}
          >
            {listing.condition}
          </span>
          <span className={styles.metaChip}>Qty: {listing.quantity}</span>
          <span className={styles.metaChip}>Listed {listing.createdAt}</span>
        </div>
      </div>

      {/* Bids */}
      <div className={styles.rowBids}>
        <Users01 size={14} className={styles.rowBidsIcon} />
        <span className={styles.rowBidsCount}>{listing.bids}</span>
        <span className={styles.rowBidsLabel}>
          {listing.bids === 1 ? "bid" : "bids"}
        </span>
      </div>

      {/* Price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Min. price</span>
        <span className={styles.rowPriceValue}>
          ₹{listing.minPrice.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Status badge */}
      <div className={styles.rowStatus}>
        {isSold ? (
          <span className={`${styles.statusBadge} ${styles.statusSold}`}>
            <CheckCircle size={11} />
            Sold
          </span>
        ) : (
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            <span className={styles.activeDot} />
            Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={styles.rowActions}>
        {!isSold && (
          <>
            <button
              className={styles.actionBtn}
              onClick={() => onEdit(listing.id)}
              title="Edit listing"
            >
              <Edit01 size={14} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
              onClick={() => onDelete(listing.id)}
              title="Delete listing"
            >
              <Trash01 size={14} />
            </button>
          </>
        )}
        {isSold && <span className={styles.noActions}>—</span>}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function MyListings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered = MOCK_LISTINGS.filter((l) =>
    activeTab === "All" ? true : l.status === activeTab,
  );

  const totalActive = MOCK_LISTINGS.filter((l) => l.status === "Active").length;
  const totalSold = MOCK_LISTINGS.filter((l) => l.status === "Sold").length;

  function handleEdit(id: number) {
    navigate(`/items/${id}/edit`);
  }

  function handleDelete(id: number) {
    // TODO: DELETE /items/{item_id}
    console.log("delete", id);
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My Listings</h1>
          <div className={styles.stats}>
            <StatPill label="Total" value={MOCK_LISTINGS.length} />
            <StatPill label="Active" value={totalActive} />
            <StatPill label="Sold" value={totalSold} />
          </div>
        </div>
        <button
          className={styles.btnNew}
          onClick={() => navigate("/items/create")}
        >
          <Plus size={15} />
          New listing
        </button>
      </header>

      {/* ── Filter tabs ── */}
      <div className={styles.tabs}>
        {(["All", "Active", "Sold"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Active" && <span className={styles.tabDot} />}
            {tab}
            <span className={styles.tabCount}>
              {tab === "All"
                ? MOCK_LISTINGS.length
                : tab === "Active"
                  ? totalActive
                  : totalSold}
            </span>
          </button>
        ))}
      </div>

      {/* ── Listing rows ── */}
      {filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Tag01 size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No listings here yet</p>
          <p className={styles.emptySubtitle}>
            {activeTab === "Sold"
              ? "You haven't sold anything yet."
              : "Create your first listing to get started."}
          </p>
          {activeTab !== "Sold" && (
            <button
              className={styles.btnNew}
              onClick={() => navigate("/items/create")}
            >
              <Plus size={15} />
              New listing
            </button>
          )}
        </div>
      )}
    </div>
  );
}
