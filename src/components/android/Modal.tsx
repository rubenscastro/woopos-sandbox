import type { ReactNode } from 'react';
import { Close } from './icons';
import { useIsPhone } from '../../hooks/useBreakpoint';
import './Modal.css';

/**
 * WooPosDialogWrapper — a centered modal card over a dismissible scrim. surfaceBright,
 * Large radius, slide+fade in, optional close button top-right. Rendered absolutely within
 * the device screen.
 *
 * Width is a fraction of the screen, never a pixel cap: tablets take `widthFraction`, phones
 * always 0.95. Only the phone caps height (0.9); on a tablet the card is as tall as its
 * content, which is why a dialog with little in it reads wide and short rather than square.
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
   * Share of the screen width on tablet — WooPosDialogWrapper's own parameter. Defaults to its
   * DEFAULT_WIDTH_FRACTION; the card reader connection dialog passes 0.55.
   */
  widthFraction?: number;
}

export function Modal({ open, onDismiss, onClose, children, backgroundLabel = 'Dismiss dialog', maxWidth, widthFraction = 0.75 }: ModalProps) {
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
          width: isPhone ? '95%' : `${widthFraction * 100}%`,
          maxWidth: maxWidth ?? 'calc(100% - var(--space-lg) * 2)',
          maxHeight: isPhone ? '90%' : undefined,
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
