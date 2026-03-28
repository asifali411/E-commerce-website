import { useState, useRef, useEffect } from "react";
import styles from "./NavBar.module.css";
import { Search, House, Settings, Tags, Bell, LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { CSSProperties, FC } from "react";

const NavBar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleNavigation = (name: string, path?: string) => {
    if (name === "search") {
      setIsSearchOpen(!isSearchOpen);
    } else if (path) {
      navigate(path);
    }
  };

  const navItem = (
    name: string,
    label: string,
    Icon: LucideIcon,
    extraStyle: CSSProperties = {},
    path: string = "/"
  ) => {
    const isActive =
      name === "search" ? isSearchOpen : location.pathname === path;

    return (
      <div
        tabIndex={0}
        role="button"
        className={`${styles.iconContainer} ${
          isActive ? styles.selected : ""
        }`}
        style={extraStyle}
        onClick={() => handleNavigation(name, path)}
      >
        <span>{label}</span>
        <Icon />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {navItem("home", "Home", House, {}, "/")}
      {navItem("search", "Search", Search, { marginLeft: "2em" })}
      {navItem("listings", "My Listings", Tags, { marginLeft: "1em" }, "/MyListings")}
      {navItem("notification", "Notifications", Bell, {}, "/notification")}
      {navItem("settings", "Settings", Settings, {}, "/settings")}

      <form
        className={styles.search}
        style={{
          opacity: isSearchOpen ? "1" : "0",
          top: isSearchOpen ? "calc(-100% - 0.5rem)" : "100%",
          pointerEvents: isSearchOpen ? "all" : "none",
        }}
      >
        <input
          type="text"
          ref={searchInputRef}
          className={styles.search__input}
          placeholder="Search..."
        />

        <button type="submit" className={styles.search__button}>
          <Search size={"1rem"} />
        </button>
      </form>
    </div>
  );
};

export default NavBar;