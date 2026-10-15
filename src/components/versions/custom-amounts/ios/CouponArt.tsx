import couponArt from '../../../../assets/shared/home-tab/apply-coupon.svg';
import couponArtDark from '../../../../assets/shared/home-tab/apply-coupon-dark.svg';
import couponDisabled from '../../../../assets/shared/home-tab/coupon-disabled.svg';
import couponDisabledDark from '../../../../assets/shared/home-tab/coupon-disabled-dark.svg';
import { useIsDark } from '../../../../hooks/useIsDark';

/**
 * Option 4 (Home tab) — the coupon illustration (Figma SVG, native size) that stands in for the
 * tag glyph on coupon cards, in the Coupons list and in the cart.
 */
export function CouponArt({ dim, disabled }: { dim?: boolean; disabled?: boolean }) {
  // The dark artboard is the whole 60 × 60 illustration; the light one is the trimmed piece, which
  // is the same drawing at the same size once centred.
  const isDark = useIsDark();
  // The greyscale drawing (whole 60 × 60 artboard) for a disabled tile.
  if (disabled) return <img src={isDark ? couponDisabledDark : couponDisabled} alt="" aria-hidden style={{ width: 60, height: 60, flex: 'none' }} />;
  return isDark
    ? <img src={couponArtDark} alt="" aria-hidden style={{ width: 60, height: 60, flex: 'none', opacity: dim ? 0.4 : 1 }} />
    : <img src={couponArt} alt="" aria-hidden style={{ width: 54.5451, height: 50.4547, flex: 'none', opacity: dim ? 0.4 : 1 }} />;
}
