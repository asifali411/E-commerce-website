import { navExpanded, setNavExpanded } from "../../global/var";
import { NavLink, Outlet } from "react-router-dom";
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

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: "/",                 label: "Home",          icon: <Home01 />           },
  { to: "/me/listings",      label: "My listings",   icon: <Grid01 />           },
  { to: "/me/bids",          label: "My bids",       icon: <Wallet03 />         },
  { to: "/me/transactions",  label: "Transactions",  icon: <SwitchVertical01 /> },
  { to: "/me/ratings",       label: "Ratings",       icon: <Star01 />           },
  { to: "/me/notifications", label: "Notifications", icon: <Bell01 />           },
];

export default function Nav() {

  const [expanded, setExpanded] = useState(navExpanded);

  const handleNavExpansion = (value: boolean): void => {
    setNavExpanded(value);
    setExpanded(value);
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
              <User01 />
            </span>
            <span className={styles.label}>Profile</span>
          </NavLink>

          <button
            className={styles.logoutBtn}
            onClick={() => {
              fetch("/logout", { method: "POST" }).finally(() => {
                window.location.href = "/login";
              });
            }}
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
    </div>
  );
}
