import { Link } from 'react-router-dom';
import { PosText } from '../../components/ios/PosText';
import { ChevronRight } from '../../components/android/icons';
import { PlatformSwitcher } from '../../device/PlatformSwitcher';
import { usePlatform } from '../../device/PlatformContext';
import { platformPath } from '../../device/platformNav';
import { flowGroups } from '../../flows.ios';

/**
 * iOS platform home / index. Lists the iOS flows built so far (FLOWS.ios.md), and carries the
 * PlatformSwitcher so it's never a dead end. Grows as iOS flows land.
 */
export function IosHome() {
  const { platform } = usePlatform();
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: 'var(--space-xl) var(--space-lg) var(--space-xxxl)' }}>
      <div style={{ padding: 'var(--space-lg) 0 var(--space-md)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-lg)' }}>
        <div>
          <PosText variant="heading" bold as="h1">
            WooPOS prototype — iOS
          </PosText>
          <div style={{ height: 'var(--space-sm)' }} />
          <PosText variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
            Clickable recreations of the iOS POS flows, built one at a time from FLOWS.ios.md.
          </PosText>
        </div>
        <PlatformSwitcher />
      </div>

      {flowGroups.map((group) => (
        <section key={group.priority} style={{ marginTop: 'var(--space-xl)' }}>
          <PosText variant="bodySmall" bold as="h2" color="var(--color-on-surface-variant-highest)" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {group.priority}
          </PosText>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {group.flows.map((flow) => {
              const rowStyle: React.CSSProperties = {
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-soft-medium)',
                textDecoration: 'none', color: 'var(--color-on-surface)', opacity: flow.built ? 1 : 0.55,
              };
              const inner = (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40, height: 40, borderRadius: 'var(--radius-md)', background: flow.built ? 'var(--color-primary)' : 'var(--color-default)', color: flow.built ? 'var(--color-on-primary)' : 'var(--color-on-default)', fontWeight: 700 }}>
                    {flow.num}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <PosText variant="bodyMedium" bold>{flow.title}</PosText>
                    <PosText variant="caption" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
                      {flow.description}
                    </PosText>
                  </div>
                  {flow.built ? (
                    <ChevronRight size="var(--icon-small)" style={{ color: 'var(--color-on-surface-variant-lowest)' }} />
                  ) : (
                    <PosText variant="caption" color="var(--color-on-surface-variant-lowest)">soon</PosText>
                  )}
                </>
              );
              return flow.built && flow.path ? (
                <Link key={flow.num} to={platformPath(platform, flow.path)} style={rowStyle}>{inner}</Link>
              ) : (
                <div key={flow.num} style={{ ...rowStyle, cursor: 'default' }}>{inner}</div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
