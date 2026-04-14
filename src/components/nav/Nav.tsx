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
    LogIn01,
    LogOut01,
    User01,
    Tool02
} from "@untitledui/icons";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import Dialog from "../dialog/Dialog";
import { useNotifications } from "../../context/NotificationProvider";
import { useAdmin } from "../../context/AdminProvider";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  isNotification?: boolean;
  isHome?: boolean;
  isAdminPanel?: boolean;
}

const navItems: NavItem[] = [
  { to: "/",               label: "Home",           icon: <Home01 />,            isHome: true },
  { to: "/listings",       label: "My listings",    icon: <Grid01 />,           },
  { to: "/bids",           label: "My bids",        icon: <Wallet03 />,         },
  { to: "/transactions",   label: "Transactions",   icon: <SwitchVertical01 />, },
  { to: "/ratings",        label: "Ratings",        icon: <Star01 />,           },
  { to: "/notifications",  label: "Notifications",  icon: <Bell01 />,            isNotification: true },
  { to: "/admin",          label: "Admin panel",    icon: <Tool02 />,            isAdminPanel: true }
];

let activePath = "/";

export default function Nav() {

  const [expanded, setExpanded] = useState(navExpanded);
  const navigate = useNavigate();
  const {isAuthenticated, user, logout} = useAuth();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { unreadCount } = useNotifications();
  const { isAdmin } = useAdmin();
 
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
          {navItems.map((item) => {

            if(item.isAdminPanel && !isAdmin) return;

            return (
              <li key={item.to}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) return;
                    activePath = item.to;
                    navigate(item.to);
                  }}
                  className={`${styles.navLink} ${activePath == item.to ? styles.active : ""}`}
                  disabled={!isAuthenticated}
                >
                  <span className={styles.iconWrap}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                  {isAuthenticated && item.isNotification && unreadCount > 0 && (
                    <span className={styles.indicator}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {isAuthenticated && (
          <div className={styles.bottom}>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.iconWrap}>
                {
                  !user?.image_path && 
                  <div className={styles.avatar}>
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </div>
                }

                {
                  user?.image_path &&
                  <div className={styles.avatar}>
                    <img src={`/api/${user.image_path}`} alt={user.username}/>
                  </div>
                }
              </span>
              <span className={styles.label}>{user?.username}</span>
            </NavLink>

            <button
              className={styles.logoutBtn}
              onClick={() => {
                setOpenLogoutDialog(true);
              }}
            >
              <span className={styles.iconWrap}>
                <LogOut01 />
              </span>
              <span className={styles.label}>Log out</span>
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className={styles.bottom}>
            <div className={styles.authButtons}>
              <button
                className={styles.btnSignup}
                onClick={() => {
                  navigate("/register");
                }}
              >
                <User01 size={15} />
                <span>
                  Sign up
                </span>
              </button>

              <button
                className={styles.btnLogin}
                onClick={() => {
                  navigate("/login");
                }}
              >
                <LogIn01 size={15} />
                <span>Log in</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ── Dialog ── */}
      <Dialog
        open={openLogoutDialog}
        title="Log out"
        description="Are you sure you want to log out?"
        confirmLabel="Log out"
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
