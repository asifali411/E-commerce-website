import { navExpanded, setNavExpanded } from "../../global/var";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./Nav.module.css";

import {
    Home01,
    Grid01,
    Wallet03,
    SwitchVertical01,
    Star01,
    Bell01,
    User01,
    LogOut01,
} from "@untitledui/icons";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import Dialog from "../dialog/Dialog";
import { useNotifications } from "../../context/NotificationProvides";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  isNotification?: boolean;
}

const navItems: NavItem[] = [
  { to: "/",                 label: "Home",          icon: <Home01 />           },
  { to: "/me/listings",      label: "My listings",   icon: <Grid01 />           },
  { to: "/me/bids",          label: "My bids",       icon: <Wallet03 />         },
  { to: "/me/transactions",  label: "Transactions",  icon: <SwitchVertical01 /> },
  { to: "/me/ratings",       label: "Ratings",       icon: <Star01 />           },
  { to: "/me/notifications", label: "Notifications", icon: <Bell01 />           , isNotification: true },
];

export default function Nav() {

  const [expanded, setExpanded] = useState(navExpanded);
  const navigate = useNavigate();
  const {isAuthenticated, user, logout} = useAuth();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { unreadCount } = useNotifications();

  const handleNavExpansion = (value: boolean): void => {
    setNavExpanded(value);
    setExpanded(value);
  }

  const handleLogout = (): void => {
    logout();
    setOpenLogoutDialog(false);
    navigate("/");
  }
 
  return (
    <div className={styles.shell}>
      <nav
        className={`${styles.sidebar} ${expanded ? styles.expanded : ""}`}
        onMouseEnter={() => handleNavExpansion(true)}
        onMouseLeave={() => handleNavExpansion(false)}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>CB</div>
          <span className={styles.logoText}>Campus Bid</span>
        </div>

        {/* Main links */}
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.iconWrap}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {isAuthenticated && item.isNotification && unreadCount > 0 && 
                  <span className={styles.indicator}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                }
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.bottom}>
          <NavLink
            to="/me/profile"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.iconWrap}>
              {isAuthenticated && (
                <div className={styles.avatar}>
                  {user?.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              {!isAuthenticated && <User01 />}
            </span>
            <span className={styles.label}>
              {!isAuthenticated && "Profile"}{" "}
              {isAuthenticated && (user?.username ?? "Profile")}
            </span>
          </NavLink>

          <button
            className={styles.logoutBtn}
            onClick={() => {
              setOpenLogoutDialog(true);
            }}
            disabled={!isAuthenticated}
          >
            <span className={styles.iconWrap}>
              <LogOut01 />
            </span>
            <span className={styles.label}>Log out</span>
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ── Dialog ── */}
      <Dialog
        open={openLogoutDialog}
        title="Log out"
        description="Are you sure you want to log out?"
        confirmLabel={"Log out"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => {
          setOpenLogoutDialog(false);
        }}
        customIcon={<LogOut01 size={16} />}
      />
    </div>
  );
}
