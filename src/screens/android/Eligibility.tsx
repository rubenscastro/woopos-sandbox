import { useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Button, OutlinedButton } from '../../components/android/Button';
import { ErrorX } from '../../components/android/icons';
import {
  eligibilityButtons,
  retryableIneligiblePreview,
} from '../../mocks/android/eligibility';

/**
 * Flow 1 — Eligibility screen (WooPosEligibilityScreen.kt). Shown when the splash check
 * finds the store can't run POS. Centered ErrorX + heading + suggestion; Retry + Exit POS.
 * Retry -> Loading state; on a real device it rechecks eligibility.
 */
export function Eligibility() {
  const navigate = useNav();
  const [loading, setLoading] = useState(false);

  const base = retryableIneligiblePreview;

  const onRetry = () => {
    setLoading(true);
    // Real app rechecks eligibility; here we just simulate the loading spinner, then
    // route into the app as if the check passed.
    setTimeout(() => navigate('/splash'), 1400);
  };

  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        padding: 'var(--space-lg)',
      }}
    >
      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: '0 var(--space-lg)',
        }}
      >
        <ErrorX size="var(--icon-xlarge)" />
        <div style={{ height: 'var(--space-lg)' }} />
        <Text variant="heading" align="center">
          {base.title}
        </Text>
        <div style={{ height: 'var(--space-md)' }} />
        <Text
          variant="bodyLarge"
          align="center"
          className="woopos-adaptive-content-width"
        >
          {base.suggestionText}
        </Text>
      </div>

      {/* Bottom button stack */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-lg)',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 var(--space-lg)',
          gap: 'var(--space-md)',
        }}
      >
        <div className="woopos-fullscreen-action">
          <Button
            text={eligibilityButtons.retry}
            fullWidth
            state={loading ? 'loading' : 'enabled'}
            onClick={onRetry}
          />
        </div>
        <div className="woopos-fullscreen-action">
          <OutlinedButton
            text={eligibilityButtons.exit}
            fullWidth
            onClick={() => navigate('/flows')}
          />
        </div>
      </div>
    </div>
  );
}
