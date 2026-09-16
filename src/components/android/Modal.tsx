import type { ReactNode } from 'react';
import { Close } from './icons';
import { useIsPhone } from '../../hooks/useBreakpoint';
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
  /** Optional cap on the card width (e.g. for compact dialogs). */
  maxWidth?: number | string;
  /**
   * A fixed card size in px, instead of a share of the screen. iOS sizes its POS modals this
   * way — POSModalSizing pins them to 640 × 656 at default text size and only shrinks to fit
   * the screen — where Android's dialog takes 0.75 of the width and is as tall as it needs.
   * Both still cap at 90% of the height.
   */
  width?: number;
  height?: number;
}

export function Modal({ open, onDismiss, onClose, children, backgroundLabel = 'Dismiss dialog', maxWidth, width, height }: ModalProps) {
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
        style={{
          width: width ?? (isPhone ? '95%' : '75%'),
          maxWidth: width === undefined ? maxWidth : '100%',
          height,
          maxHeight: '90%',
        }}
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
