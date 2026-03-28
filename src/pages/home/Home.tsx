import { useEffect, useState } from "react";
import {
  SearchLg,
  User01,
  LogIn01,
  Tag01,
  ArrowRight,
} from "@untitledui/icons";
import styles from "./Home.module.css";
import ItemCard, { type Item } from "../../components/itemCard/ItemCard";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

// ── Mock data ──────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Electronics",
  "Stationary",
  "Rent",
  "Miscellaneous",
] as const;

type Category = (typeof CATEGORIES)[number];

// @ts-ignore
const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    title: 'Dell monitor 24"',
    seller: "arjun",
    sellerRating: 4.5,
    minPrice: 3500,
    categories: ["Electronics", "Stationary"],
    condition: "Lightly Used",
    bids: 4,
    timeLeft: "2h left",
  },
  {
    id: 2,
    title: "Engineering drawing set",
    seller: "meera",
    sellerRating: 4.0,
    minPrice: 180,
    categories: ["Stationary"],
    condition: "New",
    bids: 2,
  },
  {
    id: 3,
    title: "Single room (hostel)",
    seller: "vikram",
    sellerRating: 3.8,
    minPrice: 800,
    categories: ["Rent"],
    condition: "New",
    bids: 1,
  },
  {
    id: 4,
    title: "Cycle helmet",
    seller: "priya",
    sellerRating: 4.2,
    minPrice: 420,
    categories: ["Miscellaneous"],
    condition: "Lightly Used",
    bids: 0,
  },
  {
    id: 5,
    title: "HP laptop 8GB RAM",
    seller: "rohit",
    sellerRating: 4.8,
    minPrice: 18000,
    categories: ["Electronics"],
    condition: "Lightly Used",
    bids: 9,
    timeLeft: "5h left",
  },
  {
    id: 6,
    title: "DS Cormen textbook",
    seller: "ananya",
    sellerRating: 4.3,
    minPrice: 900,
    categories: ["Stationary"],
    condition: "Heavily Used",
    bids: 6,
  },
  {
    id: 7,
    title: "Wildcraft backpack",
    seller: "suresh gobi",
    sellerRating: 4.7,
    minPrice: 650,
    categories: ["Miscellaneous"],
    condition: "New",
    bids: 3,
  },
  {
    id: 8,
    title: "Scientific calculator",
    seller: "kavitha",
    sellerRating: 3.9,
    minPrice: 350,
    categories: ["Electronics"],
    condition: "Lightly Used",
    bids: 2,
    timeLeft: "12h left",
  },
];

// ── Main page ──────────────────────────────────────────────
export default function Home() {

  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const { fetchAllItems } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = async () => {
    const nextPage = page + 1;
    const newItems = await fetchAllItems(nextPage, 10);
    setItems((prev) => [...prev, ...newItems]);
    setPage(nextPage);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await fetchAllItems(0, 10);
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [fetchAllItems]);

  const filtered = items.filter((item) => {
    const matchesCategory =
      activeCategory === "All"
        ? true
        : item.categories.includes(activeCategory);
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.toLowerCase().includes(search.toLowerCase());
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
        {CATEGORIES.map((cat) => (
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