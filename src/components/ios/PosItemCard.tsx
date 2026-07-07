import { PosText } from './PosText';
import { ProductImage } from '../android/ProductImage';
import { ChevronRight } from '../android/icons';

/**
 * iOS product/coupon card (Item Selector/SimpleProductCardView.swift + card constants). A
 * full-width row card: 112pt square image on the left, then name (bodyLarge bold, up to 2
 * lines) + a detail line (price / "Options available"), surfaceContainerLowest background
 * with the iOS card border + rounding. Variable products show a chevron and drill in.
 *
 * Image data is the shared catalog (ProductImage is a data-driven renderer, not platform
 * chrome) — the store's products are the same on both platforms.
 */
export interface PosItemCardData {
  id: number;
  name: string;
  detail: string;
  variable?: boolean;
}

export function PosItemCard({ item, onClick }: { item: PosItemCardData; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
        minHeight: 112,
        background: 'var(--color-surface-container-lowest)',
        border: 'none',
        // iOS item cards use POSCornerRadiusStyle.medium (8px) — radius-md, not radius-lg.
        borderRadius: 'var(--radius-md)',
        // posItemCardBorderStyles() → posShadow(.medium).
        boxShadow: 'var(--pos-shadow-medium)',
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: 'var(--color-on-surface)',
        font: 'inherit',
      }}
    >
      <div style={{ width: 112, minHeight: 112, flex: 'none' }}>
        <ProductImage id={item.id} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-xs)', padding: 'var(--space-sm) var(--space-md)' }}>
        <PosText variant="bodyLarge" bold style={ELLIPSIS_2}>
          {item.name}
        </PosText>
        <PosText variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={ELLIPSIS_1}>
          {item.detail}
        </PosText>
      </div>
      {item.variable && (
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--space-md)' }}>
          <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
        </div>
      )}
    </button>
  );
}

const ELLIPSIS_2: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};
const ELLIPSIS_1: React.CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
};
