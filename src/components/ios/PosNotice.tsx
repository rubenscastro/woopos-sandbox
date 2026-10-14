import type { CSSProperties, ReactNode } from 'react';
import { PosText } from './PosText';
import { Close } from './IosIcons';

/**
 * iOS POSNoticeView (Reusable Views/POSNoticeView.swift): icon + bold title + optional
 * content column + optional dismiss ×, on a rounded card with the medium POS shadow.
 * Styles: 'neutral' (surface-bright / on-surface — the "Refresh catalog" banner) and
 * 'alertLowest' (posAlertLowest / posOnAlertLowest — added 2026-09-04 for the HTTPS
 * configuration warning). The whole card is tappable when onTap is given.
 */
export type PosNoticeStyle = 'neutral' | 'alertLowest';

const STYLES: Record<PosNoticeStyle, { bg: string; fg: string; dismiss: string }> = {
  neutral: {
    bg: 'var(--color-surface-bright)',
    fg: 'var(--color-on-surface)',
    dismiss: 'var(--color-on-surface-variant-lowest)',
  },
  alertLowest: {
    bg: 'var(--color-alert-lowest)',
    fg: 'var(--color-on-alert-lowest)',
    dismiss: 'var(--color-on-alert-lowest)',
  },
};

export function PosNotice({
  title,
  icon,
  style = 'neutral',
  onDismiss,
  onTap,
  children,
  containerStyle,
}: {
  title: string;
  icon: ReactNode;
  style?: PosNoticeStyle;
  onDismiss?: () => void;
  onTap?: () => void;
  children?: ReactNode;
  containerStyle?: CSSProperties;
}) {
  const s = STYLES[style];
  return (
    <div
      role={onTap ? 'button' : undefined}
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        background: s.bg,
        color: s.fg,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--pos-shadow-medium)',
        cursor: onTap ? 'pointer' : undefined,
        ...containerStyle,
      }}
    >
      <span style={{ display: 'flex', flex: 'none', padding: '0 var(--space-sm)', color: s.fg }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', textAlign: 'left' }}>
        <PosText variant="bodyLarge" bold color={s.fg}>
          {title}
        </PosText>
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{ border: 'none', background: 'none', display: 'flex', alignSelf: 'flex-start', color: s.dismiss, padding: 6, cursor: 'pointer', flex: 'none' }}
        >
          <Close size="var(--icon-xsmall)" />
        </button>
      )}
    </div>
  );
}
