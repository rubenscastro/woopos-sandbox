import type { ReactNode } from 'react';
import { PosText } from './PosText';
import { Close } from '../android/icons';

/**
 * iOS POS modal sheet (POSSheet / PointOfSaleModalHeader). A centered card over a dimmed
 * backdrop with a header row: title (posHeadingBold) + trailing xmark close button. Larger
 * corner radius than Material per iOS/HIG. `title` optional — omit for a title-less sheet.
 *
 * Reuses the shared `.woopos-scrim` backdrop token; the X uses the shared Close glyph (SF
 * Symbol `xmark` equivalent).
 */
interface PosModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export function PosModal({ open, title, onClose, children, maxWidth = 520 }: PosModalProps) {
  if (!open) return null;
  return (
    <div
      className="woopos-scrim"
      role="presentation"
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90%',
          overflow: 'auto',
          background: 'var(--color-surface-bright)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-normal-large)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <PosText variant="heading" bold style={{ flex: 1, minWidth: 0 }}>
            {title ?? ''}
          </PosText>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ border: 'none', background: 'none', display: 'flex', color: 'var(--color-on-surface)', padding: 4, cursor: 'pointer', flex: 'none' }}
          >
            <Close size="var(--icon-large)" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
