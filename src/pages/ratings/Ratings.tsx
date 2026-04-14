import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star01,
  User01,
  ArrowRight,
  CheckCircle,
  Clock,
} from "@untitledui/icons";
import styles from "./Ratings.module.css";
import { useAuth } from "../../context/AuthProvider";
import type { RatingResponse } from "../../global/schema";
import type { RatingStatus } from "../../global/types";
import Spinner from "../../components/spinner/Spinner";
import { useAction } from "../../context/ActionProvider";

// ── Types ──────────────────────────────────────────────────
type FilterTab = "All" | RatingStatus;

// ── Helpers ────────────────────────────────────────────────
function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// ── Star display ───────────────────────────────────────────
function StarDisplay({
  score,
  size = 14,
}: {
  score: number | null | undefined;
  size?: number;
}) {
  if (score === null || score === undefined)
    return <span className={styles.scorePending}>—</span>;

  const full = Math.floor(score);
  const partial = score - full;
  return (
    <div className={styles.starDisplay}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill =
          n <= full ? 100 : n === full + 1 ? Math.round(partial * 100) : 0;
        return (
          <span
            key={n}
            className={`${styles.starGlyph} ${fill > 0 ? styles.starFilled : styles.starEmpty}`}
            style={{ opacity: `${fill === 0 ? 1 : fill / 100}` }}
          >
            <Star01 size={size} />
          </span>
        );
      })}
      <span className={styles.scoreNumber}>{score.toFixed(1)}</span>
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Rating row ─────────────────────────────────────────────
function RatingRow({
  rating,
  onRateNow,
}: {
  rating: RatingResponse;
  onRateNow: (id: number) => void;
}) {
  const isPending = rating.status === "Pending";
  const isCompleted = rating.status === "Completed";

  return (
    <article 
    className={`${styles.row} ${isPending ? styles.rowPending : ""}`}
    onClick={() => {
      if(isPending){
        onRateNow(rating.id);
      }
    }}
    >
      {/* Avatar */}
      <div className={styles.rowAvatar}>
        {rating.rated_user.image_path ? (
          <img
            src={rating.rated_user.image_path}
            alt={rating.rated_user.username}
            className={styles.rowAvatarImg}
          />
        ) : (
          <User01 size={18} className={styles.rowAvatarIcon} />
        )}
      </div>

      {/* User info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <span className={styles.rowUsername}>
            {rating.rated_user.username}
          </span>
          <span className={`${styles.viewChip} ${styles.viewChipGiven}`}>
            You rated
          </span>
        </div>
        <span className={styles.rowDate}>
          {new Date(rating.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Counterpart rating */}
      <div className={styles.rowCounterRating}>
        <span className={styles.rowCounterLabel}>Their rating</span>
        <StarDisplay score={rating.rated_user.rating} size={13} />
      </div>

      {/* Score */}
      <div className={styles.rowScore}>
        <StarDisplay score={rating.score ?? null} size={14} />
      </div>

      {/* Status */}
      <div className={styles.rowStatus}>
        {isCompleted ? (
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
            <CheckCircle size={11} />
            Completed
          </span>
        ) : (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            <Clock size={11} />
            Pending
          </span>
        )}
      </div>

      {/* Action */}
      <div className={styles.rowAction}>
        {isPending ? (
          <button
            className={styles.actionBtnRate}
            onClick={(e) => {
              e.stopPropagation();
              onRateNow(rating.id)
            }}
            title="Submit your rating"
          >
            Rate now
            <ArrowRight size={13} />
          </button>
        ) : (
          <span className={styles.noAction}>—</span>
        )}
      </div>
    </article>
  );
}

// ── Rate modal ─────────────────────────────────────────────
function RateModal({
  ratingId,
  username,
  onSubmit,
  onClose,
}: {
  ratingId: number;
  username: string;
  onSubmit: (ratingId: number, score: number) => Promise<void>;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onSubmit(ratingId, selected);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Rate {username}</h2>
        <p className={styles.modalSubtitle}>How was your experience?</p>

        <div className={styles.modalStars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`${styles.modalStar} ${
                n <= (hovered || selected) ? styles.modalStarActive : ""
              }`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(n)}
            >
              <Star01 size={28} />
            </button>
          ))}
        </div>

        {selected > 0 && (
          <p className={styles.modalScoreLabel}>{selected} / 5</p>
        )}

        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.actionBtnRate}
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function Ratings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchMyRatings, updateRating } = useAction();

  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [modalRating, setModalRating] = useState<RatingResponse | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchMyRatings();
      setRatings(data);
      setLoading(false);
    })();
  }, [fetchMyRatings]);

  const pending = ratings.filter((r) => r.status === "Pending");
  const completed = ratings.filter((r) => r.status === "Completed");

  const filtered =
    activeTab === "All"
      ? ratings
      : ratings.filter((r) => r.status === activeTab);

  const completedScores = completed
    .map((r) => r.score)
    .filter((s): s is number => s !== null && s !== undefined);
  const avgScore = completedScores.length ? average(completedScores) : null;

  const handleSubmitRating = async (ratingId: number, score: number) => {
    const res = await updateRating(ratingId, score);
    const updated = await fetchMyRatings();

    if(res && updated){
      setRatings(updated);
    }
  };

  const tabCounts: Record<FilterTab, number> = {
    All: ratings.length,
    Pending: pending.length,
    Completed: completed.length,
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Ratings</h1>
          <div className={styles.stats}>
            <StatPill
              label="Your score"
              value={
                user?.rating !== undefined ? `★ ${user.rating.toFixed(1)}` : "—"
              }
            />
            <StatPill label="Given" value={ratings.length} />
            <StatPill label="Pending" value={pending.length} />
            {avgScore !== null && (
              <StatPill label="Avg given" value={`★ ${avgScore.toFixed(1)}`} />
            )}
          </div>
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
            <span className={styles.tabCount}>{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className={styles.empty}>
          <Spinner />
          <p className={styles.emptySubtitle}>Loading ratings…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((rating) => (
            <RatingRow
              key={rating.id}
              rating={rating}
              onRateNow={(id) =>
                setModalRating(ratings.find((r) => r.id === id) ?? null)
              }
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Star01 size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No ratings here</p>
          <p className={styles.emptySubtitle}>
            Rate your counterparts from the Transactions page.
          </p>
          <button
            className={styles.btnSecondary}
            onClick={() => navigate("/transactions")}
          >
            <ArrowRight size={15} />
            Go to Transactions
          </button>
        </div>
      )}

      {/* ── Rate modal ── */}
      {modalRating && (
        <RateModal
          ratingId={modalRating.id}
          username={modalRating.rated_user.username}
          onSubmit={handleSubmitRating}
          onClose={() => setModalRating(null)}
        />
      )}
    </div>
  );
}
