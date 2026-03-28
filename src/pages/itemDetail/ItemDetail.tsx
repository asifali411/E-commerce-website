import { useState, useEffect } from "react";
import styles from "./ItemDetail.module.css";

// ── Types ──────────────────────────────────────────────

type ItemStatus = "Active" | "Sold";
type ItemCondition = "New" | "Lightly_Used" | "Heavily_Used";
type ItemCategories = "Electronics" | "Stationary" | "Rent" | "Misseleneous";
type BidStatus = "Accepted" | "Pending" | "Rejected";

interface PublicUsersResponse {
  username: string;
  rating: number;
}

interface ItemImageResponse {
  id: number;
  image_path: string;
}

interface BidResponse {
  id: number;
  price: number;
  quantity: number;
  bider: PublicUsersResponse;
  status: BidStatus;
}

interface UniqueItemResponse {
  id: number;
  seller: PublicUsersResponse;
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  status: ItemStatus;
  categories: ItemCategories[];
  condition: ItemCondition;
  images: ItemImageResponse[];
  bids: BidResponse[];
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.round(rating) ? styles.starFilled : styles.starEmpty
          }
        >
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </span>
  );
}

function ConditionBadge({ condition }: { condition: ItemCondition }) {
  const map: Record<ItemCondition, { label: string; cls: string }> = {
    New: { label: "New", cls: styles.condNew },
    Lightly_Used: { label: "Lightly Used", cls: styles.condLight },
    Heavily_Used: { label: "Heavily Used", cls: styles.condHeavy },
  };
  const { label, cls } = map[condition];
  return <span className={`${styles.conditionBadge} ${cls}`}>{label}</span>;
}

function BidStatusChip({ status }: { status: BidStatus }) {
  const cls =
    status === "Accepted"
      ? styles.bidAccepted
      : status === "Rejected"
        ? styles.bidRejected
        : styles.bidPending;
  return <span className={`${styles.bidChip} ${cls}`}>{status}</span>;
}

// ── Main Component ─────────────────────────────────────────────────────────

interface ItemDetailPageProps {
  itemId: number;
  apiBase?: string;
  onBack?: () => void;
}

