import { useEffect, useRef, useState } from 'react';
import { useNav } from '../../device/platformNav';
import { PosText } from '../../components/ios/PosText';
import { Spinner } from '../../components/ios/Spinner';
import { usePublishPreviewState } from '../../device/PreviewStateContext';
import { loadingCopy } from '../../mocks/ios/loading';

/**
 * POS loading / catalog-sync screen (PointOfSaleLoadingView.swift, presented via
 * PointOfSaleLoadingEntryPointView at app launch and by PointOfSaleDashboardView's `.loading`
 * state). Real behavior: plain spinner while app dependencies resolve, then — if the local
 * catalog needs syncing — the same spinner gains a title + item-count progress, an "Exit POS"
 * link, and a hint/subtitle, until the sync completes and the dashboard opens. Auto-runs here
 * and lands on /products; the chrome preview-state menu lets a reviewer inspect either state.
 */
type LoadingState = 'loading' | 'syncing';

const fill: React.CSSProperties = { height: '100%', position: 'relative', background: 'var(--color-surface)' };

export function Loading() {
  const navigate = useNav();
  const [state, setState] = useState<LoadingState>('loading');
  // false = user is driving via the preview menu; auto-advance is paused.
  const [autoDrive, setAutoDrive] = useState(true);

  usePublishPreviewState({
    options: [
      { id: 'loading', label: 'Loading' },
      { id: 'syncing', label: 'Syncing' },
    ],
    active: state,
    onSelect: (id) => {
      setAutoDrive(false);
      setState(id as LoadingState);
    },
  });

  return (
    <div style={fill}>
      {state === 'loading' && (
        <LoadingStep autoDrive={autoDrive} onDone={() => autoDrive && setState('syncing')} />
      )}
      {state === 'syncing' && (
        <SyncingStep autoDrive={autoDrive} onComplete={() => autoDrive && navigate('/products')} />
      )}
    </div>
  );
}

function LoadingStep({ autoDrive, onDone }: { autoDrive: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!autoDrive) return;
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [autoDrive, onDone]);

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size="108px" />
    </div>
  );
}

function SyncingStep({ autoDrive, onComplete }: { autoDrive: boolean; onComplete: () => void }) {
  const { sampleTotal } = loadingCopy;
  const [processed, setProcessed] = useState<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const prepare = setTimeout(() => setProcessed(loadingCopy.sampleProcessed), 900);
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
    processed === null ? loadingCopy.preparing : loadingCopy.progress(Math.min(processed, sampleTotal), sampleTotal);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Spinner size="108px" />
      <div style={{ height: 'var(--space-xl)' }} />
      <PosText variant="heading" bold align="center">
        {loadingCopy.syncingTitle}
      </PosText>
      <div style={{ height: 'var(--space-sm)' }} />
      <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)">
        {progressText}
      </PosText>

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
          style={{ background: 'none', border: 'none', padding: 'var(--space-sm)', textDecoration: 'underline', cursor: 'pointer' }}
        >
          <PosText variant="bodySmall" color="var(--color-on-surface)">
            {loadingCopy.exitButton}
          </PosText>
        </button>
        <div style={{ height: 'var(--space-xs)' }} />
        <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-lowest)">
          {loadingCopy.hint}
        </PosText>
        <PosText
          variant="bodyMedium"
          align="center"
          color="var(--color-on-surface-variant-lowest)"
          style={{ marginTop: 'var(--space-xs)' }}
        >
          {loadingCopy.subtitle}
        </PosText>
      </div>
    </div>
  );
}
