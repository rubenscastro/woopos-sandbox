import { Check } from './icons';
import './SuccessCheckmark.css';

/** WooPosSuccessCheckmark — a success-green circle that scales in with a checkmark. */
export function SuccessCheckmark() {
  return (
    <div className="woopos-success-check" style={{ background: 'var(--color-success)' }}>
      <Check size="var(--icon-xlarge)" style={{ color: 'var(--color-on-success)' }} />
    </div>
  );
}