export default function ItemDetail({
  itemId,
  apiBase = "",
  onBack,
}: ItemDetailPageProps) {
  const [item, setItem] = useState<UniqueItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bidPrice, setBidPrice] = useState("");
  const [bidQty, setBidQty] = useState("1");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiBase}/items/${itemId}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data: UniqueItemResponse) => {
        setItem(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [itemId, apiBase]);

  async function handleBid() {
    if (!item) return;
    setBidLoading(true);
    setBidError(null);
    setBidSuccess(false);
    try {
      const res = await fetch(`${apiBase}/bids/${item.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(bidPrice),
          quantity: parseInt(bidQty, 10),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail?.[0]?.msg ?? `Error ${res.status}`);
      }
      setBidSuccess(true);
      setBidPrice("");
      setBidQty("1");
      // Refresh item to show new bid
      const updated: UniqueItemResponse = await fetch(
        `${apiBase}/items/${item.id}`,
        { credentials: "include" },
      ).then((r) => r.json());
      setItem(updated);
    } catch (e: unknown) {
      setBidError(e instanceof Error ? e.message : "Failed to place bid.");
    } finally {
      setBidLoading(false);
    }
  }

  // ── Loading / Error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.stateWrapper}>
        <div className={styles.loader}>
          <span />
          <span />
          <span />
        </div>
        <p className={styles.stateLabel}>Fetching item…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.stateWrapper}>
        <div className={styles.errorIcon}>!</div>
        <p className={styles.stateLabel}>{error ?? "Item not found"}</p>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            ← Go back
          </button>
        )}
      </div>
    );
  }

  const hasImages = item.images.length > 0;

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <header className={styles.topBar}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            ← Back
          </button>
        )}
        <span className={styles.itemId}>#{item.id}</span>
        <span
          className={`${styles.statusPill} ${item.status === "Sold" ? styles.statusSold : styles.statusActive}`}
        >
          {item.status}
        </span>
      </header>

      <main className={styles.layout}>
        {/* ── Left: images ── */}
        <section className={styles.gallery}>
          <div className={styles.mainImage}>
            {hasImages ? (
              <img
                src={item.images[activeImage].image_path}
                alt={item.title}
                className={styles.mainImg}
              />
            ) : (
              <div className={styles.noImage}>
                <span>No Image</span>
              </div>
            )}
            {item.status === "Sold" && (
              <div className={styles.soldOverlay}>SOLD</div>
            )}
          </div>
          {hasImages && item.images.length > 1 && (
            <div className={styles.thumbRow}>
              {item.images.map((img, i) => (
                <button
                  key={img.id}
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img.image_path} alt={`view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Right: details ── */}
        <section className={styles.details}>
          {/* Categories */}
          <div className={styles.categoryRow}>
            {item.categories.map((c) => (
              <span key={c} className={styles.category}>
                {c}
              </span>
            ))}
            <ConditionBadge condition={item.condition} />
          </div>

          <h1 className={styles.title}>{item.title}</h1>

          <p className={styles.description}>{item.description}</p>

          {/* Price + Qty */}
          <div className={styles.priceRow}>
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Min Price</span>
              <span className={styles.price}>
                ₹{item.min_price.toLocaleString()}
              </span>
            </div>
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Quantity</span>
              <span className={styles.price}>{item.quantity}</span>
            </div>
          </div>

          {/* Seller */}
          <div className={styles.sellerCard}>
            <div className={styles.avatar}>
              {item.seller.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className={styles.sellerName}>{item.seller.username}</p>
              <StarRating rating={item.seller.rating} />
            </div>
          </div>

          {/* Bid form */}
          {item.status === "Active" && (
            <div className={styles.bidForm}>
              <h3 className={styles.bidHeading}>Place a Bid</h3>
              <div className={styles.bidInputRow}>
                <label className={styles.bidLabel}>
                  Price (₹)
                  <input
                    type="number"
                    min={item.min_price}
                    step="0.01"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder={`≥ ${item.min_price}`}
                    className={styles.bidInput}
                  />
                </label>
                <label className={styles.bidLabel}>
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={item.quantity}
                    value={bidQty}
                    onChange={(e) => setBidQty(e.target.value)}
                    className={styles.bidInput}
                  />
                </label>
              </div>
              {bidError && <p className={styles.bidErr}>{bidError}</p>}
              {bidSuccess && (
                <p className={styles.bidOk}>Bid placed successfully!</p>
              )}
              <button
                className={styles.bidSubmit}
                onClick={handleBid}
                disabled={bidLoading || !bidPrice}
              >
                {bidLoading ? "Placing…" : "Submit Bid"}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── Bids section ── */}
      <section className={styles.bidsSection}>
        <h2 className={styles.bidsHeading}>
          Bids
          <span className={styles.bidCount}>{item.bids.length}</span>
        </h2>
        {item.bids.length === 0 ? (
          <p className={styles.noBids}>No bids yet. Be the first!</p>
        ) : (
          <div className={styles.bidsGrid}>
            {item.bids.map((bid) => (
              <div key={bid.id} className={styles.bidCard}>
                <div className={styles.bidUser}>
                  <div className={styles.bidAvatar}>
                    {bid.bider.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.bidUsername}>{bid.bider.username}</p>
                    <StarRating rating={bid.bider.rating} />
                  </div>
                  <BidStatusChip status={bid.status} />
                </div>
                <div className={styles.bidMeta}>
                  <span className={styles.bidPrice}>
                    ₹{bid.price.toLocaleString()}
                  </span>
                  <span className={styles.bidQty}>
                    × {bid.quantity} unit{bid.quantity > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
