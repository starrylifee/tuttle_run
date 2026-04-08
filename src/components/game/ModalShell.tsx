import type { ReactNode } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'regular' | 'wide';
}

export function ModalShell({
  isOpen,
  eyebrow,
  title,
  onClose,
  children,
  actions,
  size = 'regular',
}: ModalShellProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal-card modal-card--${size}`}>
        <div className="modal-card__top">
          <div>
            <p className="modal-card__eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="modal-card__close" onClick={onClose} aria-label="모달 닫기">
            닫기
          </button>
        </div>

        <div className="modal-card__body">{children}</div>

        {actions ? <div className="modal-card__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

