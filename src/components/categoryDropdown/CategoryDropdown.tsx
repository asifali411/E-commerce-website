import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckSquare, Square } from "@untitledui/icons";
import styles from "./CategoryDropdown.module.css";
import type { ReportCategory } from "../../global/types";

interface CategoryOption {
  value: ReportCategory;
  label: string;
}

interface CategoryDropdownProps {
  categories: CategoryOption[];
  selected: ReportCategory[];
  onChange: (selected: ReportCategory[]) => void;
}

export default function CategoryDropdown({
  categories,
  selected,
  onChange,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: ReportCategory) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => onChange([]);

  const label =
    selected.length === 0
      ? "All categories"
      : selected.length === 1
        ? (categories.find((c) => c.value === selected[0])?.label ??
          "1 selected")
        : `${selected.length} categories`;

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`${styles.trigger} ${selected.length > 0 ? styles.triggerActive : ""}`}
      >
        {label}
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <div className={styles.menu}>
          {categories.map((cat) => {
            const isSelected = selected.includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => toggle(cat.value)}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
              >
                {isSelected ? (
                  <CheckSquare size={16} className={styles.checkIcon} />
                ) : (
                  <Square size={16} className={styles.uncheckIcon} />
                )}
                {cat.label}
              </button>
            );
          })}

          {selected.length > 0 && (
            <>
              <div className={styles.divider} />
              <button onClick={clearAll} className={styles.clearBtn}>
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
