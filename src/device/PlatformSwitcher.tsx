import { useLocation, useNavigate } from 'react-router-dom';
import { usePlatform, type PlatformId } from './PlatformContext';
import { mapRoute } from './flowParity';

/**
 * Segmented Android / iOS switcher. On toggle it flips the platform context and, using
 * FLOW_PARITY.md's mapping, navigates to the equivalent route on the target platform — or
 * that platform's home when the current flow has no confirmed equivalent yet (with a subtle
 * "not on <platform>" hint). Reuses the chrome `.segmented` styles.
 */
const OPTIONS: { id: PlatformId; label: string }[] = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
];

export function PlatformSwitcher() {
  const { platform, setPlatform } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();

  const other: PlatformId = platform === 'android' ? 'ios' : 'android';
  const otherMap = mapRoute(other, location.pathname);

  const switchTo = (target: PlatformId) => {
    if (target === platform) return;
    const dest = mapRoute(target, location.pathname);
    setPlatform(target);
    navigate(dest.path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
      <div className="segmented" role="group" aria-label="Platform">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={o.id === platform ? 'is-active' : ''}
            aria-pressed={o.id === platform}
            onClick={() => switchTo(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {!otherMap.available && (
        <span style={{ fontSize: 11, color: 'var(--menu-muted, var(--color-on-surface-variant-lowest))', textAlign: 'center' }}>
          Not on {other === 'ios' ? 'iOS' : 'Android'} — opens catalog
        </span>
      )}
    </div>
  );
}
