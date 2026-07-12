import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlatform } from './PlatformContext';
import { useVersion } from '../versions/VersionContext';
import { VERSIONS, type VersionId } from '../versions/registry';
import { mapVersion } from '../versions/routing';
import { useClickOutside } from '../hooks/useClickOutside';
import { Check } from '../components/android/icons';

/**
 * Version dropdown — switches between `main` and proposal versions (see registry.ts),
 * staying on the same platform and, where possible, the same screen (falling back to the
 * product catalog when the target version has no route for the current slug).
 */
export function VersionSwitcher() {
  const { version, setVersion } = useVersion();
  const { platform } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const current = VERSIONS.find((v) => v.id === version) ?? VERSIONS[0];

  const switchTo = (targetId: VersionId) => {
    setOpen(false);
    if (targetId === version) return;
    const dest = mapVersion(targetId, platform, location.pathname);
    setVersion(targetId);
    navigate(dest.path);
  };

  return (
    <div className="chrome-menu" ref={menuRef}>
      <span className="chrome-menu__label">Version</span>
      <button type="button" className="chrome-menu__trigger" onClick={() => setOpen((o) => !o)}>
        {current.label}
        <span className="chrome-menu__caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="chrome-menu__dropdown" style={{ minWidth: 260 }}>
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`chrome-menu__item${v.id === version ? ' is-active' : ''}`}
              onClick={() => switchTo(v.id)}
              title={v.description}
            >
              {v.id === version && <Check size="16px" />}
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
