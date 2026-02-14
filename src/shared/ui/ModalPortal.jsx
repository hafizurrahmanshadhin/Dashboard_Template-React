import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({
  open,
  title,
  onClose,
  children,
  footer,
  dialogClassName = "",
  contentClassName = "",
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    // Prevents page scroll while modal is open and restores previous state on close.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1060 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <div className={`modal-dialog modal-dialog-centered ${dialogClassName}`.trim()}>
          <div className={`modal-content ${contentClassName}`.trim()}>
            {title || onClose ? (
              <div className="modal-header">
                {title ? <h5 className="modal-title">{title}</h5> : <span />}
                {onClose ? (
                  <button type="button" className="btn-close" onClick={onClose}></button>
                ) : null}
              </div>
            ) : null}

            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
    </>,
    document.body
  );
}
