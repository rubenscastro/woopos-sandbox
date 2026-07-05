import type { ReactNode } from 'react';
import { Close } from './icons';
import { useIsPhone } from '../hooks/useBreakpoint';
import './Modal.css';

/**
 * WooPosDialogWrapper — a centered modal card over a dismissible scrim. surfaceBright,
 * Large radius, slide+fade in, width 0.75 (0.95 on phone, capped at 90% height), optional
 * close button top-right. Rendered absolutely within the device screen.
 */
interface ModalProps {
  open: boolean;
  onDismiss: () => void;
  onClose?: () => void;
  children: ReactNode;
  backgroundLabel?: string;
}

export function Modal({ open, onDismiss, onClose, children, backgroundLabel = 'Dismiss dialog' }: ModalProps) {
  const isPhone = useIsPhone();
  if (!open) return null;

  return (
    <div className="woopos-modal-root">
      <button
        type="button"
        className="woopos-modal-scrim"
        aria-label={backgroundLabel}
        onClick={onDismiss}
      />
      <div
        className="woopos-modal-card"
        style={{ width: isPhone ? '95%' : '75%', maxHeight: '90%' }}
        role="dialog"
        aria-modal="true"
      >
        {onClose && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="woopos-modal-close" onClick={onClose} aria-label="Close">
              <Close size="var(--icon-large)" />
            </button>
          </div>
        )}
        <div className="woopos-modal-content">{children}</div>
      </div>
    </div>
  );
}
