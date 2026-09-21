import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export type MemorialContentReaderEntry = {
  actionLabel?: string;
  eyebrow?: string;
  fullContent: ReactNode;
  id: number | string;
  image?: ReactNode;
  preview: ReactNode;
  readingMeta?: string;
  subtitle?: string;
  title: string;
};

export function useMemorialContentReader<TEntry extends MemorialContentReaderEntry = MemorialContentReaderEntry>() {
  const [activeEntry, setActiveEntry] = useState<TEntry | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openReader = useCallback((entry: TEntry, trigger?: HTMLElement | null) => {
    returnFocusRef.current = trigger ?? null;
    setActiveEntry(entry);
  }, []);

  const closeReader = useCallback(() => {
    setActiveEntry(null);

    window.setTimeout(() => {
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    }, 0);
  }, []);

  return {
    activeEntry,
    closeReader,
    isReaderOpen: Boolean(activeEntry),
    openReader,
  };
}

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
  const titleId = useId();
  const subtitleId = useId();
  const describedBy = entry?.subtitle ? subtitleId : undefined;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
          <button className="memorial-reader-back-button" onClick={onClose} type="button">
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2} />
            Back
          </button>
        </div>

        <button aria-label="Close reader" className="memorial-reader-close-button" onClick={onClose} type="button">
          <X aria-hidden="true" size={20} strokeWidth={2} />
        </button>

        {entry.image ? <div className="memorial-reader-hero-image">{entry.image}</div> : null}

        <div className="memorial-reader-content">
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
