import { useEffect, useRef, useState } from 'react';
import { useNav } from '../../device/platformNav';
import { Text } from '../../components/android/Text';
import { Spinner } from '../../components/android/Spinner';
import { ErrorScreen } from '../../components/android/ErrorScreen';
import { usePublishPreviewState } from '../../device/PreviewStateContext';
import { splashCopy, syncFailedCopy } from '../../mocks/android/eligibility';

/**
 * Flow 1 — Splash / eligibility gate (WooPosSplashScreen.kt).
 * The real screen auto-advances: Loading -> Syncing (catalog) -> Loaded (open home)
 * or NotEligible (open eligibility). Sync can also fail (transient or host-blocked).
 * Happy path here auto-runs and routes to /products (flow 2); the chrome preview-state
 * menu lets a reviewer inspect the other states, which are transient or backend-driven.
 */
type SplashState = 'loading' | 'syncing' | 'syncFailed' | 'syncFailedBlocked';

// Fill the device screen. Heights are definite (device-scroll has a fixed pixel height),
// so nested percentage heights and absolute centering resolve against the device, not the
// page.
const fill: React.CSSProperties = { height: '100%', position: 'relative' };

const centerFill: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function Splash() {
  const navigate = useNav();
  const [state, setState] = useState<SplashState>('loading');
  // false = user is driving via the preview menu; auto-advance is paused.
  const [autoDrive, setAutoDrive] = useState(true);

  usePublishPreviewState({
    options: [
      { id: 'loading', label: 'Loading' },
      { id: 'syncing', label: 'Syncing' },
      { id: 'syncFailed', label: 'Sync failed' },
      { id: 'syncFailedBlocked', label: 'Host blocked' },
      { id: 'notEligible', label: 'Not eligible →' },
    ],
    active: state,
    onSelect: (id) => {
      if (id === 'notEligible') {
        navigate('/eligibility');
        return;
      }
      setAutoDrive(false);
      setState(id as SplashState);
    },
  });

  return (
    <div style={fill}>
      {state === 'loading' && (
        <LoadingState autoDrive={autoDrive} onDone={() => autoDrive && setState('syncing')} />
      )}
      {state === 'syncing' && (
        <SyncingState
          autoDrive={autoDrive}
          onComplete={() => autoDrive && navigate('/products')}
        />
      )}
      {state === 'syncFailed' && (
        <ErrorScreen
          message={syncFailedCopy.transient.title}
          reason={syncFailedCopy.transient.message}
          primaryButton={{
            text: syncFailedCopy.transient.primaryButton,
            onClick: () => {
              setAutoDrive(true);
              setState('loading');
            },
          }}
          secondaryButton={{
            text: syncFailedCopy.exitButton,
            onClick: () => navigate('/flows'),
          }}
        />
      )}
      {state === 'syncFailedBlocked' && (
        <ErrorScreen
          message={syncFailedCopy.serverPermissions.title}
          reason={syncFailedCopy.serverPermissions.message}
          primaryButton={{
            text: syncFailedCopy.serverPermissions.primaryButton,
            onClick: () => navigate('/products'),
          }}
          secondaryButton={{
            text: syncFailedCopy.exitButton,
            onClick: () => navigate('/flows'),
          }}
        />
      )}
    </div>
  );
}

function LoadingState({ autoDrive, onDone }: { autoDrive: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!autoDrive) return;
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [autoDrive, onDone]);

  return (
    <div style={centerFill}>
      <Spinner size="var(--size-xlarge)" />
    </div>
  );
}

function SyncingState({
  autoDrive,
  onComplete,
}: {
  autoDrive: boolean;
  onComplete: () => void;
}) {
  const { sampleTotal } = splashCopy;
  // Start on "Preparing…", then animate progress up to the total, then complete.
  const [processed, setProcessed] = useState<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const prepare = setTimeout(() => setProcessed(splashCopy.sampleProcessed), 900);
    return () => clearTimeout(prepare);
  }, []);

  useEffect(() => {
    if (processed === null) return;
    if (processed >= sampleTotal) {
      if (autoDrive && !completedRef.current) {
        completedRef.current = true;
        const done = setTimeout(onComplete, 600);
        return () => clearTimeout(done);
      }
      return;
    }
    const step = setTimeout(() => {
      setProcessed((p) => Math.min(sampleTotal, (p ?? 0) + Math.ceil(sampleTotal / 18)));
    }, 130);
    return () => clearTimeout(step);
  }, [processed, sampleTotal, autoDrive, onComplete]);

  const progressText =
    processed === null
      ? splashCopy.preparing
      : splashCopy.progress(Math.min(processed, sampleTotal), sampleTotal);

  return (
    <div style={fill}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Spinner size="var(--size-xlarge)" />
        <div style={{ height: 'var(--space-xl)' }} />
        <Text variant="heading" bold align="center">
          {splashCopy.syncingTitle}
        </Text>
        <div style={{ height: 'var(--space-sm)' }} />
        <Text variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)">
          {progressText}
        </Text>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-xl)',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 var(--space-xl)',
        }}
      >
        <button
          type="button"
          onClick={onComplete}
          style={{
            background: 'none',
            border: 'none',
            padding: 'var(--space-sm)',
            textDecoration: 'underline',
          }}
        >
          <Text variant="bodySmall" color="var(--color-on-surface)">
            {splashCopy.exitButton}
          </Text>
        </button>
        <div style={{ height: 'var(--space-xs)' }} />
        <Text variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)">
          {splashCopy.hint}
        </Text>
        <Text
          variant="bodyMedium"
          align="center"
          color="var(--color-on-surface-variant-lowest)"
          style={{ marginTop: 'var(--space-xs)' }}
        >
          {splashCopy.subtitle}
        </Text>
      </div>
    </div>
  );
}
