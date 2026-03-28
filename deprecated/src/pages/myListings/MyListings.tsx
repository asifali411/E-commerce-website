import { useState, useRef } from "react";
import styles from "./MyListings.module.css";

import Top from "../../components/top/Top";
import NavBar from "../../components/nav/NavBar";

import { PenBox, Plus, X, Package } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ItemBase {
  id: number;
  seller_id: number;
  seller_rating: number;
  username: string;
  title: string;
  description: string;
  price: number;
  primary_image: string;
  images: string[];
  status: "ACTIVE" | "SOLD";
}

interface BidBase {
  id: number;
  bid_price: number;
  username: string;
  rating: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  bider_id: number;
}

interface UniqueItemBase extends ItemBase {
  bids: BidBase[];
}

type ModalMode = "create" | "edit" | "detail" | null;

// ── Mock helpers ───────────────────────────────────────────────────────────
const PLACEHOLDER = "https://placehold.co/600x400/1a1a2e/818CF8?text=No+Image";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </span>
  );
}

function BidStatusPill({ status }: { status: BidBase["status"] }) {
  return (
    <span className={`${styles.pill} ${styles[`pill${status}`]}`}>{status}</span>
  );
}

// ── Create / Edit Form ─────────────────────────────────────────────────────
interface ItemFormProps {
  initial?: Partial<ItemBase>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}

function ItemForm({ initial, onSubmit, onCancel, loading }: ItemFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []).slice(0, 3);
    setFiles(chosen);
    setPreviews(chosen.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("price", price);
    fd.append("description", description);
    files.forEach((f) => fd.append("images", f));
    onSubmit(fd);
  };

  const isEdit = !!initial?.id;

  return (
    <div className={styles.form}>
      <div className={styles.formGrid}>
        {/* Title */}
        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            maxLength={20}
            placeholder="e.g. Vintage Camera"
          />
          <span className={styles.charHint}>{title.length}/20</span>
        </label>

        {/* Price */}
        <label className={styles.label}>
          Starting Price (₹)
          <input
            className={styles.input}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
            placeholder="0.00"
          />
        </label>
      </div>

      {/* Description */}
      <label className={styles.label}>
        Description
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={10}
          maxLength={100}
          placeholder="Describe your item honestly…"
        />
        <span className={styles.charHint}>{description.length}/100</span>
      </label>

      {/* Images */}
      <div className={styles.imageUploadArea}>
        <p className={styles.uploadLabel}>
          Photos <span className={styles.muted}>(1-3 images)</span>
        </p>
        <div className={styles.previewRow}>
          {previews.map((src, i) => (
            <img key={i} src={src} alt="" className={styles.previewThumb} />
          ))}
          {previews.length === 0 && initial?.primary_image && (
            <img src={initial.primary_image} alt="" className={styles.previewThumb} />
          )}
          {previews.length < 3 && (
            <button
              type="button"
              className={styles.addImageBtn}
              onClick={() => fileRef.current?.click()}
            >
              <span className={styles.plusIcon}>+</span>
              <span>Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
      </div>

      <div className={styles.formActions}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`${styles.btn} ${styles.btnCta}`}
          onClick={handleSubmit}
          disabled={loading || !title || !price || !description || (!isEdit && files.length === 0)}
        >
          {loading ? <span className={styles.spinner} /> : isEdit ? "Save Changes" : "List Item"}
        </button>
      </div>
    </div>
  );
}

