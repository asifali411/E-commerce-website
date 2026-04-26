import { useState, useEffect } from "react";
import styles from "./ReportItemDetail.module.css";
import { useNavigate, useParams } from "react-router-dom";
import type { ItemCondition } from "../../global/types";
import type {
  AdminUniqueItemResponse,
  ReportResponse,
} from "../../global/schema";
import Spinner from "../../components/spinner/Spinner";
import { useToast } from "../../components/toast/Toast";
import { useAdmin } from "../../context/AdminProvider";
import { Trash01 } from "../../global/icons";
import Dialog from "../../components/dialog/Dialog";

// ── Sub-components ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
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
    </div>
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

function ReportCard({ report }: { report: ReportResponse }) {
  return (
    <div className={styles.bidCard}>
      <div className={styles.bidUser}>
        <div className={styles.bidAvatar}>
          {report.reporter.image_path ? (
            <img
              src={`/api/${report.reporter.image_path}`}
              alt={report.reporter.username}
            />
          ) : (
            report.reporter.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <p className={styles.bidUsername}>{report.reporter.username}</p>
          <StarRating rating={report.reporter.rating} />
        </div>
        <span className={styles.bidChip}>{report.category.replaceAll("_", " ")}</span>
      </div>
      {report.description && (
        <p className={styles.reportDescription}>{report.description}</p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ReportItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const { addToast } = useToast();
  const { fetchAdminItem, deleteAdminItem } = useAdmin();

  // --- State ---
  const [item, setItem] = useState<AdminUniqueItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      if (isNaN(itemId)) {
        setError("Invalid Item ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminItem(itemId);
        if (isMounted) {
          if (data) {
            setItem(data);
          } else {
            setError("Item not found");
          }
        }
      } catch (err) {
        if (isMounted) setError("Failed to fetch item details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [itemId, fetchAdminItem]);

  // --- Handlers ---
  const onBack = () => navigate(-1);

  const handleDeleteItem = async () => {
    try {
      const res = await deleteAdminItem(item!.id);
      if (!res) {
        addToast({
          type: "error",
          title: "Failed to delete item.",
          message: "Please try again later.",
          duration: 4000,
        });
      } else {
        addToast({
          type: "success",
          title: "Successfully deleted item.",
          message: `${item!.title} has been successfully deleted.`,
          duration: 4000,
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to delete item.",
        message: "Please try again later.",
        duration: 4000,
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      navigate(-1);
    }
  };

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className={styles.stateWrapper}>
        <Spinner />
        <p className={styles.stateLabel}>Fetching item…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.stateWrapper}>
        <div className={styles.errorIcon}>!</div>
        <p className={styles.stateLabel}>{error ?? "Item not found"}</p>
        <button className={styles.backBtn} onClick={onBack}>
          ← Go back
        </button>
      </div>
    );
  }

  const hasImages = item.images && item.images.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <span className={styles.itemId}>#{item.id}</span>
        <span
          className={`${styles.statusPill} ${item.status === "Sold" ? styles.statusSold : styles.statusActive}`}
        >
          {item.status}
        </span>
        <button
          className={styles.deleteBtn}
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete
          <Trash01 size={15} />
        </button>
      </header>

      {/* --- Dialog --- */}
      <Dialog
        open={showDeleteDialog}
        title="Delete Item"
        description="This action cannot be reversed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={async () => {
          setDeleting(true);
          await handleDeleteItem();
        }}
        onCancel={() => {
          if (!deleting) {
            setShowDeleteDialog(false);
          }
        }}
      />

      <main className={styles.layout}>
        {/* Left: Gallery */}
        <section className={styles.gallery}>
          <div className={styles.mainImage}>
            {hasImages ? (
              <img
                src={`/api/${item.images[activeImage].image_path}`}
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
                  <img src={`/api/${img.image_path}`} alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right: Details */}
        <section className={styles.details}>
          <div className={styles.categoryRow}>
            {item.categories?.map((c) => (
              <span key={c} className={styles.category}>
                {c}
              </span>
            ))}
            <ConditionBadge condition={item.condition} />
          </div>

          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.sellerCard}>
            <div className={styles.avatar}>
              {item.seller.username?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className={styles.sellerName}>{item.seller.username}</p>
              <StarRating rating={item.seller.rating} />
            </div>
          </div>
        </section>
      </main>

      {/* Reports Section */}
      <section className={styles.bidsSection}>
        <h2 className={styles.bidsHeading}>
          Reports <span className={styles.bidCount}>{item.reports.length}</span>
        </h2>
        {item.reports.length === 0 ? (
          <p className={styles.noBids}>No reports filed for this item.</p>
        ) : (
          <div className={styles.bidsGrid}>
            {item.reports.map((report, i) => (
              <ReportCard key={i} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}