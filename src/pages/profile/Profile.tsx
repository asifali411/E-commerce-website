import {
  Mail01,
  Phone,
  Star01,
  Calendar,
  AlertTriangle,
  Lock01,
  Moon01,
  Bell01,
  LogOut01,
} from "@untitledui/icons";
import styles from "./Profile.module.css";
import { useAuth } from "../../context/AuthProvider";
import { useState } from "react";
import { useAction } from "../../context/ActionProvider";
import AvatarDialog from "../../components/avatarDialog/AvatarDialog";
import { useToast } from "../../components/toast/Toast";
import { useAdmin } from "../../context/AdminProvider";
import { useSettings } from "../../context/SettingProcider";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountStatus = "active" | "locked" | "disabled";

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

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
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
              <div
                className={`${fill > 0 ? styles.starFill : styles.starOutline}`}
                style={{ opacity: `${fill === 0 ? 1 : fill / 100}` }}
              >
                <Star01 size={16} />
              </div>
            </span>
          );
        })}
      </div>
      <span className={styles.ratingValue}>{rating?.toFixed(1)}</span>
    </div>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    className={`${styles.toggle} ${checked ? styles.toggleOn : ""} ${disabled ? styles.toggleDisabled : ""}`}
    onClick={() => onChange(!checked)}
  >
    <span className={styles.toggleThumb} />
  </button>
);

// ─── Settings Row ─────────────────────────────────────────────────────────────

