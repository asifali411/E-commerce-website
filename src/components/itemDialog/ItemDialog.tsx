import { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  Tag01,
  User01,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star01,
  LayersThree01,
  AlertCircle,
} from "@untitledui/icons";
import styles from "./ItemDialog.module.css";
import { useAuth } from "../../context/AuthProvider";
import type { ItemResponse, BidResponse, ItemImageResponse } from "../../global/schema";
import type { ItemCondition } from "../../global/types";

// ── Types ──────────────────────────────────────────────────
interface ItemDialogProps {
  itemId: number | null;
  onClose: () => void;
  onBidAccepted?: () => void;
}

// ── Helpers ────────────────────────────────────────────────
const CONDITION_LABEL: Record<ItemCondition, string> = {
  New: "New",
  Lightly_Used: "Lightly Used",
  Heavily_Used: "Heavily Used",
};

const CONDITION_CLASS: Record<ItemCondition, string> = {
  New: styles.conditionNew,
  Lightly_Used: styles.conditionLight,
  Heavily_Used: styles.conditionHeavy,
};

// ── Bid card ───────────────────────────────────────────────
function BidCard({
  bid,
  onAccept,
  onReject,
  accepting,
  itemSold,
}: {
  bid: BidResponse;
  onAccept: (bidId: number) => void;
  onReject: (bidId: number) => void;
  accepting: number | null;
  itemSold: boolean;
}) {
  const isPending = bid.status === "Pending";
  const isAccepted = bid.status === "Accepted";
  const isRejected = bid.status === "Rejected";
  const isLoading = accepting === bid.id;

  return (
    <div
      className={`${styles.bidCard} ${isAccepted ? styles.bidCardAccepted : ""} ${isRejected ? styles.bidCardRejected : ""}`}
    >
      <div className={styles.bidCardLeft}>
        <div className={styles.bidderRow}>
          <div className={styles.bidderAvatar}>
            <User01 size={14} />
          </div>
          <div>
            <span className={styles.bidderName}>{bid.bider.username}</span>
            <div className={styles.bidderRating}>
              <Star01 size={11} />
              <span>{bid.bider.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bidCardMid}>
        <div className={styles.bidStat}>
          <span className={styles.bidPrice}>
            ₹{bid.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className={styles.bidStat}>
          <LayersThree01 size={13} className={styles.bidStatIcon} />
          <span className={styles.bidQty}>Qty: {bid.quantity}</span>
        </div>
      </div>

      <div className={styles.bidCardRight}>
        {isPending && !itemSold ? (
          <div className={styles.bidActions}>
            <button
              className={styles.btnAccept}
              onClick={() => onAccept(bid.id)}
              disabled={isLoading}
              title="Accept bid"
            >
              {isLoading ? (
                <span className={styles.spinner} />
              ) : (
                <CheckCircle size={13} />
              )}
              Accept
            </button>
            <button
              className={styles.btnReject}
              onClick={() => onReject(bid.id)}
              disabled={isLoading}
              title="Reject bid"
            >
              <XCircle size={13} />
              Reject
            </button>
          </div>
        ) : (
          <span
            className={`${styles.bidStatusBadge} ${
              isAccepted
                ? styles.bidStatusAccepted
                : isRejected
                  ? styles.bidStatusRejected
                  : styles.bidStatusPending
            }`}
          >
            {isAccepted && <CheckCircle size={11} />}
            {isRejected && <XCircle size={11} />}
            {isPending && <Clock size={11} />}
            {bid.status}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Image carousel ─────────────────────────────────────────
function ImageCarousel({
  images,
}: {
  images: ItemImageResponse[];
}) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.imagePlaceholder}>
        <Package size={40} className={styles.imagePlaceholderIcon} />
        <span>No images</span>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <img
        src={`/api/${images[idx].image_path}`}
        alt={`Image ${idx + 1}`}
        className={styles.carouselImg}
      />

      {
        images[idx].status === "Pending" &&
        <div className={styles.processingOverlay}>
          Image is being processed
          <br />
          This may take a while
        </div>
      }

      {images.length > 1 && (
        <>
          <button
            className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
            onClick={() =>
              setIdx((i) => (i - 1 + images.length) % images.length)
            }
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
            onClick={() => setIdx((i) => (i + 1) % images.length)}
          >
            <ChevronRight size={16} />
          </button>
          <div className={styles.carouselDots}>
            {images.map((_, i) => (
              <button
                key={i}
                className={`${styles.carouselDot} ${i === idx ? styles.carouselDotActive : ""}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────
export default function ItemDialog({
  itemId,
  onClose,
  onBidAccepted,
}: ItemDialogProps) {
  const { fetchItem, createTransaction, updateBid } = useAuth();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (itemId == null) return;
    setLoading(true);
    setError(null);
    const data = await fetchItem(itemId);
    if (data) {
      setItem(data);
    } else {
      setError("Failed to load item details.");
    }
    setLoading(false);
  }, [itemId]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleAccept(bidId: number) {
    if (!item) return;
    setAccepting(bidId);
    setSuccessMsg(null);
    const result = await createTransaction(item.id, bidId);
    if (result) {
      console.log(result);
      setSuccessMsg("Bid accepted! Transaction created.");
      await loadItem();
      onBidAccepted?.();
    } else {
      setError("Failed to accept bid. Please try again.");
    }
    setAccepting(null);
  }

  async function handleReject(bidId: number) {
    setAccepting(bidId);
    setSuccessMsg(null);
    //@ts-ignore
    const result = await updateBid(bidId, { price: null, quantity: null });
    
    await loadItem();
    setAccepting(null);
  }

  if (itemId == null) return null;

  const pendingBids = item?.bids.filter((b) => b.status === "Pending") ?? [];
  const otherBids = item?.bids.filter((b) => b.status !== "Pending") ?? [];
  const isSold = item?.status === "Sold";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Item details"
      >
        {/* ── Close ── */}
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {loading && (
          <div className={styles.stateCenter}>
            <span className={styles.spinnerLg} />
            <p>Loading item…</p>
          </div>
        )}

        {error && !loading && (
          <div className={styles.stateCenter}>
            <AlertCircle size={32} className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button className={styles.btnRetry} onClick={loadItem}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && item && (
          <div className={styles.content}>
            {/* ── Left: image + details ── */}
            <div className={styles.left}>
              <ImageCarousel images={item.images} />

              <div className={styles.meta}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Status</span>
                  <span
                    className={`${styles.statusBadge} ${isSold ? styles.statusSold : styles.statusActive}`}
                  >
                    {isSold ? <XCircle size={11} /> : <CheckCircle size={11} />}
                    {item.status}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Condition</span>
                  <span
                    className={`${styles.conditionBadge} ${CONDITION_CLASS[item.condition]}`}
                  >
                    {CONDITION_LABEL[item.condition]}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Min price</span>
                  <span className={styles.metaPrice}>
                    ₹{item.min_price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Quantity</span>
                  <span className={styles.metaValue}>{item.quantity}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Categories</span>
                  <div className={styles.categories}>
                    {item.categories.map((cat) => (
                      <span key={cat} className={styles.categoryChip}>
                        <Tag01 size={10} />
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: title + description + bids ── */}
            <div className={styles.right}>
              <div className={styles.titleSection}>
                <h2 className={styles.itemTitle}>{item.title}</h2>
                <p className={styles.itemDesc}>{item.description}</p>
              </div>

              {/* Success message */}
              {successMsg && (
                <div className={styles.successBanner}>
                  <CheckCircle size={14} />
                  {successMsg}
                </div>
              )}

              {/* Bids section */}
              <div className={styles.bidsSection}>
                <div className={styles.bidsSectionHeader}>
                  <h3 className={styles.bidsTitle}>
                    Bids
                    <span className={styles.bidCount}>{item.bid_count}</span>
                  </h3>
                  {isSold && (
                    <span className={styles.soldNotice}>
                      <AlertCircle size={12} />
                      Item sold — no new bids can be accepted
                    </span>
                  )}
                </div>

                {item.bids.length === 0 ? (
                  <div className={styles.noBids}>
                    <Clock size={24} className={styles.noBidsIcon} />
                    <p>No bids yet</p>
                  </div>
                ) : (
                  <div className={styles.bidsList}>
                    {pendingBids.length > 0 && (
                      <>
                        <p className={styles.bidsGroupLabel}>Pending</p>
                        {pendingBids.map((bid) => (
                          <BidCard
                            key={bid.id}
                            bid={bid}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            accepting={accepting}
                            itemSold={isSold}
                          />
                        ))}
                      </>
                    )}
                    {otherBids.length > 0 && (
                      <>
                        <p className={styles.bidsGroupLabel}>Resolved</p>
                        {otherBids.map((bid) => (
                          <BidCard
                            key={bid.id}
                            bid={bid}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            accepting={accepting}
                            itemSold={isSold}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}