import { useEffect, useState } from "react";
import { SearchLg, ArrowRight } from "@untitledui/icons";
import styles from "./AdminPanel.module.css";
import ItemCard from "../../components/itemCard/ItemCard";
import type { AdminItemResponse } from "../../global/schema";
import type { ReportCategory } from "../../global/types";

import { useNavigate } from "react-router-dom";
import Spinner from "../../components/spinner/Spinner";
import ReportDialog from "../../components/reportDialog/ReportDialog";
import { useAdmin } from "../../context/AdminProvider";
import CategoryDropdown from "../../components/categoryDropdown/CategoryDropdown";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "Illegal_Items", label: "Illegal items" },
  { value: "Explicit_or_Adult_Content", label: "Explicit or adult content" },
  {
    value: "Restricted_or_Prohibited_Items",
    label: "Restricted or prohibited items",
  },
  { value: "Inappropriate_Content", label: "Inappropriate content" },
  { value: "Taking_Too_Much_Time", label: "Taking too much time" },
  { value: "Other", label: "Other" },
];

// ── Main page ──────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminItemResponse[]>([]);
  const { fetchReportedItems } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [loadmoreLoading, setLoadmoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportItemId, setReportItemId] = useState<number | undefined>(
    undefined,
  );
  const [selectedCategories, setSelectedCategories] = useState<
    ReportCategory[]
  >([]);

  const loadMore = async () => {
    setLoadmoreLoading(true);
    const nextPage = page + 1;
    const newItems = await fetchReportedItems(nextPage * 10, 10);
    setItems((prev) => [...prev, ...newItems]);
    setPage(nextPage);
    setLoadmoreLoading(false);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await fetchReportedItems(0, 10);

        const map = new Map();
        data.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        setItems(Array.from(map.values()));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [fetchReportedItems]);

  // const filtered = items.filter((item: AdminUniqueItemResponse) => {
  //   if (selectedCategories.length === 0) return true;
  //   selectedCategories.forEach((cat: ReportCategory) => {
  //     console.log(item);
  //     item.reports.forEach((rep: ReportResponse) => {
  //       if(cat === rep.category) return true;
  //     })
  //   });
  //   return false;
  // });
  
  //TODO: fix the filter function once the backend is properly configured
  const filtered = items;

  const handleReport = (id: number) => {
    setShowReport(true);
    setReportItemId(id);
  };

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
        <h1 className={styles.pageTitle}>Admin Panel</h1>

        <div className={styles.headerRight}>
          <CategoryDropdown
            categories={CATEGORIES}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>
      </header>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.empty}>
          <Spinner />
          <p>Loading...</p>
        </div>
      ) : filtered.length > 0 ? (
        <section className={styles.grid}>
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onReport={handleReport}
              hideHoverAction={true}
              onClick={() => {
                navigate(`/admin/reported-items/${item.id}`);
              }}
            />
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