const SettingRow: React.FC<{
  icon: React.ReactNode;
  iconColor?: string;
  label: string;
  description?: string;
  right: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, iconColor, label, description, right, onClick }) => (
  <div
    className={`${styles.settingRow} ${onClick ? styles.settingRowClickable : ""}`}
    onClick={onClick}
  >
    <div className={`${styles.settingIcon} ${iconColor ?? ""}`}>{icon}</div>
    <div className={styles.settingContent}>
      <span className={styles.settingLabel}>{label}</span>
      {description && <span className={styles.settingDesc}>{description}</span>}
    </div>
    <div className={styles.settingRight}>{right}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Profile: React.FC<{ userId?: string }> = () => {
  const { user, refresh, logout } = useAuth();
  const { updateAvatar } = useAction();
  const { addToast } = useToast();
  const { isAdmin, setAdmin } = useAdmin();

  const memberSinceDate = new Date(user?.member_since!);
  const memberSinceFormatted = memberSinceDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const accountStatus = user?.locked
    ? "locked"
    : user?.disabled
      ? "disabled"
      : "active";

  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);

  // ── Settings state ──
  const { settings, changeSetting } = useSettings();

  function handleDarkMode(val: boolean) {
    changeSetting("darkMode" ,val);
    document.documentElement.classList.toggle("light", val);
    addToast({
      type: "info",
      title: val ? "Dark mode enabled" : "Light mode enabled",
      message: "Your display preference has been saved.",
      duration: 2000,
    });
  }

  function handleLogout() {
    logout?.();
  }

  // --- Settings -----------------------------------------------------------------

  {
    /*
      NOTE:
        - there are a few icon colors that has been declared but not used.
        - when adding new setting, please consider using these colors.
        - iconPurple, iconBlue, iconAmber, [ iconGreen, iconGrey, iconRed ] <- not used
    */
  }

  const SETTINGS = {
    appearance: [
      {
        label: "Dark Mode",
        description: "Switch between light and dark theme",
        icon: Moon01,
        iconColor: styles.iconPurple,
        right: <Toggle checked={settings.darkMode} onChange={handleDarkMode} />,
      },
    ],

    notifications: [
      {
        label: "Bid Alerts",
        description: "Get notified when bids are placed, accepted or rejected",
        icon: Bell01,
        iconColor: styles.iconBlue,
        right: <Toggle checked={settings.showBidAlert} onChange={(val: boolean) => {
          changeSetting("showBidAlert", val);
          addToast({
            type: "info",
            title: val ? "Bid Alerts turned on" : "Bid Alerts turned off",
            message: "Your display preference has been saved.",
            duration: 2000,
          });
        }} />,
      },
      {
        label: "Item Updates",
        description: "Notifications for your listing activity",
        icon: Bell01,
        iconColor: styles.iconTeal,
        right: <Toggle checked={settings.showItemUpdates} onChange={(val: boolean) => {
          changeSetting("showItemUpdates", val);
          addToast({
            type: "info",
            title: val ? "Item Updates turned on" : "Item Updates turned off",
            message: "Your display preference has been saved.",
            duration: 2000,
          });
        }} />,
      },
      {
        label: "Rating Notifications",
        description: "Know when someone leaves you a rating",
        icon: Star01,
        iconColor: styles.iconAmber,
        right: <Toggle checked={settings.showRatingNotification} onChange={(val: boolean) => {
          changeSetting("showRatingNotification", val);
          addToast({
            type: "info",
            title: val ? "Rating Notifications turned on" : "Rating Notifications turned off",
            message: "Your display preference has been saved.",
            duration: 2000,
          });
        }} />,
      },
    ],
  };

  return (
    <div className={styles.page}>
      <StatusBanner status={accountStatus} />

      <AvatarDialog
        open={openAvatarDialog}
        currentAvatar={
          user?.image_path ? `/api/${user?.image_path}` : undefined
        }
        onClose={() => setOpenAvatarDialog(false)}
        onSave={async (blob: Blob) => {
          try {
            const avatarFile = new File([blob], "avatar.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            await updateAvatar(avatarFile);
            setOpenAvatarDialog(false);
            refresh();
            addToast({
              type: "success",
              title: "Avatar is being updated.",
              message: "This may take a while.",
              duration: 4000,
            });
          } catch {
            addToast({
              type: "error",
              title: "Failed to update avatar.",
              message: "Please ensure the file format is correct.",
              duration: 4000,
            });
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
                  src={`/api/${user?.image_path}`}
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

            <div className={styles.heroActions}>
              {user?.role === "Admin" && (
                <div className={styles.roleToggleWrap}>
                  <span className={styles.roleLabel}>Role</span>
                  <div className={styles.roleToggle}>
                    <button
                      className={`${styles.roleBtn} ${!isAdmin ? styles.roleBtnActive : ""}`}
                      onClick={() => {
                        setAdmin(false);
                        addToast({
                          type: "info",
                          title: "Switched to normal user",
                          message: "Admin privileges are turned off.",
                          duration: 2000,
                        });
                      }}
                    >
                      User
                    </button>
                    <button
                      className={`${styles.roleBtn} ${isAdmin ? `${styles.roleBtnActive} ${styles.roleBtnAdmin}` : ""}`}
                      onClick={() => {
                        setAdmin(true);
                        addToast({
                          type: "info",
                          title: "Switched to Admin",
                          message: "Admin privileges are active.",
                          duration: 2000,
                        });
                      }}
                    >
                      Admin
                    </button>
                  </div>
                  <div className={styles.roleBadge}>
                    <span
                      className={`${styles.badgeDot} ${isAdmin ? styles.dotAdmin : styles.dotUser}`}
                    />
                    <span>Currently: {isAdmin ? "Admin" : "User"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail01 size={16} className={styles.infoIcon} />
            <div>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.infoIcon} />
            <div>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>
                {user?.phone_no?.slice(0, 3)} {user?.phone_no.slice(3)}
              </span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Calendar size={16} className={styles.infoIcon} />
            <div>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>{memberSinceFormatted}</span>
            </div>
          </div>
        </div>

        {/* ── Settings ── */}
        <div className={styles.settingsWrap}>
          <h2 className={styles.settingsTitle}>Settings</h2>

          {/* Appearance */}
          <div className={styles.settingsGroup}>
            <p className={styles.settingsGroupLabel}>Appearance</p>
            {SETTINGS.appearance.map((setting) => (
              <SettingRow
                key={crypto.randomUUID()}
                icon={<setting.icon size={16} />}
                iconColor={setting.iconColor}
                label={setting.label}
                description={setting.description}
                right={setting.right}
              />
            ))}
          </div>

          {/* Notifications */}
          <div className={styles.settingsGroup}>
            <p className={styles.settingsGroupLabel}>Notifications</p>
            {SETTINGS.notifications.map((setting) => (
              <SettingRow
                key={crypto.randomUUID()}
                icon={<setting.icon size={16} />}
                iconColor={setting.iconColor}
                label={setting.label}
                description={setting.description}
                right={setting.right}
              />
            ))}
          </div>

          {/* Logout */}
          <div
            className={`${styles.settingsGroup} ${styles.settingsGroupDanger}`}
          >
            <p className={styles.settingsGroupLabel}>Account</p>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <span className={`${styles.settingIcon} ${styles.iconRed}`}>
                <LogOut01 size={16} />
              </span>
              <span className={styles.settingContent}>
                <span className={styles.settingLabel}>Log Out</span>
                <span className={styles.settingDesc}>
                  Sign out of your account
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};;

export default Profile;
