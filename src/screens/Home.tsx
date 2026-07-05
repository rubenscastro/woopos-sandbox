import { Link } from 'react-router-dom';
import { Text } from '../components/Text';
import { ChevronRight } from '../components/icons';
import { flowGroups } from '../flows';

/**
 * Prototype index — not a real WooPOS screen. Lists every flow from FLOWS.md so the
 * whole prototype is navigable from one entry point. Built flows link out; the rest
 * are shown disabled until their route exists.
 */
export function Home() {
  return (
    <div
      style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-lg) var(--space-xxxl)',
      }}
    >
      <div style={{ padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <Text variant="heading" bold as="h1">
          WooPOS prototype
        </Text>
        <div style={{ height: 'var(--space-sm)' }} />
        <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)">
          Clickable recreations of WooCommerce POS flows. Pick a flow to open it.
        </Text>
      </div>

      {flowGroups.map((group) => (
        <section key={group.priority} style={{ marginTop: 'var(--space-xl)' }}>
          <Text
            variant="bodySmall"
            bold
            as="h2"
            color="var(--color-on-surface-variant-highest)"
            style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            {group.priority}
          </Text>
          <div
            style={{
              marginTop: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}
          >
            {group.flows.map((flow) => {
              const inner = (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: flow.built
                        ? 'var(--color-primary)'
                        : 'var(--color-default)',
                      color: flow.built
                        ? 'var(--color-on-primary)'
                        : 'var(--color-on-default)',
                      fontWeight: 700,
                    }}
                  >
                    {flow.num}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyMedium" bold>
                      {flow.title}
                    </Text>
                    <Text
                      variant="caption"
                      color="var(--color-on-surface-variant-highest)"
                      style={{ display: 'block' }}
                    >
                      {flow.description}
                    </Text>
                  </div>
                  {flow.built ? (
                    <ChevronRight
                      size="var(--icon-small)"
                      style={{ color: 'var(--color-on-surface-variant-lowest)' }}
                    />
                  ) : (
                    <Text
                      variant="caption"
                      color="var(--color-on-surface-variant-lowest)"
                    >
                      soon
                    </Text>
                  )}
                </>
              );

              const rowStyle: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-container-lowest)',
                boxShadow: 'var(--shadow-soft-medium)',
                textDecoration: 'none',
                color: 'var(--color-on-surface)',
                opacity: flow.built ? 1 : 0.55,
              };

              return flow.built && flow.path ? (
                <Link key={flow.num} to={flow.path} style={rowStyle}>
                  {inner}
                </Link>
              ) : (
                <div key={flow.num} style={{ ...rowStyle, cursor: 'default' }}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
