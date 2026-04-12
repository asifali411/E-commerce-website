import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Edit01,
  Trash01,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  CurrencyRupee,
  ShoppingBag01,
} from "@untitledui/icons";
import styles from "./MyBids.module.css";
import type { ItemCondition, BidStatus } from "../../global/types";
import type { BidHistoryResponse } from "../../global/schema";
import { useAuth } from "../../context/AuthProvider";
import Dialog from "../../components/dialog/Dialog";
import Spinner from "../../components/spinner/Spinner";
import { useAction } from "../../context/ActionProvider";
import { CATEGORY_ICON } from "../../global/var";

// ── Types ──────────────────────────────────────────────────

type FilterTab = "All" | "Pending" | "Accepted" | "Rejected";

// ── Mock data ──────────────────────────────────────────────

const MOCK_BIDS: BidHistoryResponse[] = [
  {
    "id": 0,
    "price": 69,
    "quantity": 1,
    "bider": {
      "username": "user",
      "rating": 2.5
    },
    "status": "Accepted",
    "item": {
      "id": 0,
      "title": "string",
      "seller": {
        "username": "string",
        "rating": 2.5
      },
      "min_price": 470,
      "categories": [
        "Electronics"
      ],
      "condition": "New"
    }
  },

  {
    "id": 1,
    "price": 69,
    "quantity": 1,
    "bider": {
      "username": "test",
      "rating": 2.5
    },
    "status": "Pending",
    "item": {
      "id": 0,
      "title": "string",
      "seller": {
        "username": "string",
        "rating": 2.5
      },
      "min_price": 470,
      "categories": [
        "Miscellaneous"
      ],
      "condition": "Heavily_Used"
    }
  }
];

// ── Helpers ────────────────────────────────────────────────

const CONDITION_CLASS: Record<ItemCondition, string> = {
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

function BidRow({
  bid,
  onEdit,
  onWithdraw,
  onViewTransaction,
}: {
  bid: BidHistoryResponse;
  onEdit: (bidId: number) => void;
  onWithdraw: (bidId: number) => void;
  onViewTransaction: (itemId: number) => void;
}) {
  const isPending  = bid.status === "Pending" ;
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
          <h3 className={styles.rowTitle}>{bid.item.title}</h3>
          <span className={styles.sellerChip}>by {bid.bider.username}</span>
        </div>
        <p className={styles.rowDesc}>
          {/* {bid.item.description} */}
          </p>
        <div className={styles.rowTags}>
          {bid.item.categories.map((cat) => (
            <span key={cat} className={styles.categoryTag}>
              {CATEGORY_ICON[cat]}
              {cat}
            </span>
          ))}
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[bid.item.condition]}`}
          >
            {bid.item.condition}
          </span>
          <span className={styles.metaChip}>
            {/* Placed {bid.placedAt} */}
          </span>
        </div>
      </div>

      {/* My bid */}
      <div className={styles.rowBidAmount}>
        <span className={styles.rowBidLabel}>Your bid</span>
        <span className={styles.rowBidValue}>
          ₹{bid.price.toLocaleString("en-IN")}
        </span>
        {bid.quantity > 1 && (
          <span className={styles.rowBidQty}>x {bid.quantity}</span>
        )}
      </div>

      {/* Item min price */}
      <div className={styles.rowMinPrice}>
        <span className={styles.rowMinPriceLabel}>Min. price</span>
        <span className={styles.rowMinPriceValue}>
          ₹{bid.price.toLocaleString("en-IN")}
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
              onClick={() => onEdit(bid.id)}
              title="Edit bid"
            >
              <Edit01 size={14} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
              onClick={() => onWithdraw(bid.id)}
              title="Withdraw bid"
            >
              <Trash01 size={14} />
            </button>
          </>
        )}
        {isAccepted && (
          <button
            className={styles.actionBtnTransaction}
            onClick={() => onViewTransaction(bid.item.id)}
            title="View transaction"
          >
            View transaction
            <ArrowRight size={13} />
          </button>
        )}
        {isRejected && (
          <button
            className={styles.actionBtnBidAgain}
            onClick={() => onEdit(bid.id)}
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
  const { isAuthenticated } = useAuth();
  const { deleteBid, fetchBids } = useAction();

  const [loadingData, setLoadingData] = useState(true);

  const [bidings, setBidings] = useState<BidHistoryResponse[]>([]);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBidId, setDeleteBidId] = useState<number | null>(null);

  useEffect(() => {
      async function load() {
        setLoadingData(true);
        try {
          if (isAuthenticated) {
            const items = await fetchBids(0, 50);
            setBidings(items);
          }
        } finally {
          setLoadingData(false);
        }
      }
      load();
    }, [isAuthenticated]);

  const countFor = (status: BidStatus) =>
    bidings.filter((b) => b.status === status).length;

  const filtered = bidings.filter((b) =>
    activeTab === "All" ? true : b.status === activeTab,
  );

  function handleOpenDelete(id: number) {
    setDeleteBidId(id);
    setOpenDeleteDialog(true);
  }

  function handleEdit(bidId: number) {
    // TODO: PATCH /bids/{bid_id}
    console.log("edit bid", bidId);
  }

  async function handleWithdraw() {
    if(deleteBidId == null) return;

    setDeleting(true);
    try {
      const ok = await deleteBid(deleteBidId);

      if(ok){
        setBidings((prev) => prev.filter((b) => b.id !== deleteBidId));
      }
    } finally {
      setDeleting(false);
      setDeleteBidId(null);
      setOpenDeleteDialog(false);
    }
  }

  function handleViewTransaction() {
    navigate("/transactions");
  }

  return (
    <div className={styles.page}>
      {/* --- Dialog --- */}
      <Dialog
        open={openDeleteDialog}
        title="Delete Bid"
        description="This action cannot be reversed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleWithdraw}
        onCancel={() => {
          if (!deleting) {
            setOpenDeleteDialog(false);
            setDeleteBidId(null);
          }
        }}
      />

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
                {tab === "All" ? bidings.length : countFor(tab as BidStatus)}
              </span>
            </button>
          ),
        )}
      </div>

      {/* ── Bid rows ── */}
      {loadingData ? (
        <div className={styles.empty}>
          <Spinner/>
          <p className={styles.emptySubtitle}>Loading your Bids…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((bid) => (
            <BidRow
              key={bid.id}
              bid={bid}
              onEdit={handleEdit}
              onWithdraw={handleOpenDelete}
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
