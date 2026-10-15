import { PosText } from './PosText';
import { ProductImage } from '../android/ProductImage';
import { ChevronRight, Tag, Check } from './IosIcons';
import { useFlags } from '../../state/FlagsContext';
import { useCustomAmountOption } from '../../state/customAmountOption';
import { CouponArt } from '../versions/custom-amounts/ios/CouponArt';

/**
 * iOS product/coupon card (Item Selector/SimpleProductCardView.swift + card constants). A
 * full-width row card: 112pt square image on the left, then name (bodyLarge bold, up to 2
 * lines) + a detail line (price / "Options available"), surfaceContainerLowest background
 * with the iOS card border + rounding. Variable products show a chevron and drill in.
 *
 * Pass `thumbnail` to override ProductImage (e.g. CouponThumbnail for coupon cards).
 * Pass `expired` to apply the disabled card background and muted text colors.
 *
 * Image data is the shared catalog (ProductImage is a data-driven renderer, not platform
 * chrome) — the store's products are the same on both platforms.
 */
export interface PosItemCardData {
  id: number;
  name: string;
  detail: string;
  variable?: boolean;
  thumbnail?: React.ReactNode;
  expired?: boolean;
  /** CouponCardView.accessibilityValue — read after the card's label (e.g. "Applied"). */
  accessibilityValue?: string;
}

export function PosItemCard({ item, onClick, titleVariant = 'bodyLarge', detailVariant = 'bodyLarge' }: { item: PosItemCardData; onClick: () => void; titleVariant?: 'bodyLarge' | 'bodyMedium'; detailVariant?: 'bodyLarge' | 'bodyMedium' | 'bodySmall' }) {
  const cardBg = item.expired ? 'var(--color-disabled-container)' : 'var(--color-surface-container-lowest)';
  const textColor = item.expired ? 'var(--color-on-disabled-container)' : 'var(--color-on-surface)';
  const detailColor = item.expired ? 'var(--color-on-disabled-container)' : 'var(--color-on-surface-variant-highest)';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-description={item.accessibilityValue || undefined}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
        minHeight: 112,
        background: cardBg,
        border: 'none',
        // iOS item cards use POSCornerRadiusStyle.medium (8px) — radius-md, not radius-lg.
        borderRadius: 'var(--radius-md)',
        // posItemCardBorderStyles() → posShadow(.medium).
        boxShadow: 'var(--pos-shadow-medium)',
        overflow: 'hidden',
        padding: 0,
        cursor: item.expired ? 'default' : 'pointer',
        textAlign: 'left',
        color: textColor,
        font: 'inherit',
      }}
    >
      <div style={{ width: 112, minHeight: 112, flex: 'none' }}>
        {item.thumbnail ?? <ProductImage id={item.id} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-xs)', padding: 'var(--space-sm) var(--space-md)' }}>
        <PosText variant={titleVariant} bold color={textColor} style={ELLIPSIS_2}>
          {item.name}
        </PosText>
        <PosText variant={detailVariant} color={detailColor} style={ELLIPSIS_1}>
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

/**
 * Coupon thumbnail (POSCouponImageView.swift): surfaceDim background, tag icon.
 * Normal: icon in onSurfaceVariantLowest. Expired: icon in onDisabledContainer.
 * Reuses the same shared `Tag` icon as the cart row (PosCartPane) instead of a
 * separately hand-drawn shape, so both places render identically.
 */
export function CouponThumbnail({ expired = false, applied = false }: { expired?: boolean; applied?: boolean }) {
  // POSCouponImageView.imageState: expired wins over applied; applied reuses the .success
  // colors (posSuccess fill / posOnSuccess glyph) but swaps the tag glyph for a checkmark.
  const tileColor = !expired && applied ? 'var(--color-success)' : 'var(--color-surface-dim)';
  const iconColor = expired
    ? 'var(--color-on-disabled-container)'
    : applied
      ? 'var(--color-on-success)'
      : 'var(--color-on-surface-variant-lowest)';
  const Glyph = !expired && applied ? Check : Tag;
  // Option 4 (Home tab): the coupon illustration instead of the tag glyph (the applied check stays).
  const art = useFlags().flags.customAmounts && useCustomAmountOption().option === 'option4' && (expired || !applied);
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 112, background: tileColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {art ? <CouponArt dim={expired} /> : <Glyph size="var(--icon-medium)" style={{ color: iconColor }} />}
    </div>
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
