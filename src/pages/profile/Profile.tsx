import {
  Mail01,
  Phone,
  Star01,
  Calendar,
  AlertTriangle,
  Lock01,
} from "@untitledui/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./Profile.module.css";
import { useAuth } from "../../context/AuthProvider";
import { useState } from "react";
import { useAction } from "../../context/ActionProvider";
import AvatarDialog from "../../components/avatarDialog/AvatarDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountStatus = "active" | "locked" | "disabled";

export interface ActivityPoint {
  month: string;
  listings: number;
  sales: number;
}

export interface CategoryPoint {
  name: string;
  value: number;
  fill: string;
}

export interface MonthlyPoint {
  month: string;
  amount: number;
  delta: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const activityData = [
  { month: "Aug", listings: 12, sales: 7 },
  { month: "Sep", listings: 18, sales: 11 },
  { month: "Oct", listings: 9, sales: 8 },
  { month: "Nov", listings: 22, sales: 14 },
  { month: "Dec", listings: 15, sales: 10 },
  { month: "Jan", listings: 27, sales: 18 },
  { month: "Feb", listings: 20, sales: 15 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBanner: React.FC<{ status: AccountStatus }> = ({ status }) => {
  if (status === "active") return null;

  const isLocked = status === "locked";
  return (
    <div
      className={`${styles.banner} ${isLocked ? styles.bannerLocked : styles.bannerDisabled}`}
    >
      <span className={styles.bannerIcon}>
        {isLocked ? <Lock01 size={18} /> : <AlertTriangle size={18} />}
      </span>
      <div className={styles.bannerText}>
        <strong>{isLocked ? "Account Locked" : "Account Disabled"}</strong>
        <span>
          {isLocked
            ? "This account has been temporarily locked. The user cannot log in or perform marketplace actions until the lock is removed."
            : "This account has been permanently disabled. All listings have been removed and transactions are suspended."}
        </span>
      </div>
    </div>
  );
};

const StarRating: React.FC<{ rating: number }> = ({
  rating,
}) => {
  const full = Math.floor(rating);
  const partial = rating - full;

  return (
    <div className={styles.starRow}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill =
            i <= full ? 100 : i === full + 1 ? Math.round(partial * 100) : 0;
          return (
            <span key={i} className={styles.starWrap}>
              <Star01 size={16} className={styles.starBg} />
              <div className={styles.starFill} style={{ width: `${fill}%`, opacity: `${fill / 100}` }}>
                <Star01 size={16} />
              </div>
            </span>
          );
        })}
      </div>
      <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
    </div>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          style={{ color: p.color }}
          className={styles.tooltipItem}
        >
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Profile: React.FC<{ userId?: string }> = () => {

  const {user} = useAuth();
  const { updateAvatar } = useAction();

  const memberSinceDate = new Date(user?.member_since!);
  const memberSinceFormatted = memberSinceDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const accountStatus = user?.locked ? "locked" : (user?.disabled ? "disabled" : "active");
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);

  return (
    <div className={styles.page}>
      <StatusBanner status={accountStatus} />

      <AvatarDialog
        open={openAvatarDialog}
        currentAvatar={user?.image_path ?? undefined}
        onClose={() => setOpenAvatarDialog(false)}
        onSave={async (blob: Blob, previewUrl: string) => {
          try {
            const avatarFile = new File([blob], "avatar.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            await updateAvatar(avatarFile);

            setOpenAvatarDialog(false);
          } catch (error) {
            console.error("Failed to update avatar:", error);
          }
        }}
      />

      <div className={styles.container}>
        {/* ── Profile Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div
              className={styles.avatarWrap}
              onClick={() => setOpenAvatarDialog(true)}
            >
              {user?.image_path ? (
                <img
                  src={user?.image_path}
                  alt={user?.username}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {user?.username?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span
                className={`${styles.statusDot} ${
                  accountStatus === "active"
                    ? styles.dotActive
                    : accountStatus === "locked"
                      ? styles.dotLocked
                      : styles.dotDisabled
                }`}
              />
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroNameRow}>
                <h1 className={styles.username}>{user?.username}</h1>
                {accountStatus !== "active" && (
                  <span
                    className={`${styles.statusPill} ${
                      accountStatus === "locked"
                        ? styles.pillLocked
                        : styles.pillDisabled
                    }`}
                  >
                    {accountStatus === "locked" ? (
                      <>
                        <Lock01 size={12} /> Locked
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} /> Disabled
                      </>
                    )}
                  </span>
                )}
              </div>
              <StarRating rating={user?.rating!} />
            </div>
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail01 size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </div>
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>
              {user?.phone_no?.slice(0, 3)} {user?.phone_no.slice(3)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Member Since</span>
            <span className={styles.infoValue}>{memberSinceFormatted}</span>
          </div>
        </div>

        <div className={`${styles.chartCard} ${styles.chartWide}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Marketplace Activity</h2>
              <p className={styles.chartSub}>
                Listings vs. sales over 7 months
              </p>
            </div>
            <div className={styles.legendRow}>
              <span
                className={styles.legendDot}
                style={{ background: "var(--color-primary)" }}
              />
              <span className={styles.legendLabel}>Listings</span>
              <span
                className={styles.legendDot}
                style={{ background: "var(--color-accent)" }}
              />
              <span className={styles.legendLabel}>Sales</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={activityData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gListings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-card-border)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="listings"
                name="Listings"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#gListings)"
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#gSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Profile;
