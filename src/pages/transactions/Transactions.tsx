import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Monitor01,
  PencilLine,
  Building07,
  CheckCircle,
  Clock,
  ArrowRight,
  ShoppingBag01,
  Tag01,
  ChevronRight,
} from "@untitledui/icons";
import styles from "./Transactions.module.css";
import type {
  SellerTransactionResponse,
  BuyerTransactionResponse,
} from "../../global/schema";
import type {
  ItemCategory,
  ItemCondition,
  TransactionStatus,
} from "../../global/types";
import Spinner from "../../components/spinner/Spinner";
import { useAction } from "../../context/ActionProvider";
import TransactionDialog from "../../components/transactionDialog/TransactionDialog";

// ── Types ──────────────────────────────────────────────────
type Role = "Buyer" | "Seller";
type FilterTab = "All" | "Pending" | "Completed";

// ── Helpers ────────────────────────────────────────────────
const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  All: <Package size={11} />,
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Miscellaneous: <Package size={11} />,
  Accessories: <Tag01 size={11} />,
};

const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  Lightly_Used: styles.conditionLight,
  Heavily_Used: styles.conditionHeavy,
};

// ── Stat pill ──────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Buyer Transaction Row ──────────────────────────────────
function BuyerTransactionRow({
  tx,
  onClick,
}: {
  tx: BuyerTransactionResponse;
  onClick: () => void;
}) {
  const isPending = tx.status === "Pending";

  return (
    <article
      className={`${styles.row} ${isPending ? styles.rowPending : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        <Package size={20} className={styles.rowThumbIcon} />
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <h3 className={styles.rowTitle}>{tx.item.title}</h3>
          <span className={`${styles.roleChip} ${styles.roleChipBuyer}`}>
            Bought
          </span>
        </div>
        <div className={styles.rowTags}>
          {tx.item.categories.map((cat) => (
            <span key={cat} className={styles.categoryTag}>
              {CATEGORY_ICON[cat as ItemCategory]}
              {cat}
            </span>
          ))}
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[tx.item.condition as ItemCondition]}`}
          >
            {tx.item.condition.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Seller */}
      <div className={styles.rowParty}>
        <span className={styles.rowPartyLabel}>Seller</span>
        <span className={styles.rowPartyName}>{tx.item.seller.username}</span>
      </div>

      {/* Price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Agreed price</span>
        <span className={styles.rowPriceValue}>
          ₹{tx.price.toLocaleString("en-IN")}
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

      {/* Chevron */}
      <div className={styles.rowChevron}>
        <ChevronRight size={16} />
      </div>
    </article>
  );
}

