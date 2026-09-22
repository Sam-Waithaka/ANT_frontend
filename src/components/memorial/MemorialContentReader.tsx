import { useEffect, useId, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { MemorialContentReaderEntry } from "./useMemorialContentReader";

const focusableReaderSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export function MemorialContentPreviewCard({
  className = "",
  entry,
  onOpen,
}: {
  className?: string;
  entry: MemorialContentReaderEntry;
  onOpen: (entry: MemorialContentReaderEntry, trigger: HTMLElement) => void;
}) {
  const actionLabel = entry.actionLabel || "Read more";

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${actionLabel}: ${entry.title}`}
      className={`memorial-content-preview-card group ${className}`}
      onClick={(event) => onOpen(entry, event.currentTarget)}
      type="button"
    >
      {entry.image ? <div className="memorial-content-preview-card__image">{entry.image}</div> : null}
      <span className="memorial-content-preview-card__body">
        {entry.eyebrow ? <span className="memorial-content-preview-card__eyebrow">{entry.eyebrow}</span> : null}
        <span className="memorial-content-preview-card__title">{entry.title}</span>
        {entry.subtitle ? <span className="memorial-content-preview-card__subtitle">{entry.subtitle}</span> : null}
        <span className="memorial-content-preview-card__preview">{entry.preview}</span>
        <span className="memorial-content-preview-card__footer">
          {entry.readingMeta ? <span>{entry.readingMeta}</span> : <span />}
          <span className="memorial-content-preview-card__action">
            {actionLabel}
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2} />
          </span>
        </span>
      </span>
    </button>
  );
}

export function MemorialContentReaderModal({
  entry,
  onClose,
  open,
}: {
  entry: MemorialContentReaderEntry | null;
  onClose: () => void;
  open: boolean;
}) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const backdropPointerStartedOnBackdropRef = useRef(false);
  const titleId = useId();
  const subtitleId = useId();
  const describedBy = entry?.subtitle ? subtitleId : undefined;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusableElements = getReaderFocusableElements(dialog);
      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.setTimeout(() => dialogRef.current?.focus(), 0);
  }, [open]);

  if (!open || !entry) {
    return null;
  }

  return (
    <div
      className="memorial-reader-backdrop"
      onPointerDown={(event) => {
        backdropPointerStartedOnBackdropRef.current = event.target === event.currentTarget;
      }}
      onPointerCancel={() => {
        backdropPointerStartedOnBackdropRef.current = false;
      }}
      onPointerUp={(event) => {
        const shouldClose = backdropPointerStartedOnBackdropRef.current && event.target === event.currentTarget;
        backdropPointerStartedOnBackdropRef.current = false;

        if (shouldClose) {
          onClose();
        }
      }}
    >
      <section
        aria-describedby={describedBy}
        aria-labelledby={titleId}
        aria-modal="true"
        className="memorial-reader-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="memorial-reader-mobile-bar">
          <button aria-label="Back to memorial page" className="memorial-reader-back-button" onClick={onClose} type="button">
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2} />
            Back
          </button>
        </div>

        <button aria-label="Close reader" className="memorial-reader-close-button" onClick={onClose} type="button">
          <X aria-hidden="true" size={20} strokeWidth={2} />
        </button>

        <div className="memorial-reader-content">
          {entry.image ? <div className="memorial-reader-hero-image">{entry.image}</div> : null}
          <header className="memorial-reader-header">
            {entry.eyebrow ? <p className="memorial-reader-eyebrow">{entry.eyebrow}</p> : null}
            <h2 className="memorial-reader-title" id={titleId}>{entry.title}</h2>
            {entry.subtitle ? <p className="memorial-reader-subtitle" id={subtitleId}>{entry.subtitle}</p> : null}
            {entry.readingMeta ? <p className="memorial-reader-meta">{entry.readingMeta}</p> : null}
          </header>
          <div className="memorial-reader-body">{entry.fullContent}</div>
        </div>
      </section>
    </div>
  );
}

function getReaderFocusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableReaderSelector)).filter((element) => {
    const style = window.getComputedStyle(element);

    return (
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.getClientRects().length > 0
    );
  });
}
