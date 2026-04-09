import { useState, useEffect } from "react";
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
import { useAuth } from "../../context/AuthProvider";
import type { ItemResponse } from "../../global/schema";
import Dialog from "../../components/dialog/Dialog";
import ItemDialog from "../../components/itemDialog/ItemDialog";
import Spinner from "../../components/spinner/Spinner";
import { useAction } from "../../context/ActionProvider";

// ── Types ──────────────────────────────────────────────────
type FilterTab = "All" | "Active" | "Sold";

// ── Helpers ────────────────────────────────────────────────
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Misseleneous: <Package size={11} />,
};

const CONDITION_CLASS: Record<string, string> = {
  New: styles.conditionNew,
  Lightly_Used: styles.conditionLight,
  Heavily_Used: styles.conditionHeavy,
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
  onClick
}: {
  listing: ItemResponse;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: () => void;
}) {
  const isSold = listing.status === "Sold";
  const firstImage = listing.images?.[0]?.image_path ?? null;

  return (
    <article
      className={`${styles.row} ${isSold ? styles.rowSold : ""}`}
      onClick={() => onClick()}
    >
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        {firstImage ? (
          <img
            src={`/api/${firstImage}`}
            alt={listing.title}
            className={styles.rowThumbImg}
          />
        ) : (
          <Package size={20} className={styles.rowThumbIcon} />
        )}
        {isSold && <div className={styles.soldStamp}>Sold</div>}
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <h3 className={styles.rowTitle}>{listing.title}</h3>
        <p className={styles.rowDesc}>{listing.description}</p>
        <div className={styles.rowTags}>
          {listing.categories?.map((cat) => (
            <span key={cat} className={styles.categoryTag}>
              {CATEGORY_ICON[cat] ?? <Package size={11} />}
              {cat}
            </span>
          ))}
          <span
            className={`${styles.conditionTag} ${
              CONDITION_CLASS[listing.condition] ?? ""
            }`}
          >
            {listing.condition.replace("_", " ")}
          </span>
          <span className={styles.metaChip}>Qty: {listing.quantity}</span>
        </div>
      </div>

      {/* Bids */}
      <div className={styles.rowBids}>
        <Users01 size={14} className={styles.rowBidsIcon} />
        <span className={styles.rowBidsCount}>{listing.bid_count}</span>
        <span className={styles.rowBidsLabel}>
          {listing.bid_count === 1 ? "bid" : "bids"}
        </span>
      </div>

      {/* Price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Min. price</span>
        <span className={styles.rowPriceValue}>
          ₹{listing.min_price.toLocaleString("en-IN")}
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
        {!isSold ? (
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
        ) : (
          <span className={styles.noActions}>—</span>
        )}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function MyListings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchSelledItems, deleteItem } = useAction();

  const [listings, setListings] = useState<ItemResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        if (isAuthenticated) {
          const items = await fetchSelledItems(0, 50);
          setListings(items);
        }
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const filtered = listings.filter((l) =>
    activeTab === "All" ? true : l.status === activeTab,
  );

  const totalActive = listings.filter((l) => l.status === "Active").length;
  const totalSold = listings.filter((l) => l.status === "Sold").length;

  function handleEdit(id: number) {
    navigate(`/items/${id}/edit`);
  }

  function handleOpenDelete(id: number) {
    setDeleteItemId(id);
    setOpenDeleteDialog(true);
  }

  async function handleDelete() {
    if (deleteItemId == null) return;

    setDeleting(true);
    try {
      const ok = await deleteItem(deleteItemId);

      if (ok) {
        setListings((prev) => prev.filter((l) => l.id !== deleteItemId));
      }
    } finally {
      setDeleting(false);
      setDeleteItemId(null);
      setOpenDeleteDialog(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Dialog ── */}
      <Dialog
        open={openDeleteDialog}
        title="Delete Item"
        description="This action cannot be reversed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setOpenDeleteDialog(false);
            setDeleteItemId(null);
          }
        }}
      />

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My Listings</h1>
          <div className={styles.stats}>
            <StatPill label="Total" value={listings.length} />
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
            className={`${styles.tab} ${
              activeTab === tab ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Active" && <span className={styles.tabDot} />}
            {tab}
            <span className={styles.tabCount}>
              {tab === "All"
                ? listings.length
                : tab === "Active"
                  ? totalActive
                  : totalSold}
            </span>
          </button>
        ))}
      </div>

      {/* ── Listing rows ── */}
      {loadingData ? (
        <div className={styles.empty}>
          <Spinner />
          <p className={styles.emptySubtitle}>Loading your listings…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleOpenDelete}
              onClick={() => setSelectedItemId(listing.id)}
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

      <ItemDialog
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onBidAccepted={() => {
          /* refresh your listings list */
        }}
      />
    </div>
  );
}
