import { useEffect, useRef } from "react";
import styles from "./Dialog.module.css";
import {
    Trash01,
    AlertTriangle,
    CheckCircleBroken
} from "@untitledui/icons";

export type DialogVariant = "default" | "danger" | "warning" | "success";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  customIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Dialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
  customIcon,
  children,
}: DialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-desc" : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={`${styles.panel} ${styles[variant]}`}>
        <div className={styles.header}>
          {variant !== "default" && (
            <span
              className={`${styles.icon} ${styles[`icon_${variant}`]}`}
              aria-hidden="true"
            >
              {customIcon ? (
                customIcon
              ) : (
                <>
                  {variant === "danger" && <Trash01 size={16} />}
                  {variant === "warning" && <AlertTriangle size={16} />}
                  {variant === "success" && <CheckCircleBroken size={16} />}
                </>
              )}
            </span>
          )}
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
        </div>

        {description && (
          <p id="dialog-desc" className={styles.description}>
            {description}
          </p>
        )}

        {children && <div className={styles.body}>{children}</div>}

        <div className={styles.actions}>
          <button
            ref={cancelRef}
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`${styles.confirmBtn} ${styles[`confirm_${variant}`]}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}