import { useState } from "react";
import styles from "./ReportDialog.module.css";
import { useAction } from "../../context/ActionProvider";
import type { ReportCreate } from "../../global/request";
import type { ReportCategory } from "../../global/types";
import { useToast } from "../toast/Toast";

interface ReportDialogProps {
  itemId: number;
  onClose: () => void;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "Illegal_Items", label: "Illegal items" },
  { value: "Explicit_or_Adult_Content", label: "Explicit or adult content" },
  { value: "Restricted_or_Prohibited_Items", label: "Restricted or prohibited items" },
  { value: "Inappropriate_Content", label: "Inappropriate content" },
  { value: "Taking_Too_Much_Time", label: "Taking too much time" },
  { value: "Other", label: "Other" },
];

export default function ReportDialog({ itemId, onClose }: ReportDialogProps) {
  const { reportItem } = useAction();
  const { addToast }   = useToast();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    const data: ReportCreate = {
      category: selectedCategory,
      description: description.trim() || null,
    };

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await reportItem(itemId, data);
      //@ts-ignore
      if(res.error_code){
        setStatus("error");
        addToast({
          type: "error",
          title: "Failed to report item",
          //@ts-ignore
          message: res.message,
          duration: 4000,
        });
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
      <div className={styles.dialog}>
        {status === "success" ? (
          <div className={styles.successState}>
            <div className={styles.successIcon} aria-hidden="true">✓</div>
            <p className={styles.successTitle}>Report submitted</p>
            <p className={styles.successSubtitle}>Thanks for letting us know. We'll review this item.</p>
            <button className={styles.btnPrimary} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <p id="report-dialog-title" className={styles.title}>Report item</p>
                <p className={styles.subtitle}>Help us understand the issue</p>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
                ✕
              </button>
            </div>

            <div className={styles.categorySection}>
              <p className={styles.fieldLabel}>
                Category <span className={styles.required} aria-hidden="true">*</span>
              </p>
              <div className={styles.categoryList} role="radiogroup" aria-label="Report category">
                {CATEGORIES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`${styles.categoryOption} ${selectedCategory === value ? styles.categoryOptionSelected : ""}`}
                  >
                    <input
                      type="radio"
                      name="report-category"
                      value={value}
                      checked={selectedCategory === value}
                      onChange={() => setSelectedCategory(value)}
                      className={styles.radio}
                    />
                    <span className={styles.categoryLabel}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <p className={styles.fieldLabel}>
                Additional details{" "}
                <span className={styles.optional}>(optional)</span>
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                aria-label="Additional details"
              />
              <p className={styles.charCount}>{description.length}/500</p>
            </div>

            {status === "error" && errorMessage && (
              <p className={styles.errorMessage} role="alert">{errorMessage}</p>
            )}

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={onClose} disabled={status === "loading"}>
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={!selectedCategory || status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
