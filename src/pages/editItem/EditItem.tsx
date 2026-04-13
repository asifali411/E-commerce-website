import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./EditItem.module.css";
import {
  Image01,
} from "@untitledui/icons";
import { useToast } from "../../components/toast/Toast";
import { useNavigate, useParams } from "react-router-dom";
import type { ItemCategory, ItemCondition } from "../../global/types";
import type { ItemResponse } from "../../global/schema";
import type { ItemUpdate } from "../../global/request";
import { useAction } from "../../context/ActionProvider";
import Spinner from "../../components/spinner/Spinner";
import { CATEGORIES } from "../../global/var";

// ── Types ──────────────────────────────────────────────

interface EditItemProps {
  onSuccess?: (item: ItemResponse) => void;
  onCancel?: () => void;
}

type ExistingImageSlot = { kind: "existing"; id: number; url: string };
type NewImageSlot = { kind: "new"; file: File; preview: string };
type ImageSlot = ExistingImageSlot | NewImageSlot;

// ── Constants ─────────────────────────────────────────

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

const { All, ...ITEM_CATEGORY } = CATEGORIES;

// ── Helpers ────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className={styles.fieldError}>{msg}</span>;
}

// ── Main Component ─────────────────────────────────────

export default function EditItem({ onCancel }: EditItemProps) {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);

  const [item, setItem] = useState<ItemResponse | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<ItemCondition | "">("");
  const [categories, setCategories] = useState<ItemCategory[]>([]);

  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ItemUpdate, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const isBidLocked = !!item && item.bid_count > 0;

  const { fetchItem, updateItem, uploadImage, deleteImage } = useAction();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Load existing item ────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      if (isNaN(itemId)) {
        addToast({
          type: "error",
          title: "Invalid Item ID",
          message: `Item ID ${itemId} is invalid.`,
          duration: 4000,
        });
        setPageLoading(false);
        return;
      }

      try {
        const data = await fetchItem(itemId);
        if (!isMounted) return;

        if (data) {
          setItem(data);
          setTitle(data.title);
          setDescription(data.description);
          setMinPrice(String(data.min_price));
          setQuantity(String(data.quantity));
          setCondition(data.condition);
          setCategories(data.categories);
          setImageSlots(
            data.images.map(
              (img): ExistingImageSlot => ({
                kind: "existing",
                id: img.id,
                url: img.image_path,
              }),
            ),
          );
        } else {
          addToast({
            type: "error",
            title: "Failed to find item.",
            message: "If you are seeing this error, please report it.",
            duration: 4000,
          });
        }
      } catch {
        if (isMounted) {
          addToast({
            type: "error",
            title: "Failed to find item.",
            message: "If you are seeing this error, please report it.",
            duration: 4000,
          });
          setPageLoading(false);
        }
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [itemId, fetchItem]);

  useEffect(() => {
    return () => {
      imageSlots.forEach((slot) => {
        if (slot.kind === "new") URL.revokeObjectURL(slot.preview);
      });
    };
  }, []);

  // ── Validation ────────────────────────────────────────

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

  // ── Image handling ────────────────────────────────────

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (incoming.length === 0) return;

    setImageSlots((prev) => {
      const remaining = 3 - prev.length;
      if (remaining <= 0) return prev;

      const added: NewImageSlot[] = incoming
        .slice(0, remaining)
        .map((file) => ({
          kind: "new" as const,
          file,
          preview: URL.createObjectURL(file),
        }));

      return [...prev, ...added];
    });
  }, []);

  function removeImage(index: number) {
    setImageSlots((prev) => {
      const slot = prev[index];
      if (!slot) return prev;

      if (slot.kind === "existing") {
        setDeletedImageIds((ids) => [...ids, slot.id]);
      } else {
        URL.revokeObjectURL(slot.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  // ── Submit ────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      // ── 1. Build a partial update ──
      const body: ItemUpdate = {};

      if (title.trim() !== item?.title) body.title = title.trim();

      if (description.trim() !== item?.description)
        body.description = description.trim();

      if (parseFloat(minPrice) !== item?.min_price)
        body.min_price = parseFloat(minPrice);

      if (parseInt(quantity, 10) !== item?.quantity)
        body.quantity = parseInt(quantity, 10);

      if (condition !== item?.condition)
        body.condition = condition as ItemCondition;

      const categoriesChanged =
        categories.length !== item?.categories.length ||
        categories.some((c) => !item?.categories.includes(c));
      if (categoriesChanged) body.categories = categories;

      if (Object.keys(body).length > 0) {
        const result = await updateItem(itemId, body);

        if (!result) {
          addToast({
            type: "error",
            title: "Failed to update item.",
            message:
              "This might be an issue with the server. Please try again later.",
            duration: 4000,
          });
          return;
        }
      }

      // ── 2. Delete removed images ───────────────────────────
      const deleteResults = await Promise.all(
        deletedImageIds.map((imgId) =>
          deleteImage(imgId).then((ok) => ({ imgId, ok })),
        ),
      );

      const failedDeletes = deleteResults.filter((r) => !r.ok);
      if (failedDeletes.length > 0) {
        addToast({
          type: "error",
          title: "Some images could not be removed.",
          message: `${failedDeletes.length} image(s) failed to delete. The rest of your changes were saved.`,
          duration: 5000,
        });
      }

      // ── 3. Upload new images ───────────────────────────────
      const newSlots = imageSlots.filter(
        (s): s is NewImageSlot => s.kind === "new",
      );

      const uploadResults = await Promise.all(
        newSlots.map((slot) =>
          uploadImage(itemId, slot.file).then((res) => ({
            file: slot.file.name,
            ok: res !== null,
          })),
        ),
      );

      const failedUploads = uploadResults.filter((r) => !r.ok);
      if (failedUploads.length > 0) {
        addToast({
          type: "error",
          title: "Some images could not be uploaded.",
          message: `${failedUploads.length} image(s) failed to upload. The rest of your changes were saved.`,
          duration: 5000,
        });
        return;
      }

      // ── 4. All done ────────────────────────────────────────
      addToast({
        type: "success",
        title: "Item updated successfully.",
        message: `Your item '${title.trim()}' has been updated.`,
        duration: 4000,
      });

      navigate("/listings");
    } catch (e: unknown) {
      addToast({
        type: "error",
        title: e instanceof Error ? e.message : "Something went wrong.",
        message: "",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(cat: ItemCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  // ── Form ──────────────────────────────────────────────

  const charLeft = 500 - description.length;

  if (pageLoading) {
    return (
      <div className={styles.stateWrapper}>
        <Spinner />
        <p className={styles.stateLabel}>Fetching item…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {onCancel && (
          <button className={styles.cancelBtn} onClick={onCancel}>
            ✕ Cancel
          </button>
        )}
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Edit your Item</h1>
          <p className={styles.pageSubtitle}>
            Fill in the details below to update your item.
          </p>
        </div>
      </header>

      <div className={styles.formWrapper}>
        <div className={styles.formGrid}>
          {/* ── LEFT COLUMN ── */}
          <div className={styles.leftCol}>
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

            <div className={styles.twoCol}>
              <div
                className={`${styles.field} ${isBidLocked ? styles.disabled : ""}`}
              >
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
                    disabled={isBidLocked}
                    className={`${styles.input} ${styles.inputWithPrefix} ${errors.min_price ? styles.inputError : ""}`}
                    placeholder="0.00"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <FieldError msg={errors.min_price} />
              </div>

              <div
                className={`${styles.field} ${isBidLocked ? styles.disabled : ""}`}
              >
                <label className={styles.label} htmlFor="item-qty">
                  Quantity <span className={styles.required}>*</span>
                </label>
                <input
                  id="item-qty"
                  type="number"
                  min={1}
                  disabled={isBidLocked}
                  className={`${styles.input} ${errors.quantity ? styles.inputError : ""}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <FieldError msg={errors.quantity} />
              </div>
            </div>

            <div>
              You cannot edit the price, quantity and condition of this item
              once bids are placed.{" "}
              <span className={styles.dropLink}>Learn More</span>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className={styles.rightCol}>
            <div
              className={`${styles.field} ${isBidLocked ? styles.disabled : ""}`}
            >
              <label className={styles.label}>
                Condition <span className={styles.required}>*</span>
              </label>
              <div className={styles.conditionGroup}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={isBidLocked}
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

            <div className={styles.field}>
              <label className={styles.label}>
                Categories <span className={styles.required}>*</span>
                <span className={styles.labelHint}> — pick all that apply</span>
              </label>
              <div className={styles.categoryGroup}>
                {Object.entries(ITEM_CATEGORY).map(([cat, icon]) => {
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

              {imageSlots.length < 3 && (
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
                      <Image01 />
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
              )}

              {imageSlots.length > 0 && (
                <div className={styles.previewGrid}>
                  {imageSlots.map((slot, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img
                        src={
                          slot.kind === "existing"
                            ? `/api/${slot.url}`
                            : slot.preview
                        }
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
            {loading ? <span className={styles.spinner} /> : "Update Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
