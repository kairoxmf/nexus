import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon3D } from "@shared/icons";
type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
  /** When false, backdrop click and Escape won't close the modal. */
  closable?: boolean;
};

export function NexusModal({ open, onClose, title, subtitle, children, wide, closable = true }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (closable && e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, closable]);

  if (!open) return null;

  return createPortal(
    <div className="nx-modal-backdrop" onClick={closable ? onClose : undefined} role="presentation">
      <div
        className={`nx-modal${wide ? " is-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="nx-modal-header">
          <div>
            <h2 className="nx-modal-title">{title}</h2>
            {subtitle && <p className="nx-modal-sub">{subtitle}</p>}
          </div>
          {closable && (
            <button type="button" className="nx-modal-close" onClick={onClose} aria-label="Close">
              <Icon3D name="close" size={16} />
            </button>
          )}
        </header>
        <div className="nx-modal-body nx-scroll nx-scroll-glow">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
