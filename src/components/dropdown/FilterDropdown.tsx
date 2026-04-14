import { useState, useRef, useEffect } from "react";
import { ChevronDown, } from "@untitledui/icons";
import styles from "./FilterDropdown.module.css";
import type { ItemCategory } from "../../global/types";
import { CATEGORIES } from "../../global/var";

interface FilterDropdownProps {
  selected?: ItemCategory;
  onChange: (selected: ItemCategory) => void;
}

export default function FilterDropdown({
  selected = "All",
  onChange,
}: FilterDropdownProps) {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(selected);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={` ${styles.trigger} `}
      >
        {activeCategory}
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <div className={styles.menu}>

          {Object.entries(CATEGORIES).map(([cat, icon]) => (
            <button
              key={cat}
              className={`${styles.option} ${activeCategory === cat ? styles.optionSelected : ""}`}
              onClick={() => {
                setActiveCategory(cat as ItemCategory);
                onChange(cat as ItemCategory);
                setOpen(false);
              }}
            >
              {icon}
              {cat}
            </button>
          ))}
          <button></button>
        </div>
      )}
    </div>
  );
}