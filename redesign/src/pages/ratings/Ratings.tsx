import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star01,
  User01,
  Package,
  Monitor01,
  PencilLine,
  Building07,
  ArrowRight,
  CheckCircle,
  Clock,
} from "@untitledui/icons";
import styles from "./Ratings.module.css";
import type { ItemCategory } from "../../components/itemCard/ItemCard";

// ── Types ──────────────────────────────────────────────────
type RatingStatus = "Pending" | "Completed";
type RatingView = "Received" | "Given";
type FilterTab = "All" | "Pending" | "Completed";

interface Rating {
  id: number;
  score: number | null; // null = not yet submitted
  status: RatingStatus;
  rater: string; // who gave the rating
  ratee: string; // who received it -> i can see myself forgetting this often
  itemTitle: string;
  itemCategory: ItemCategory;
  createdAt: string;
}

// ── Mock data ──────────────────────────────────────────────
const ME = "rohit_d"; // TODO: changes to actual username

const MOCK_RATINGS: Rating[] = [
  // ── Received ──
  {
    id: 1,
    score: 5,
    status: "Completed",
    rater: "meera_p",
    ratee: ME,
    itemTitle: 'Dell Monitor 24"',
    itemCategory: "Electronics",
    createdAt: "2025-06-10",
  },
  {
    id: 2,
    score: 4,
    status: "Completed",
    rater: "ananya_t",
    ratee: ME,
    itemTitle: "DS Cormen Textbook",
    itemCategory: "Stationary",
    createdAt: "2025-06-08",
  },
  {
    id: 3,
    score: 3,
    status: "Completed",
    rater: "priya_r",
    ratee: ME,
    itemTitle: "Single Room (Hostel)",
    itemCategory: "Rent",
    createdAt: "2025-05-22",
  },
  {
    id: 4,
    score: 5,
    status: "Completed",
    rater: "vikram_s",
    ratee: ME,
    itemTitle: "Scientific Calculator",
    itemCategory: "Electronics",
    createdAt: "2025-05-15",
  },
  {
    id: 5,
    score: null,
    status: "Pending",
    rater: "suresh_m",
    ratee: ME,
    itemTitle: "Wildcraft Backpack 45L",
    itemCategory: "Miscellaneous",
    createdAt: "2025-06-03",
  },
  // ── Given ──
  {
    id: 6,
    score: 5,
    status: "Completed",
    rater: ME,
    ratee: "arjun_k",
    itemTitle: 'Dell Monitor 24"',
    itemCategory: "Electronics",
    createdAt: "2025-06-10",
  },
  {
    id: 7,
    score: 4,
    status: "Completed",
    rater: ME,
    ratee: "kavitha_n",
    itemTitle: "DS Cormen Textbook",
    itemCategory: "Stationary",
    createdAt: "2025-06-08",
  },
  {
    id: 8,
    score: null,
    status: "Pending",
    rater: ME,
    ratee: "ananya_t",
    itemTitle: "HP Laptop 8GB RAM",
    itemCategory: "Electronics",
    createdAt: "2025-06-12",
  },
];

// ── Helpers ────────────────────────────────────────────────
const CATEGORY_ICON: Record<ItemCategory, React.ReactNode> = {
  Electronics: <Monitor01 size={11} />,
  Stationary: <PencilLine size={11} />,
  Rent: <Building07 size={11} />,
  Miscellaneous: <Package size={11} />,
};

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// ── Star display (read-only) ───────────────────────────────
function StarDisplay({
  score,
  size = 14,
}: {
  score: number | null;
  size?: number;
}) {
  if (score === null) return <span className={styles.scorePending}>—</span>;
  return (
    <div className={styles.starDisplay}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`${styles.starGlyph} ${n <= score ? styles.starFilled : styles.starEmpty}`}
        >
          <Star01 size={size} />
        </span>
      ))}
      <span className={styles.scoreNumber}>{score.toFixed(1)}</span>
    </div>
  );
}