// ── Seller Transaction Row ─────────────────────────────────
function SellerTransactionRow({
  tx,
  onClick,
}: {
  tx: SellerTransactionResponse;
  onClick: () => void;
}) {
  const isPending = tx.status === "Pending";

  return (
    <article
      className={`${styles.row} ${isPending ? styles.rowPending : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Thumbnail */}
      <div className={styles.rowThumb}>
        <Package size={20} className={styles.rowThumbIcon} />
      </div>

      {/* Main info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <h3 className={styles.rowTitle}>{tx.item.title}</h3>
          <span className={`${styles.roleChip} ${styles.roleChipSeller}`}>
            Sold
          </span>
        </div>
        <div className={styles.rowTags}>
          {tx.item.categories.map((cat) => (
            <span key={cat} className={styles.categoryTag}>
              {CATEGORY_ICON[cat as ItemCategory]}
              {cat}
            </span>
          ))}
          <span
            className={`${styles.conditionTag} ${CONDITION_CLASS[tx.item.condition as ItemCondition]}`}
          >
            {tx.item.condition.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Buyer */}
      <div className={styles.rowParty}>
        <span className={styles.rowPartyLabel}>Buyer</span>
        <span className={styles.rowPartyName}>{tx.buyer.username}</span>
      </div>

      {/* Price */}
      <div className={styles.rowPrice}>
        <span className={styles.rowPriceLabel}>Agreed price</span>
        <span className={styles.rowPriceValue}>
          ₹{tx.price.toLocaleString("en-IN")}
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

      {/* Chevron */}
      <div className={styles.rowChevron}>
        <ChevronRight size={16} />
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function Transactions() {
  const navigate = useNavigate();
  const { fetchSellerTransactions, fetchBuyerTransactions } = useAction();

  const [roleView, setRoleView] = useState<Role>("Buyer");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [buyerTxs, setBuyerTxs] = useState<BuyerTransactionResponse[]>([]);
  const [sellerTxs, setSellerTxs] = useState<SellerTransactionResponse[]>([]);
  const [loadingBuyer, setLoadingBuyer] = useState(true);
  const [loadingSeller, setLoadingSeller] = useState(true);

  // Dialog state — union type keyed by role
  const [dialogState, setDialogState] = useState<
    | { role: "Buyer"; tx: BuyerTransactionResponse }
    | { role: "Seller"; tx: SellerTransactionResponse }
    | null
  >(null);

  useEffect(() => {
    fetchBuyerTransactions().then((data) => {
      setBuyerTxs(data);
      setLoadingBuyer(false);
    });
    fetchSellerTransactions().then((data) => {
      setSellerTxs(data);
      setLoadingSeller(false);
    });
  }, []);

  const loading = roleView === "Buyer" ? loadingBuyer : loadingSeller;

  const buyerFiltered = buyerTxs.filter((t) =>
    activeTab === "All" ? true : t.status === activeTab,
  );
  const sellerFiltered = sellerTxs.filter((t) =>
    activeTab === "All" ? true : t.status === activeTab,
  );

  const countFor = (status: TransactionStatus) =>
    roleView === "Buyer"
      ? buyerTxs.filter((t) => t.status === status).length
      : sellerTxs.filter((t) => t.status === status).length;

  const totalForRole =
    roleView === "Buyer" ? buyerTxs.length : sellerTxs.length;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <div className={styles.stats}>
            <StatPill label="Total" value={totalForRole} />
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
            <span className={styles.roleBtnCount}>{buyerTxs.length}</span>
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
            <span className={styles.roleBtnCount}>{sellerTxs.length}</span>
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
                ? totalForRole
                : countFor(tab as TransactionStatus)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Transaction rows ── */}
      {loading ? (
        <div className={styles.empty}>
          <Spinner />
          <p className={styles.emptyTitle}>Loading transactions…</p>
        </div>
      ) : roleView === "Buyer" ? (
        buyerFiltered.length > 0 ? (
          <div className={styles.list}>
            {buyerFiltered.map((tx, i) => (
              <BuyerTransactionRow
                key={i}
                tx={tx}
                onClick={() => setDialogState({ role: "Buyer", tx })}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <ArrowRight size={36} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No transactions here</p>
            <p className={styles.emptySubtitle}>
              Transactions appear here when a seller accepts your bid.
            </p>
            <button
              className={styles.btnSecondary}
              onClick={() => navigate("/")}
            >
              <ShoppingBag01 size={15} />
              Browse listings
            </button>
          </div>
        )
      ) : sellerFiltered.length > 0 ? (
        <div className={styles.list}>
          {sellerFiltered.map((tx, i) => (
            <SellerTransactionRow
              key={i}
              tx={tx}
              onClick={() => setDialogState({ role: "Seller", tx })}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <ArrowRight size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No transactions here</p>
          <p className={styles.emptySubtitle}>
            Transactions appear here when you accept a buyer's bid.
          </p>
          <button
            className={styles.btnSecondary}
            onClick={() => navigate("/listings")}
          >
            <Tag01 size={15} />
            View my listings
          </button>
        </div>
      )}

      {/* ── Dialog ── */}
      {dialogState &&
        (dialogState.role === "Buyer" ? (
          <TransactionDialog
            role="Buyer"
            tx={dialogState.tx}
            onClose={() => setDialogState(null)}
          />
        ) : (
          <TransactionDialog
            role="Seller"
            tx={dialogState.tx}
            onClose={() => setDialogState(null)}
          />
        ))}
    </div>
  );
}