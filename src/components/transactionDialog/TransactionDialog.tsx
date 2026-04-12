import {
  X,
  User01,
  Phone,
  Mail01,
  Star01,
  Package,
  Monitor01,
  PencilLine,
  Building07,
  CheckCircle,
  Clock,
  Tag01,
  ShoppingBag01,
  Hash01,
  CurrencyDollar,
} from "@untitledui/icons";
import type {
  SellerTransactionResponse,
  BuyerTransactionResponse,
} from "../../global/schema";
import type { ItemCategory, ItemCondition } from "../../global/types";
import styles from "./TransactionDialog.module.css";

// ── Helpers ────────────────────────────────────────────────
const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  All: <Package size={12}/>,
  Electronics: <Monitor01 size={12} />,
  Stationary: <PencilLine size={12} />,
  Rent: <Building07 size={12} />,
  Miscellaneous: <Package size={12} />,
  Accessories: <Tag01 size={12} />,
};

const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  Lightly_Used: styles.conditionLight,
  Heavily_Used: styles.conditionHeavy,
};

// ── Star display (read-only) ───────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className={styles.starDisplay}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star01
          key={n}
          size={13}
          className={
            n <= Math.round(rating) ? styles.starFilled : styles.starEmpty
          }
        />
      ))}
      <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Detail row ─────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailIcon}>{icon}</span>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────
type TransactionDialogProps =
  | {
      role: "Buyer";
      tx: BuyerTransactionResponse;
      onClose: () => void;
    }
  | {
      role: "Seller";
      tx: SellerTransactionResponse;
      onClose: () => void;
    };

// ── Component ──────────────────────────────────────────────
export default function TransactionDialog(props: TransactionDialogProps) {
  const { role, onClose } = props;

  const isPending = props.tx.status === "Pending";

  // Resolve counterparty + item based on role
  const counterparty = role === "Buyer" ? props.tx.item.seller : props.tx.buyer;
  const counterpartyRole = role === "Buyer" ? "Seller" : "Buyer";
  const item = props.tx.item;

  // Backdrop click to close
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        {/* ── Close ── */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* ── Header ── */}
        <div className={styles.dialogHeader}>
          <div className={styles.dialogHeaderLeft}>
            <div className={styles.itemThumb}>
              <Package size={22} />
            </div>
            <div>
              <h2 className={styles.dialogTitle}>{item.title}</h2>
              <div className={styles.dialogTags}>
                {item.categories.map((cat) => (
                  <span key={cat} className={styles.categoryTag}>
                    {CATEGORY_ICON[cat as ItemCategory]}
                    {cat}
                  </span>
                ))}
                <span
                  className={`${styles.conditionTag} ${CONDITION_CLASS[item.condition as ItemCondition]}`}
                >
                  {item.condition.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`${styles.statusBadge} ${isPending ? styles.statusPending : styles.statusCompleted}`}
          >
            {isPending ? <Clock size={12} /> : <CheckCircle size={12} />}
            {props.tx.status}
          </span>
        </div>

        <div className={styles.dialogBody}>
          {/* ── Transaction details ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Transaction Details</h3>
            <div className={styles.detailList}>
              <DetailRow
                icon={<CurrencyDollar size={14} />}
                label="Agreed Price"
                value={
                  <span className={styles.priceValue}>
                    ₹{props.tx.price.toLocaleString("en-IN")}
                  </span>
                }
              />
              <DetailRow
                icon={<Hash01 size={14} />}
                label="Quantity"
                value={props.tx.quantity}
              />
              <DetailRow
                icon={
                  role === "Buyer" ? (
                    <ShoppingBag01 size={14} />
                  ) : (
                    <Tag01 size={14} />
                  )
                }
                label="Your role"
                value={
                  <span
                    className={`${styles.roleChip} ${role === "Buyer" ? styles.roleChipBuyer : styles.roleChipSeller}`}
                  >
                    {role === "Buyer" ? "Bought" : "Sold"}
                  </span>
                }
              />
            </div>
          </section>

          {/* ── Counterparty ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{counterpartyRole} Info</h3>
            <div className={styles.counterpartyCard}>
              <div className={styles.counterpartyAvatar}>
                <User01 size={20} />
              </div>
              <div className={styles.counterpartyInfo}>
                <span className={styles.counterpartyName}>
                  {counterparty.username}
                </span>
                <StarDisplay rating={counterparty.rating} />
              </div>
            </div>
            <div className={styles.detailList}>
              <DetailRow
                icon={<Mail01 size={14} />}
                label="Email"
                value={
                  <a
                    href={`mailto:${counterparty.email}`}
                    className={styles.contactLink}
                  >
                    {counterparty.email}
                  </a>
                }
              />
              <DetailRow
                icon={<Phone size={14} />}
                label="Phone"
                value={
                  <a
                    href={`tel:${counterparty.phone_no}`}
                    className={styles.contactLink}
                  >
                    {counterparty.phone_no}
                  </a>
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
