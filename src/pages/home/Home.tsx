import { useEffect, useState } from "react";
import {
  SearchLg,
  User01,
  LogIn01,
  Tag01,
  ArrowRight,
} from "@untitledui/icons";
import styles from "./Home.module.css";
import ItemCard from "../../components/itemCard/ItemCard";
import type { ItemResponse } from "../../global/schema";
import type { ItemCategory } from "../../global/types";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const CATEGORIES = [
  "All" , "Electronics" , "Stationary" , "Rent" , "Miscellaneous"
];

// ── Main page ──────────────────────────────────────────────
export default function Home() {

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("All");
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const { user, fetchFeed } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = async () => {
    const nextPage = page + 1;
    const newItems = await fetchFeed(nextPage, 10);
    setItems((prev) => [...prev, ...newItems]);
    setPage(nextPage);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await fetchFeed(0, 10);
        setItems(data);
      } catch (error) {
        
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

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Home</h1>

        <div className={styles.headerRight}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <SearchLg size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
        {CATEGORIES.map((cat: any) => (
          <button
            key={cat}
            className={`${styles.filterChip} ${activeCategory === cat ? styles.filterChipActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat !== "All" && <Tag01 size={13} />}
            {cat}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.empty}>
          <p>Loading...</p>
        </div>
      ) : filtered.length > 0 ? (
        <section className={styles.grid}>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
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
            Load more
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}