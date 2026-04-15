import { useEffect, useRef, useState } from "react";
import {
  SearchLg,
  User01,
  LogIn01,
  ArrowRight,
} from "@untitledui/icons";
import styles from "./Home.module.css";
import ItemCard from "../../components/itemCard/ItemCard";
import type { ItemResponse } from "../../global/schema";
import type { ItemCategory } from "../../global/types";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import Spinner from "../../components/spinner/Spinner";
import { useAction } from "../../context/ActionProvider";
import { useHotkeys } from "react-hotkeys-hook";
import { CATEGORIES } from "../../global/var";
import ReportDialog from "../../components/reportDialog/ReportDialog";
import FilterDropdown from "../../components/dropdown/FilterDropdown";

// ── Main page ──────────────────────────────────────────────
export default function Home() {

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("All");
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const { user } = useAuth();
  const { fetchFeed, fetchSearchItems } = useAction();
  const [loading, setLoading] = useState(true);
  const [loadmoreLoading, setLoadmoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportItemId, setReportItemId] = useState<number | undefined>(undefined);

  useHotkeys("ctrl+k", () => {
    searchInputRef.current?.focus()
  }, {preventDefault: true})

  const loadMore = async () => {
    setLoadmoreLoading(true);
    const nextPage = page + 1;
    const newItems = await fetchFeed(nextPage * 10, 10);
    setItems((prev) => [...prev, ...newItems]);
    setPage(nextPage);
    setLoadmoreLoading(false);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await fetchFeed(0, 10);

        const map = new Map();
        data.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        setItems(Array.from(map.values()));
      } catch (error) {
        error;
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [fetchFeed]);

  const filtered = items.filter((item) => {
    const matchesCategory =
      activeCategory === "All"
        ? true
        : item.categories.includes(activeCategory);
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.username.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = async () => {
    try {
      setLoading(true);

      const data = search.length > 0 ? await fetchSearchItems({search: search}) : await fetchFeed(0, 10);

      const map = new Map();
      data.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });
      setItems(Array.from(map.values()));
    } catch (err) {
      err;
    } finally {
      setLoading(false);
    }
  }

  const handleReport = (id: number) => {
    setShowReport(true);
    setReportItemId(id);
  }

  return (
    <div className={styles.page}>
      {showReport && reportItemId && (
        <ReportDialog
          itemId={reportItemId}
          onClose={() => setShowReport(false)}
        />
      )}
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Home</h1>

        <div className={styles.headerRight}>
          {/* Search */}
          <form
            className={styles.searchWrap}
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <SearchLg size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchInputRef}
            />
            <div className={styles.shortcut}>Ctrl + K</div>
          </form>

          {/* Auth */}
          {user === null && (
            <div className={styles.authButtons}>
              <button
                className={styles.btnLogin}
                onClick={() => {
                  navigate("/login");
                }}
              >
                <LogIn01 size={15} />
                Log in
              </button>
              <button
                className={styles.btnSignup}
                onClick={() => {
                  navigate("/register");
                }}
              >
                <User01 size={15} />
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>
      {/* ── Category filter ── */}
      <div className={styles.filterRow}>
        {Object.entries(CATEGORIES).map(([cat, icon]) => (
          <button
            key={cat}
            className={`${styles.filterChip} ${activeCategory === cat ? styles.filterChipActive : ""}`}
            onClick={() => setActiveCategory(cat as ItemCategory)}
          >
            {icon}
            {cat}
          </button>
        ))}
      </div>

      {/* ── Category dropdown & Searchbar── */}
      <div className={styles.tobbar}>
        <FilterDropdown
          onChange={(cat: ItemCategory) => {
            setActiveCategory(cat);
          }}
        />

        <form
          className={styles.searchWrap}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <SearchLg size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={searchInputRef}
          />
          <div className={styles.shortcut}>Ctrl + K</div>
        </form>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.empty}>
          <Spinner />
          <p>Loading...</p>
        </div>
      ) : filtered.length > 0 ? (
        <section className={styles.grid}>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onReport={handleReport} />
          ))}
        </section>
      ) : (
        <div className={styles.empty}>
          <SearchLg size={36} className={styles.emptyIcon} />
          <p>No items found.</p>
        </div>
      )}
      {/* ── Load more ── */}
      {filtered.length > 0 && (
        <div className={styles.loadMoreRow}>
          <button className={styles.loadMoreBtn} onClick={loadMore}>
            {loadmoreLoading ? "Loading..." : "Load more"}
            {loadmoreLoading ? <Spinner size={16} /> : <ArrowRight size={15} />}
          </button>
        </div>
      )}
    </div>
  );
}