// ── Item Card ──────────────────────────────────────────────────────────────
interface ItemCardProps {
  item: ItemBase;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemCard({ item, onView, onEdit, onDelete }: ItemCardProps) {
  return (
    <article className={styles.card} onClick={onView}>
      <div className={styles.cardImageWrap}>
        <img
          src={item.primary_image || PLACEHOLDER}
          alt={item.title}
          className={styles.cardImage}
          onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
        />
        <span className={`${styles.statusBadge} ${item.status === "SOLD" ? styles.sold : styles.active}`}>
          {item.status}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardDesc}>{item.description}</p>
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>₹{item.price.toLocaleString()}</span>
          <div
            className={styles.cardActions}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`${styles.iconBtn} ${styles.editBtn}`}
              onClick={onEdit}
              title="Edit"
            >
              <PenBox />
            </button>
            <button
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              onClick={onDelete}
              title="Delete"
            >
              <X />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────
interface DetailModalProps {
  item: UniqueItemBase;
  onClose: () => void;
  onAcceptBid: (bidId: number) => void;
  onRejectBid: (bidId: number) => void;
  onConfirmTransaction: (bidId: number) => void;
}

function DetailModal({ item, onClose, onAcceptBid, onRejectBid, onConfirmTransaction }: DetailModalProps) {
  const [activeImg, setActiveImg] = useState(item.primary_image);

  return (

    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X /></button>

        <div className={styles.detailLayout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <img
              src={activeImg || PLACEHOLDER}
              alt={item.title}
              className={styles.mainImage}
              onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
            />
            <div className={styles.thumbnailRow}>
              {item.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`${styles.thumbnail} ${activeImg === img ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(img)}
                  onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className={styles.detailInfo}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{item.title}</h2>
              <span className={`${styles.statusBadge} ${item.status === "SOLD" ? styles.sold : styles.active}`}>
                {item.status}
              </span>
            </div>
            <p className={styles.detailPrice}>₹{item.price.toLocaleString()}</p>
            <p className={styles.detailDesc}>{item.description}</p>

            {/* Bids */}
            <div className={styles.bidsSection}>
              <h4 className={styles.bidsHeading}>
                Bids <span className={styles.bidCount}>{item.bids.length}</span>
              </h4>
              {item.bids.length === 0 ? (
                <p className={styles.noBids}>No bids yet.</p>
              ) : (
                <ul className={styles.bidList}>
                  {item.bids.map((bid) => (
                    <li key={bid.id} className={styles.bidRow}>
                      <div className={styles.bidLeft}>
                        <span className={styles.bidUser}>{bid.username}</span>
                        <StarRating rating={bid.rating} />
                      </div>
                      <div className={styles.bidRight}>
                        <span className={styles.bidPrice}>₹{bid.bid_price.toLocaleString()}</span>
                        <BidStatusPill status={bid.status} />
                        {bid.status === "PENDING" && item.status === "ACTIVE" && (
                          <div className={styles.bidButtons}>
                            <button
                              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                              onClick={() => onAcceptBid(bid.id)}
                            >
                              Accept
                            </button>
                            <button
                              className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                              onClick={() => onRejectBid(bid.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {bid.status === "ACCEPTED" && item.status === "ACTIVE" && (
                          <button
                            className={`${styles.btn} ${styles.btnCta} ${styles.btnSm}`}
                            onClick={() => onConfirmTransaction(bid.id)}
                          >
                            Confirm Sale
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const MOCK_ITEMS: UniqueItemBase[] = [
  {
    id: 1,
    seller_id: 42,
    seller_rating: 4.2,
    username: "you",
    title: "Tool Kit",
    description: "Vene vangiya mathi funde.",
    price: 3500,
    primary_image: PLACEHOLDER,
    images: [PLACEHOLDER],
    status: "ACTIVE",
    bids: [
      { id: 101, bid_price: 3000, username: "ishaan", rating: 4.5, status: "PENDING", bider_id: 10 },
      { id: 102, bid_price: 3200, username: "prideson", rating: 3.8, status: "PENDING", bider_id: 11 },
    ],
  },
  {
    id: 2,
    seller_id: 42,
    seller_rating: 4.2,
    username: "you",
    title: "Keyboard",
    description: "Nokkanda unni ith njanalla.",
    price: 2200,
    primary_image: PLACEHOLDER,
    images: [PLACEHOLDER],
    status: "SOLD",
    bids: [
      { id: 103, bid_price: 2100, username: "lalu", rating: 5.0, status: "ACCEPTED", bider_id: 12 },
    ],
  },
];

export default function MyListings() {
  const [items, setItems] = useState<UniqueItemBase[]>(MOCK_ITEMS);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<UniqueItemBase | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  // ── CREATE ──
  const handleCreate = async (fd: FormData) => {
    setLoading(true);
    try {
      // const res = await fetch("/items/create", { method: "POST", body: fd });
      // Simulated
      await new Promise((r) => setTimeout(r, 800));
      const newItem: UniqueItemBase = {
        id: Date.now(),
        seller_id: 42,
        seller_rating: 4.2,
        username: "you",
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        price: parseFloat(fd.get("price") as string),
        primary_image: PLACEHOLDER,
        images: [PLACEHOLDER],
        status: "ACTIVE",
        bids: [],
      };
      setItems((prev) => [newItem, ...prev]);
      showToast("Item listed successfully!");
      closeModal();
    } catch {
      showToast("Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT ──
  const handleEdit = async (fd: FormData) => {
    if (!selected) return;
    setLoading(true);
    try {
      // await fetch(`/items/${selected.id}`, { method: "PUT", body: fd });
      await new Promise((r) => setTimeout(r, 800));
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                title: fd.get("title") as string,
                description: fd.get("description") as string,
                price: parseFloat(fd.get("price") as string),
              }
            : item
        )
      );
      showToast("Listing updated.");
      closeModal();
    } catch {
      showToast("Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing?")) return;
    try {
      // await fetch(`/items/${id}`, { method: "DELETE" });
      await new Promise((r) => setTimeout(r, 400));
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Listing deleted.");
    } catch {
      showToast("Failed to delete.");
    }
  };

  // ── ACCEPT / REJECT BID ──
  const handleAcceptBid = (bidId: number) => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              bids: item.bids.map((b) =>
                b.id === bidId
                  ? { ...b, status: "ACCEPTED" as const }
                  : { ...b, status: "REJECTED" as const }
              ),
            }
          : item
      )
    );
    setSelected((prev) =>
      prev
        ? {
            ...prev,
            bids: prev.bids.map((b) =>
              b.id === bidId
                ? { ...b, status: "ACCEPTED" as const }
                : { ...b, status: "REJECTED" as const }
            ),
          }
        : prev
    );
    showToast("Bid accepted.");
  };

  const handleRejectBid = (bidId: number) => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              bids: item.bids.map((b) =>
                b.id === bidId ? { ...b, status: "REJECTED" as const } : b
              ),
            }
          : item
      )
    );
    setSelected((prev) =>
      prev
        ? {
            ...prev,
            bids: prev.bids.map((b) =>
              b.id === bidId ? { ...b, status: "REJECTED" as const } : b
            ),
          }
        : prev
    );
    showToast("Bid rejected.");
  };

  // ── CONFIRM TRANSACTION ──
  const handleConfirmTransaction = async (bidId: number) => {
    if (!selected) return;
    try {
      // await fetch("/transactions/confirm", { method: "POST", headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ item_id: selected.id, bid_id: bidId }) });
      await new Promise((r) => setTimeout(r, 600));
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, status: "SOLD" as const } : item
        )
      );
      setSelected((prev) => (prev ? { ...prev, status: "SOLD" as const } : prev));
      showToast("Transaction confirmed! Item marked as sold.");
    } catch {
      showToast("Failed to confirm transaction.");
    }
  };

  const openDetail = (item: UniqueItemBase) => {
    setSelected(item);
    setModal("detail");
  };

  const openEdit = (item: UniqueItemBase) => {
    setSelected(item);
    setModal("edit");
  };

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;
  const soldCount = items.filter((i) => i.status === "SOLD").length;

  return (
    <div className={styles.page}>
      <Top/>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.heading}>My Listings</h1>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statNum}>{activeCount}</span> active
            </span>
            <span className={styles.statDivider} />
            <span className={styles.stat}>
              <span className={styles.statNum}>{soldCount}</span> sold
            </span>
          </div>
        </div>
        <button
          className={`${styles.btn} ${styles.btnCta}`}
          onClick={() => setModal("create")}
        >
          <span className={styles.btnIcon}><Plus/></span> New Listing
        </button>
      </header>

      {/* Grid */}
      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><Package/></div>
          <p>You haven't listed anything yet.</p>
          <button
            className={`${styles.btn} ${styles.btnCta}`}
            onClick={() => setModal("create")}
          >
            Create your first listing
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onView={() => openDetail(item)}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}><X/></button>
            <h2 className={styles.modalTitle}>
              {modal === "create" ? "New Listing" : "Edit Listing"}
            </h2>
            <ItemForm
              initial={selected ?? undefined}
              onSubmit={modal === "create" ? handleCreate : handleEdit}
              onCancel={closeModal}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modal === "detail" && selected && (
        <DetailModal
          item={selected}
          onClose={closeModal}
          onAcceptBid={handleAcceptBid}
          onRejectBid={handleRejectBid}
          onConfirmTransaction={handleConfirmTransaction}
        />
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <NavBar />
    </div>
  );
}