import { Card } from './Card';
import { Text } from './Text';
import { Tag } from './icons';

/**
 * WooPosCouponCard — same row pattern as products but with a tag icon instead of an image.
 * Expired coupons dim to disabledContainer and are not clickable.
 */
export interface CouponRowData {
  id: number;
  code: string;
  summary: string;
  expiredOn?: string; // formatted date if expired
}

export function CouponCard({ coupon, onClick }: { coupon: CouponRowData; onClick: () => void }) {
  const expired = Boolean(coupon.expiredOn);
  const textColor = expired ? 'var(--color-on-disabled-container)' : 'var(--color-on-surface)';
  const subColor = expired
    ? 'var(--color-on-disabled-container)'
    : 'var(--color-on-surface-variant-highest)';

  return (
    <Card
      onClick={expired ? undefined : onClick}
      disabled={expired}
      padding="0"
      ariaLabel={`Coupon ${coupon.code}, ${coupon.summary}`}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'var(--size-large)' }}>
        <div
          style={{
            width: 'var(--size-large)',
            minHeight: 'var(--size-large)',
            background: 'var(--color-surface-dim)',
            borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Tag size="var(--icon-large)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
            padding: '0 var(--space-md)',
          }}
        >
          <Text variant="bodyLarge" bold color={textColor} style={ELLIPSIS}>
            {coupon.code}
          </Text>
          <Text variant="bodyLarge" color={subColor} style={ELLIPSIS}>
            {coupon.summary}
          </Text>
          {coupon.expiredOn && (
            <Text variant="bodySmall" color={subColor}>
              Expired on {coupon.expiredOn}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}

const ELLIPSIS = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  display: 'block' as const,
};
