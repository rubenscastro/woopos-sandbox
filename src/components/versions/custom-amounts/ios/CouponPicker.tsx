import { PosText } from '../../../ios/PosText';
import { coupons } from '../../../../mocks/android/coupons';
import { AddedBadge } from './AddedBadge';
import { CouponArt } from './CouponArt';
import checkedBox from '../../../../assets/shared/home-tab/checkbox-checked.svg';

/**
 * Option 4 (Home tab) — iOS "Add tile" → Coupons. The Coupons tab's own coupons (same data), each a
 * card with the coupon illustration, its code and summary, and a checkbox. Expired coupons and the
 * ones already on the home page are listed disabled, like Products; selection keys are `c:<id>`.
 * Not in Figma yet — it follows the Products rows.
 */
export function CouponPicker({ selected, onChange, onHome }: { selected: string[]; onChange: (next: string[]) => void; onHome: string[] }) {
  return (
    <>
      {coupons.map((c) => {
        const key = `c:${c.id}`;
        const expired = Boolean(c.expiredOn);
        const onPage = onHome.includes(key);
        const disabled = expired || onPage;
        const on = selected.includes(key);
        const muted = 'var(--color-on-disabled-container)';
        return (
          <button
            key={c.id}
            type="button"
            role="checkbox"
            aria-checked={on || onPage}
            disabled={disabled}
            onClick={() => onChange(on ? selected.filter((k) => k !== key) : [...selected, key])}
            style={{ flex: 'none', display: 'flex', alignItems: 'stretch', width: '100%', padding: 0, overflow: 'hidden', cursor: disabled ? 'default' : 'pointer', textAlign: 'left', font: 'inherit', color: 'var(--color-on-surface)', background: 'transparent', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-soft-medium)', position: 'relative', border: 'none' }}
          >
            <div style={{ width: 112, height: 112, flex: 'none', background: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CouponArt disabled={disabled} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg) var(--space-md) var(--space-md)', background: disabled ? 'var(--color-surface-dim)' : 'var(--color-surface-bright)' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <PosText variant="bodyMedium" bold color={disabled ? muted : undefined}>{c.code}</PosText>
                <PosText variant="bodyMedium" color={disabled ? muted : 'var(--color-on-surface-variant-lowest)'}>{expired ? `Expired ${c.expiredOn}` : c.summary}</PosText>
              </div>
              {disabled
                ? onPage ? <AddedBadge /> : null
                : on
                    ? <img src={checkedBox} alt="" aria-hidden style={{ width: 32, height: 32, flex: 'none' }} />
                    : <span aria-hidden style={{ width: 32, height: 32, flex: 'none', boxSizing: 'border-box', border: '2px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)' }} />}
            </div>
            {on && <span aria-hidden style={{ position: 'absolute', inset: 0, border: '3px solid var(--color-primary)', borderRadius: 'var(--radius-md)', pointerEvents: 'none' }} />}
          </button>
        );
      })}
    </>
  );
}
