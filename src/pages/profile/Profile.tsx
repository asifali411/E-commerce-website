import React, { useState, useEffect } from "react";
import {
  User01,
  Mail01,
  Phone,
  Star01,
  ShoppingBag01,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Lock01,
  Edit02,
  DotsHorizontal,
  TrendUp01,
  ArrowUp,
  ArrowDown,
} from "@untitledui/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import styles from "./Profile.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountStatus = "active" | "locked" | "disabled";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  rating: number;
  ratingCount: number;
  memberSince: string;
  listingsCount: number;
  transactionsCompleted: number;
  accountStatus: AccountStatus;
  activityData: ActivityPoint[];
  categoryBreakdown: CategoryPoint[];
  monthlyTransactions: MonthlyPoint[];
}

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

const MOCK_PROFILE: UserProfile = {
  id: "1",
  //   username: "@sura",
  username: "Sura",
  email: "sura@gectcr.ac.in",
  phone: "+91 9876543210",
  avatarUrl:
    "https://preview.redd.it/where-are-all-these-sura-memes-coming-from-v0-iyz7oxm61inc1.png?width=1080&format=png&auto=webp&s=1cd4a5577ad869108486b780277eaa6cc1f43b9d",
  rating: 4.7,
  ratingCount: 312,
  memberSince: "2021-03-15",
  listingsCount: 148,
  transactionsCompleted: 89,
  accountStatus: "active", // "active" or "locked" or "disabled"
  activityData: [
    { month: "Aug", listings: 12, sales: 7 },
    { month: "Sep", listings: 18, sales: 11 },
    { month: "Oct", listings: 9, sales: 8 },
    { month: "Nov", listings: 22, sales: 14 },
    { month: "Dec", listings: 15, sales: 10 },
    { month: "Jan", listings: 27, sales: 18 },
    { month: "Feb", listings: 20, sales: 15 },
  ],
  categoryBreakdown: [
    { name: "Electronics", value: 68, fill: "var(--color-primary)" },
    { name: "Stationary", value: 45, fill: "var(--color-accent)" },
    { name: "Rent", value: 22, fill: "var(--color-cta)" },
    { name: "Miscellaneous", value: 13, fill: "var(--color-success)" },
  ],
  monthlyTransactions: [
    { month: "Aug", amount: 1240, delta: 0 },
    { month: "Sep", amount: 1870, delta: 50.8 },
    { month: "Oct", amount: 1430, delta: -23.5 },
    { month: "Nov", amount: 2610, delta: 82.5 },
    { month: "Dec", amount: 2200, delta: -15.7 },
    { month: "Jan", amount: 3050, delta: 38.6 },
    { month: "Feb", amount: 2780, delta: -8.9 },
  ],
};

// ─── Backend Stubs ────────────────────────────────────────────────────────────

async function fetchUserProfile(_userId: string): Promise<UserProfile> {
  // TODO: replace
  // e.g. const res = await fetch(`/api/users/${_userId}`);
  // return res.json();
  return Promise.resolve(MOCK_PROFILE);
}

async function fetchActivityData(_userId: string): Promise<ActivityPoint[]> {
  // TODO: replace with real API call
  return Promise.resolve(MOCK_PROFILE.activityData);
}

async function fetchMonthlyTransactions(
  _userId: string,
): Promise<MonthlyPoint[]> {
  // TODO: replace with real API call
  return Promise.resolve(MOCK_PROFILE.monthlyTransactions);
}

async function fetchCategoryBreakdown(
  _userId: string,
): Promise<CategoryPoint[]> {
  // TODO: replace with real API call
  return Promise.resolve(MOCK_PROFILE.categoryBreakdown);
}

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