// ── Score summary card ─────────────────────────────────────
function ScoreSummary({ received }: { received: Rating[] }) {
  const completed = received.filter((r) => r.score !== null);
  const scores = completed.map((r) => r.score as number);
  const avg = average(scores);

  // Star distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: scores.filter((s) => s === star).length,
    pct: scores.length
      ? (scores.filter((s) => s === star).length / scores.length) * 100
      : 0,
  }));

  return (
    <div className={styles.summaryCard}>
      {/* Big score */}
      <div className={styles.summaryScore}>
        <span className={styles.summaryScoreValue}>
          {scores.length ? avg.toFixed(1) : "—"}
        </span>
        <div className={styles.summaryStars}>
          <StarDisplay
            score={scores.length ? Math.round(avg) : null}
            size={16}
          />
        </div>
        <span className={styles.summaryScoreCount}>
          {completed.length} {completed.length === 1 ? "rating" : "ratings"}
        </span>
      </div>

      {/* Divider */}
      <div className={styles.summaryDivider} />

      {/* Distribution bars */}
      <div className={styles.summaryDist}>
        {dist.map(({ star, count, pct }) => (
          <div key={star} className={styles.distRow}>
            <span className={styles.distLabel}>{star}</span>
            <Star01 size={11} className={styles.distStar} />
            <div className={styles.distBar}>
              <div
                className={styles.distBarFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={styles.distCount}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rating row ─────────────────────────────────────────────
function RatingRow({ rating, view }: { rating: Rating; view: RatingView }) {
  const isPending = rating.status === "Pending";
  const isCompleted = rating.status === "Completed";
  const counterparty = view === "Received" ? rating.rater : rating.ratee;

  return (
    <article className={`${styles.row} ${isPending ? styles.rowPending : ""}`}>
      {/* Avatar */}
      <div className={styles.rowAvatar}>
        <User01 size={18} className={styles.rowAvatarIcon} />
      </div>

      {/* User + item info */}
      <div className={styles.rowMain}>
        <div className={styles.rowTitleRow}>
          <span className={styles.rowUsername}>{counterparty}</span>
          <span
            className={`${styles.viewChip} ${view === "Received" ? styles.viewChipReceived : styles.viewChipGiven}`}
          >
            {view === "Received" ? "Rated you" : "You rated"}
          </span>
        </div>
        <div className={styles.rowItem}>
          <span className={styles.rowItemIcon}>
            {CATEGORY_ICON[rating.itemCategory]}
          </span>
          <span className={styles.rowItemTitle}>{rating.itemTitle}</span>
        </div>
        <span className={styles.rowDate}>{rating.createdAt}</span>
      </div>

      {/* Score */}
      <div className={styles.rowScore}>
        <StarDisplay score={rating.score} size={14} />
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
        {isPending && view === "Given" && (
          <button
            className={styles.actionBtnRate}
            onClick={() => {
              /* navigate to transactions to rate */
            }}
            title="Go to transactions to submit rating"
          >
            Rate now
            <ArrowRight size={13} />
          </button>
        )}
        {isPending && view === "Received" && (
          <span className={styles.awaitingLabel}>
            <Clock size={12} />
            Awaiting
          </span>
        )}
        {isCompleted && <span className={styles.noAction}>—</span>}
      </div>
    </article>
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

// ── Main page ──────────────────────────────────────────────
export default function Ratings() {
  const navigate = useNavigate();
  const [view, setView] = useState<RatingView>("Received");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const received = MOCK_RATINGS.filter((r) => r.ratee === ME);
  const given = MOCK_RATINGS.filter((r) => r.rater === ME);

  const viewData = view === "Received" ? received : given;
  const countFor = (status: RatingStatus) =>
    viewData.filter((r) => r.status === status).length;

  const filtered = viewData.filter((r) =>
    activeTab === "All" ? true : r.status === activeTab,
  );

  const completedReceived = received.filter((r) => r.score !== null);
  const avgScore = completedReceived.length
    ? average(completedReceived.map((r) => r.score as number))
    : null;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Ratings</h1>
          <div className={styles.stats}>
            <StatPill
              label="Your score"
              value={avgScore !== null ? `★ ${avgScore.toFixed(1)}` : "—"}
            />
            <StatPill label="Received" value={received.length} />
            <StatPill label="Given" value={given.length} />
          </div>
        </div>

        {/* View switcher */}
        <div className={styles.viewSwitcher}>
          <button
            className={`${styles.viewBtn} ${view === "Received" ? styles.viewBtnActive : ""}`}
            onClick={() => {
              setView("Received");
              setActiveTab("All");
            }}
          >
            <Star01 size={14} />
            Received
            <span className={styles.viewBtnCount}>{received.length}</span>
          </button>
          <button
            className={`${styles.viewBtn} ${view === "Given" ? styles.viewBtnActive : ""}`}
            onClick={() => {
              setView("Given");
              setActiveTab("All");
            }}
          >
            <User01 size={14} />
            Given
            <span className={styles.viewBtnCount}>{given.length}</span>
          </button>
        </div>
      </header>

      {/* ── Score summary (only in Received view) ── */}
      {view === "Received" && <ScoreSummary received={received} />}

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
              {tab === "All" ? viewData.length : countFor(tab as RatingStatus)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Rating rows ── */}
      {filtered.length > 0 ? (
        <div className={styles.list}>
          {filtered.map((rating) => (
            <RatingRow key={rating.id} rating={rating} view={view} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Star01 size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No ratings here</p>
          <p className={styles.emptySubtitle}>
            {view === "Received"
              ? "Ratings appear here after completed transactions."
              : "Rate your counterparts from the Transactions page."}
          </p>
          {view === "Given" && (
            <button
              className={styles.btnSecondary}
              onClick={() => navigate("/me/transactions")}
            >
              <ArrowRight size={15} />
              Go to Transactions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
