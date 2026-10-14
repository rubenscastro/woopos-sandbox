import type { ReactNode } from 'react';
import { Text } from './Text';
import './BottomSheet.css';

/** A dismissible bottom sheet with a scrim, sliding up from the bottom of the device. */
interface BottomSheetProps {
  title: string;
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export function BottomSheet({ title, open, onDismiss, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="woopos-sheet-scrim" onClick={onDismiss} role="presentation">
      <div className="woopos-sheet" onClick={(e) => e.stopPropagation()}>
        <Text variant="heading" bold align="center" style={{ display: 'block' }}>
          {title}
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