const StarRating: React.FC<{ rating: number; count: number }> = ({
  rating,
  count,
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
      <span className={styles.ratingCount}>({count} reviews)</span>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}> = ({ icon, label, value, sub }) => (
  <div className={styles.statCard}>
    <span className={styles.statIcon}>{icon}</span>
    <div className={styles.statBody}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  </div>
);

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

const Profile: React.FC<{ userId?: string }> = ({
  userId = "1",
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUserProfile(userId),
      fetchActivityData(userId),
      fetchMonthlyTransactions(userId),
      fetchCategoryBreakdown(userId),
    ])
      .then(([p]) => {
        setProfile(p);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <span>Loading profile…</span>
      </div>
    );
  }

  if (!profile) {
    return <div className={styles.loadingScreen}>User not found.</div>;
  }

  const memberSinceDate = new Date(profile.memberSince);
  const memberSinceFormatted = memberSinceDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const lastTx = profile.monthlyTransactions.at(-1);
  const prevTx = profile.monthlyTransactions.at(-2);
  const txDelta =
    prevTx && lastTx
      ? ((lastTx.amount - prevTx.amount) / prevTx.amount) * 100
      : 0;

  return (
    <div className={styles.page}>
      <StatusBanner status={profile.accountStatus} />

      <div className={styles.container}>
        {/* ── Profile Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.avatarWrap}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  <User01 size={48} />
                </div>
              )}
              <span
                className={`${styles.statusDot} ${
                  profile.accountStatus === "active"
                    ? styles.dotActive
                    : profile.accountStatus === "locked"
                      ? styles.dotLocked
                      : styles.dotDisabled
                }`}
              />
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroNameRow}>
                <h1 className={styles.username}>{profile.username}</h1>
                {profile.accountStatus !== "active" && (
                  <span
                    className={`${styles.statusPill} ${
                      profile.accountStatus === "locked"
                        ? styles.pillLocked
                        : styles.pillDisabled
                    }`}
                  >
                    {profile.accountStatus === "locked" ? (
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
              {/* <span className={styles.username}>{profile.username}</span> */}
              {/* {profile.bio && <p className={styles.bio}>{profile.bio}</p>} */}
              <StarRating rating={profile.rating} count={profile.ratingCount} />
            </div>
          </div>

          <div className={styles.heroActions}>
            <button className={styles.btnPrimary}>
              <Edit02 size={16} /> Edit Profile
            </button>
            <button className={styles.btnGhost}>
              <DotsHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail01 size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{profile.email}</span>
          </div>
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{profile.phone}</span>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={16} className={styles.infoIcon} />
            <span className={styles.infoLabel}>Member Since</span>
            <span className={styles.infoValue}>{memberSinceFormatted}</span>
          </div>
          {/* {profile.location && (
            <div className={styles.infoItem}>
              <User01 size={16} className={styles.infoIcon} />
              <span className={styles.infoLabel}>Location</span>
              <span className={styles.infoValue}>{profile.location}</span>
            </div>
          )} */}
        </div>

        {/* ── Quick Stats ── */}
        <div className={styles.statsRow}>
          <StatCard
            icon={<ShoppingBag01 size={20} />}
            label="Active Listings"
            value={profile.listingsCount}
            sub="Total published"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Transactions"
            value={profile.transactionsCompleted}
            sub="Completed"
          />
          <StatCard
            icon={<Star01 size={20} />}
            label="Rating"
            value={profile.rating.toFixed(1)}
            sub={`${profile.ratingCount} reviews`}
          />
          <StatCard
            icon={<TrendUp01 size={20} />}
            label="Revenue (Feb)"
            value={`₹${lastTx?.amount?.toLocaleString("en-IN") ?? "—"}`}
            sub={
              txDelta !== 0
                ? `${txDelta > 0 ? "+" : ""}${txDelta.toFixed(1)}% vs Jan`
                : undefined
            }
          />
        </div>

        {/* ── Charts Grid ── */}
        <div className={styles.chartsGrid}>
          {/* Activity Chart */}
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
                data={profile.activityData}
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

          {/* Monthly Revenue */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Monthly Revenue</h2>
                <p className={styles.chartSub}>RUP earnings per month</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={profile.monthlyTransactions}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
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
                <Bar
                  dataKey="amount"
                  name="Revenue ($)"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Category Breakdown</h2>
                <p className={styles.chartSub}>Listings by category</p>
              </div>
            </div>
            <div className={styles.radialWrapper}>
              <ResponsiveContainer width="50%" height={180}>
                <RadialBarChart
                  innerRadius="30%"
                  outerRadius="100%"
                  data={profile.categoryBreakdown}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar background dataKey="value" cornerRadius={6} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className={styles.tooltip}>
                          <p style={{ color: payload[0].payload.fill }}>
                            {payload[0].payload.name}
                          </p>
                          <strong>{payload[0].value} listings</strong>
                        </div>
                      ) : null
                    }
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className={styles.categoryLegend}>
                {profile.categoryBreakdown.map((c) => (
                  <div key={c.name} className={styles.catRow}>
                    <span
                      className={styles.catDot}
                      style={{ background: c.fill }}
                    />
                    <span className={styles.catName}>{c.name}</span>
                    <span className={styles.catVal}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className={`${styles.chartCard} ${styles.chartWide}`}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Revenue Trend</h2>
                <p className={styles.chartSub}>Month-over-month change (%)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={profile.monthlyTransactions}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
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
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="delta"
                  name="Change"
                  stroke="var(--color-cta)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--color-cta)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Transaction Delta Cards ── */}
        <div className={styles.deltaRow}>
          {profile.monthlyTransactions.slice(1).map((m) => (
            <div key={m.month} className={styles.deltaCard}>
              <span className={styles.deltaMonth}>{m.month}</span>
              <span className={styles.deltaAmount}>
                ₹{m.amount.toLocaleString("en-IN")}
              </span>
              <span
                className={`${styles.deltaBadge} ${m.delta >= 0 ? styles.deltaPos : styles.deltaNeg}`}
              >
                {m.delta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(m.delta).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
