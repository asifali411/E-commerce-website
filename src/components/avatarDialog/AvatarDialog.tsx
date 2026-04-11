import React, { useState, useCallback, useRef } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import styles from "./AvatarDialog.module.css";

// ─── helpers ────────────────────────────────────────────────────────────────

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 400,
): Promise<Blob> {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      0.92,
    );
  });
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface AvatarDialogProps {
  /** Whether the dialog is visible */
  open: boolean;
  /** Current avatar URL shown as fallback before a new image is chosen */
  currentAvatar?: string;
  /** Called when the user dismisses the dialog without saving */
  onClose: () => void;
  /** Called with the final cropped Blob when the user clicks Save */
  onSave: (blob: Blob, previewUrl: string) => void | Promise<void>;
}

// ─── component ───────────────────────────────────────────────────────────────

type Step = "select" | "crop" | "preview";

export const AvatarDialog: React.FC<AvatarDialogProps> = ({
  open,
  currentAvatar,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // raw image chosen by the user (object URL)
  const [rawImage, setRawImage] = useState<string | null>(null);

  // crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // final preview blob URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const [step, setStep] = useState<Step>("select");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── file selection ────────────────────────────────────────────────────────

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file (JPEG, PNG, WebP…).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be smaller than 10 MB.");
        return;
      }

      setError(null);
      const url = URL.createObjectURL(file);
      setRawImage(url);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setStep("crop");

      // reset input so the same file can be re-selected
      e.target.value = "";
    },
    [],
  );

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const fakeEvent = {
        target: { files: e.dataTransfer.files, value: "" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    },
    [handleFileChange],
  );

  // ── crop callbacks ────────────────────────────────────────────────────────

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropNext = useCallback(async () => {
    if (!rawImage || !croppedAreaPixels) return;
    setError(null);
    try {
      const blob = await getCroppedBlob(rawImage, croppedAreaPixels);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setStep("preview");
    } catch {
      setError("Something went wrong while processing the image.");
    }
  }, [rawImage, croppedAreaPixels]);

  // ── save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!previewBlob || !previewUrl) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(previewBlob, previewUrl);
      handleClose();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [previewBlob, previewUrl, onSave]);

  // ── close / reset ─────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    if (rawImage) URL.revokeObjectURL(rawImage);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRawImage(null);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setStep("select");
    setError(null);
    setSaving(false);
    onClose();
  }, [rawImage, previewUrl, onClose]);

  const handleBack = useCallback(() => {
    if (step === "preview") {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewBlob(null);
      setStep("crop");
    } else {
      if (rawImage) URL.revokeObjectURL(rawImage);
      setRawImage(null);
      setStep("select");
    }
    setError(null);
  }, [step, rawImage, previewUrl]);

  // ── render ────────────────────────────────────────────────────────────────

  if (!open) return null;

  const stepLabel: Record<Step, string> = {
    select: "Choose Photo",
    crop: "Crop & Zoom",
    preview: "Preview",
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Update profile photo"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={styles.dialog}>
        {/* ── header ── */}
        <div className={styles.header}>
          <div className={styles.steps}>
            {(["select", "crop", "preview"] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <span
                  className={`${styles.stepDot} ${step === s ? styles.stepDotActive : ""} ${["select", "crop", "preview"].indexOf(step) > i ? styles.stepDotDone : ""}`}
                >
                  {["select", "crop", "preview"].indexOf(step) > i ? (
                    <svg viewBox="0 0 10 10" fill="none">
                      <polyline
                        points="2,5 4.5,7.5 8,3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {i < 2 && (
                  <span
                    className={`${styles.stepLine} ${["select", "crop", "preview"].indexOf(step) > i ? styles.stepLineDone : ""}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <h2 className={styles.title}>{stepLabel[step]}</h2>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        {/* ── body ── */}
        <div className={styles.body}>
          {/* STEP 1 — select */}
          {step === "select" && (
            <div className={styles.selectStep}>
              {currentAvatar && (
                <div className={styles.currentAvatarWrap}>
                  <img
                    src={currentAvatar}
                    alt="Current avatar"
                    className={styles.currentAvatar}
                  />
                  <span className={styles.currentLabel}>Current photo</span>
                </div>
              )}

              <div
                className={styles.dropZone}
                onClick={handleDropZoneClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleDropZoneClick()}
                aria-label="Upload image"
              >
                <div className={styles.dropIcon}>
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="20" cy="20" r="18" strokeDasharray="3 3" />
                    <path
                      d="M20 26V14M14 20l6-6 6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className={styles.dropPrimary}>Click or drag &amp; drop</p>
                <p className={styles.dropSecondary}>
                  JPEG, PNG, WebP · max 10 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* STEP 2 — crop */}
          {step === "crop" && rawImage && (
            <div className={styles.cropStep}>
              <div className={styles.cropContainer}>
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      borderRadius: "12px",
                      overflow: "hidden",
                    },
                  }}
                />
              </div>
              <div className={styles.zoomRow}>
                <svg
                  className={styles.zoomIcon}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <line x1="10" y1="10" x2="14" y2="14" strokeLinecap="round" />
                  <line
                    x1="4.5"
                    y1="6.5"
                    x2="8.5"
                    y2="6.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                  aria-label="Zoom"
                />
                <svg
                  className={styles.zoomIcon}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <line x1="10" y1="10" x2="14" y2="14" strokeLinecap="round" />
                  <line
                    x1="4.5"
                    y1="6.5"
                    x2="8.5"
                    y2="6.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="6.5"
                    y1="4.5"
                    x2="6.5"
                    y2="8.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className={styles.cropHint}>
                Drag to reposition · scroll or slide to zoom
              </p>
            </div>
          )}

          {/* STEP 3 — preview */}
          {step === "preview" && previewUrl && (
            <div className={styles.previewStep}>
              <div className={styles.previewSizes}>
                <div className={styles.previewSize}>
                  <img
                    src={previewUrl}
                    alt="Avatar preview large"
                    className={styles.previewLg}
                  />
                  <span>Large</span>
                </div>
                <div className={styles.previewSize}>
                  <img
                    src={previewUrl}
                    alt="Avatar preview medium"
                    className={styles.previewMd}
                  />
                  <span>Medium</span>
                </div>
                <div className={styles.previewSize}>
                  <img
                    src={previewUrl}
                    alt="Avatar preview small"
                    className={styles.previewSm}
                  />
                  <span>Small</span>
                </div>
              </div>
              <p className={styles.previewHint}>
                Looking good? Hit <strong>Save</strong> to update your profile.
              </p>
            </div>
          )}
        </div>

        {/* ── error ── */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="6.5" />
              <line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.5" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        {/* ── footer ── */}
        <div className={styles.footer}>
          {step !== "select" ? (
            <button
              className={styles.btnSecondary}
              onClick={handleBack}
              disabled={saving}
            >
              ← Back
            </button>
          ) : (
            <button className={styles.btnSecondary} onClick={handleClose}>
              Cancel
            </button>
          )}

          {step === "crop" && (
            <button className={styles.btnPrimary} onClick={handleCropNext}>
              Next →
            </button>
          )}

          {step === "preview" && (
            <button
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : null}
              {saving ? "Saving…" : "Save Photo"}
            </button>
          )}

          {step === "select" && (
            <button className={styles.btnPrimary} onClick={handleDropZoneClick}>
              Choose File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarDialog;