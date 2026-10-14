import { Card } from '../../../android/Card';
import { Text } from '../../../android/Text';
import { useGeneralSettings } from '../../../../state/generalSettings';
import { useCustomAmountOption } from '../../../../state/customAmountOption';

/**
 * Custom amounts proposal — Android Settings → General. One card with the "Enable keypad"
 * switch; the whole row is the switch. Figma: POS Playground, node 4281-26572.
 */
export function GeneralPane() {
  const { keypadEnabled, setKeypadEnabled } = useGeneralSettings();
  // Option 1 gates custom amounts as a whole (no description); Option 2 gates the Keypad.
  const { option } = useCustomAmountOption();
  const keypad = option === 'option2';
  return (
    <Card padding="var(--space-md)">
      <button
        type="button"
        role="switch"
        aria-checked={keypadEnabled}
        onClick={() => setKeypadEnabled(!keypadEnabled)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', width: '100%', padding: 0, border: 'none', background: 'none', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
      >
        <div style={{ minWidth: 0 }}>
          <Text variant="bodyMedium">{keypad ? 'Enable keypad' : 'Enable custom amounts'}</Text>
          {keypad && (
            <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block', marginTop: 4 }}>
              Allows for custom amounts to be charged
            </Text>
          )}
        </div>
        <span
          aria-hidden
          style={{ width: 52, height: 32, borderRadius: 16, background: keypadEnabled ? 'var(--color-primary)' : 'var(--color-outline-variant)', position: 'relative', flex: 'none', display: 'block', transition: 'background 0.15s ease' }}
        >
          <span style={{ position: 'absolute', top: 4, left: keypadEnabled ? 24 : 4, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s ease' }} />
        </span>
      </button>
    </Card>
  );
}
