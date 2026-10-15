import { Card } from '../../../android/Card';
import { Text } from '../../../android/Text';
import { useGeneralSettings } from '../../../../state/generalSettings';
import { useCustomAmountOption, hasKeypad } from '../../../../state/customAmountOption';

/**
 * Custom amounts proposal — Android Settings → General. One card with the "Enable keypad"
 * switch; the whole row is the switch. Figma: POS Playground, node 4281-26572.
 */
export function GeneralPane() {
  const { keypadEnabled, setKeypadEnabled, taxableByDefault, setTaxableByDefault } = useGeneralSettings();
  // Option 1 gates custom amounts as a whole (no description); Option 2 gates the Keypad.
  const { option } = useCustomAmountOption();
  const keypad = hasKeypad(option);
  // Option 4 swaps the switch: it is no longer about enabling custom amounts but about taxes.
  const taxes = option === 'option4';
  const on = taxes ? taxableByDefault : keypadEnabled;
  return (
    <Card padding="var(--space-md)">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => (taxes ? setTaxableByDefault(!taxableByDefault) : setKeypadEnabled(!keypadEnabled))}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', width: '100%', padding: 0, border: 'none', background: 'none', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyLarge" bold>{taxes ? 'Custom amounts are taxable by default' : keypad ? 'Enable keypad' : 'Enable custom amounts'}</Text>
          {(keypad || taxes) && (
            <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 2 }}>
              {taxes ? 'You can still change this for each custom amount.' : 'Allows for custom amounts to be charged'}
            </Text>
          )}
        </div>
        <span
          aria-hidden
          style={{ width: 52, height: 32, borderRadius: 16, background: on ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none', display: 'block', transition: 'background 0.15s ease' }}
        >
          <span style={{ position: 'absolute', top: 4, left: on ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
        </span>
      </button>
    </Card>
  );
}
