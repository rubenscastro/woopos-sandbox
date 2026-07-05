import { Card } from './Card';
import { Text } from './Text';
import { ProductImage } from './ProductImage';
import { ChevronRight } from './icons';

/**
 * WooPosProductCard — the product row in the items list: square image (Large size) on the
 * left, name (body-lg bold, 1 line ellipsis) + a detail line below (price, or "Options
 * available" for variable products), and a chevron on the right for variable products.
 */
export interface ProductRowData {
  id: number;
  name: string;
  /** Price string for simple products / variations, e.g. "$10.00". */
  price?: string;
  imageUrl?: string;
  variable?: boolean;
  /** Second-line override (e.g. "Options available"); defaults to price. */
  detail?: string;
}

export function ProductListItem({
  product,
  onClick,
}: {
  product: ProductRowData;
  onClick: () => void;
}) {
  const detail = product.variable ? 'Options available' : (product.detail ?? product.price ?? '');
  return (
    <Card onClick={onClick} padding="0" ariaLabel={`${product.name}${product.price ? `, ${product.price}` : ''}`}>
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'var(--size-large)' }}>
        <div
          style={{
            width: 'var(--size-large)',
            minHeight: 'var(--size-large)',
            borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
            flex: 'none',
            overflow: 'hidden',
          }}
        >
          <ProductImage id={product.id} />
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
          <Text variant="bodyLarge" bold style={ELLIPSIS}>
            {product.name}
          </Text>
          {detail && (
            <Text variant="bodyLarge" color="var(--color-on-surface-variant-highest)" style={ELLIPSIS}>
              {detail}
            </Text>
          )}
        </div>

        {product.variable && (
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--space-lg)' }}>
            <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-highest)' }} />
          </div>
        )}
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
