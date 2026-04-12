import { useState, useRef, useCallback } from "react";
import styles from "./CreateItem.module.css";
import {
  Image01
} from "@untitledui/icons";
import { useAuth } from "../../context/AuthProvider";
import { useToast } from "../../components/toast/Toast";
import { useNavigate } from "react-router-dom";
import type { ItemCategory, ItemCondition } from "../../global/types";
import { useAction } from "../../context/ActionProvider";
import { CATEGORIES } from "../../global/var";

// ── Types ──────────────────────────────────────────────

interface ItemCreate {
  title: string;
  description: string;
  min_price: number;
  quantity: number;
  condition: ItemCondition;
  categories: ItemCategory[];
}

interface ItemResponse {
  id: number;
  title: string;
}

interface CreateItemProps {
  apiBase?: string;
  onSuccess?: (item: ItemResponse) => void;
  onCancel?: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CONDITIONS: { value: ItemCondition; label: string; desc: string }[] = [
  { value: "New", label: "New", desc: "Unused, original condition" },
  {
    value: "Lightly_Used",
    label: "Lightly Used",
    desc: "Minor signs of use, works perfectly",
  },
  {
    value: "Heavily_Used",
    label: "Heavily Used",
    desc: "Visible wear, fully functional",
  },
];

// const CATEGORIES: { value: ItemCategory; label: string; icon: any }[] = [
//   { value: "Electronics", label: "Electronics", icon: <Monitor01 /> },
//   { value: "Stationary", label: "Stationary", icon: <PencilLine /> },
//   { value: "Rent", label: "Rent", icon: <Building07 /> },
//   { value: "Miscellaneous", label: "Miscellaneous", icon: <Package /> },
// ];

// ── Helpers ────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className={styles.fieldError}>{msg}</span>;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CreateItem({
  onSuccess,
  onCancel,
}: CreateItemProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<ItemCondition | "">("");
  const [categories, setCategories] = useState<ItemCategory[]>([]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ItemCreate, string>>
  >({});
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { createItem, uploadImage} = useAction();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Validation ───────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Title is required.";
    else if (title.length < 3) e.title = "Title must be at least 3 characters.";

    if (!description.trim()) e.description = "Description is required.";
    else if (description.length < 10)
      e.description = "Description must be at least 10 characters.";

    const price = parseFloat(minPrice);

    if (!minPrice) e.min_price = "Minimum price is required.";
    else if (isNaN(price) || price <= 0)
      e.min_price = "Enter a valid price greater than 0.";

    const qty = parseInt(quantity, 10);

    if (!quantity) e.quantity = "Quantity is required.";
    else if (isNaN(qty) || qty < 1) e.quantity = "Quantity must be at least 1.";

    if (!condition) e.condition = "Select a condition.";
    if (categories.length === 0) e.categories = "Select at least one category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Image handling ───────────────────────────────────────────────────────

  function addFiles(files: FileList | null) {
    if (!files) return;
    const allowed = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const next = [...imageFiles, ...allowed].slice(0, 3);
    setImageFiles(next);
    next.forEach((f, i) => {
      if (imagePreviews[i]) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => {
          const arr = [...prev];
          arr[i] = e.target?.result as string;
          return arr;
        });
      };
      reader.readAsDataURL(f);
    });
    const previews: string[] = [];
    next.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews[i] = ev.target?.result as string;
        if (previews.filter(Boolean).length === next.length) {
          setImagePreviews([...previews]);
        }
      };
      reader.readAsDataURL(f);
    });
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [imageFiles],
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const body: ItemCreate = {
        title: title.trim(),
        description: description.trim(),
        min_price: parseFloat(minPrice),
        quantity: parseInt(quantity, 10),
        condition: condition as ItemCondition,
        categories,
      };

      const item: ItemResponse | null = await createItem(body);

      if(!item){
        
        addToast({
          type: "error",
          title: isAuthenticated ? "Failed to create Item" : "You are logged out.",
          message: isAuthenticated ? "" : "Please login to continue.",
          duration: 4000,
        });
        setLoading(false);
        return;
      }

      for (const file of imageFiles) {
        uploadImage(item.id, file);
      }

      onSuccess?.(item);
      addToast({
        type: "success",
        title: "Item created successfully",
        message: `${body.title} has been created for ${body.min_price} rupees`,
        duration: 4000,
      });
    } catch (e: unknown) {
      addToast({
        type: "error",
        title: e instanceof Error ? e.message : "Something went wrong.",
        message: "",
        duration: 4000,
      });
    } finally {
      setLoading(false);
      navigate("/listings");
    }
  }

  function toggleCategory(cat: ItemCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  const charLeft = 500 - description.length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        {onCancel && (
          <button className={styles.cancelBtn} onClick={onCancel}>
            ✕ Cancel
          </button>
        )}
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>List an Item</h1>
          <p className={styles.pageSubtitle}>
            Fill in the details below to start receiving bids.
          </p>
        </div>
      </header>

      <div className={styles.formWrapper}>

        <div className={styles.formGrid}>
          {/* ── LEFT COLUMN ── */}
          <div className={styles.leftCol}>
            {/* Title */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="item-title">
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="item-title"
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
              <FieldError msg={errors.title} />
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="item-desc">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="item-desc"
                className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                placeholder="Describe your item — condition details, included accessories, reason for selling…"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                rows={5}
              />
              <div className={styles.charRow}>
                <FieldError msg={errors.description} />
                <span
                  className={`${styles.charCount} ${charLeft < 50 ? styles.charWarn : ""}`}
                >
                  {charLeft} left
                </span>
              </div>
            </div>

            {/* Price + Quantity */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="item-price">
                  Min Price (₹) <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputPrefix}>
                  <span className={styles.prefix}>₹</span>
                  <input
                    id="item-price"
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${styles.input} ${styles.inputWithPrefix} ${errors.min_price ? styles.inputError : ""}`}
                    placeholder="0.00"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <FieldError msg={errors.min_price} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="item-qty">
                  Quantity <span className={styles.required}>*</span>
                </label>
                <input
                  id="item-qty"
                  type="number"
                  min={1}
                  className={`${styles.input} ${errors.quantity ? styles.inputError : ""}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <FieldError msg={errors.quantity} />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className={styles.rightCol}>
            {/* Condition */}
            <div className={styles.field}>
              <label className={styles.label}>
                Condition <span className={styles.required}>*</span>
              </label>
              <div className={styles.conditionGroup}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.condCard} ${condition === c.value ? styles.condCardActive : ""}`}
                    onClick={() => setCondition(c.value)}
                  >
                    <span className={styles.condLabel}>{c.label}</span>
                    <span className={styles.condDesc}>{c.desc}</span>
                  </button>
                ))}
              </div>
              <FieldError msg={errors.condition} />
            </div>

            {/* Categories */}
            <div className={styles.field}>
              <label className={styles.label}>
                Categories <span className={styles.required}>*</span>
                <span className={styles.labelHint}> — pick all that apply</span>
              </label>
              <div className={styles.categoryGroup}>
                {Object.entries(CATEGORIES).map(([cat, icon]) => {
                  const selected = categories.includes(cat as ItemCategory);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.catChip} ${selected ? styles.catChipActive : ""}`}
                      onClick={() => toggleCategory(cat as ItemCategory)}
                    >
                      <span>{icon}</span>
                      {cat}
                      {selected && <span className={styles.catCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <FieldError msg={errors.categories} />
            </div>

            {/* Image upload */}
            <div className={styles.field}>
              <label className={styles.label}>
                Images
                <span className={styles.labelHint}> — up to 3 photos</span>
              </label>

              {/* Drop zone */}
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.fileInput}
                  onChange={(e) => addFiles(e.target.files)}
                />
                <div className={styles.dropContent}>
                  <span className={styles.dropIcon}>
                    <Image01/>
                  </span>
                  <p className={styles.dropText}>
                    Drop images here or{" "}
                    <span className={styles.dropLink}>browse</span>
                  </p>
                  <p className={styles.dropHint}>
                    PNG, JPG, WEBP · max 3 files
                  </p>
                </div>
              </div>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className={styles.previewGrid}>
                  {imagePreviews.map((src, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img
                        src={src}
                        alt={`preview ${i + 1}`}
                        className={styles.previewImg}
                      />
                      {i === 0 && (
                        <span className={styles.primaryBadge}>Cover</span>
                      )}
                      <button
                        className={styles.removeImg}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.submitRow}>
          {onCancel && (
            <button
              className={styles.btnSecondary}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
