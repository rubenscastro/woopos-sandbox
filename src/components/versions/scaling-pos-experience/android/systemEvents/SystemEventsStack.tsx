import type { ReactNode } from 'react';
import { Card } from '../../../../android/Card';
import { Text } from '../../../../android/Text';
import { Spinner } from '../../../../android/Spinner';
import { Card as ReaderIcon, Printer, Barcode as ScannerIcon, Globe, Grid, Close } from '../../../../android/icons';
import { useNav } from '../../../../../device/platformNav';
import type { SystemEventDef, SystemEventIcon, SystemEventTone } from '../../../../../mocks/versions/scaling-pos-experience/systemEvents';
import { useSystemEvents } from './SystemEventsContext';
import { useAnimatedList, SLIDE_TRANSITION_MS } from './useAnimatedList';

/**
 * New pattern, not yet in DESIGN.md — see VERSIONS.md. Two card variants per the reference:
 * a compact dot-status card for transient pings (auto-dismiss), and a list-row card with an
 * action + Dismiss link for persistent issues. Both reuse WooPosCard's normal-shadow style.
 */
const ICONS: Record<SystemEventIcon, React.ComponentType<{ size?: string }>> = {
  reader: ReaderIcon,
  printer: Printer,
  scanner: ScannerIcon,
  connectivity: Globe,
  catalog: Grid,
};

const TONE_COLOR: Record<SystemEventTone, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-alert)',
};

/** Where tapping a notification should land — only card reader (→ hardware) and catalog
 *  sync (→ product catalog) events are clickable; the rest have nowhere obvious to send you. */
function settingsPathForIcon(icon: SystemEventIcon): string | null {
  if (icon === 'reader') return '/settings-hardware';
  if (icon === 'catalog') return '/settings-catalog';
  return null;
}

function EventIcon({ icon, dot, loading }: { icon: SystemEventIcon; dot?: SystemEventTone; loading?: boolean }) {
  const Glyph = ICONS[icon];
  return (
    <div style={{ position: 'relative', flex: 'none' }}>
      <div
        style={{
          width: 'var(--size-xxsmall)',
          height: 'var(--size-xxsmall)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface-container-low)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-on-surface-variant-highest)',
        }}
      >
        {loading ? <Spinner size="var(--icon-small)" /> : <Glyph size="var(--icon-small)" />}
      </div>
      {dot && !loading && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: TONE_COLOR[dot],
            border: '2px solid var(--color-surface-container-lowest)',
          }}
        />
      )}
    </div>
  );
}

/** Compact status card — the transient toast (replaces the old reader-status pill 1:1 in
 *  size/position, generalized to any hardware/connectivity event). Single line of text
 *  throughout: `phase: 'loading'` (only ever set for startup events, see
 *  SystemEventsContext.fireStartup) shows a spinner + the action-verb `loadingLabel`; once
 *  "shown" it swaps to the icon/dot + `title` alone, same regular-weight styling — no
 *  subtitle, kept deliberately simple. */
function TransientEventCard({ def, phase, onOpen }: { def: SystemEventDef; phase: 'loading' | 'shown'; onOpen?: () => void }) {
  const loading = phase === 'loading' && Boolean(def.loadingLabel);
  return (
    <Card padding="0" shadow="normal" onClick={onOpen}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          // Fixed to the same height as the floating menu button next to it (var(--size-small))
          // rather than letting padding + content set the height — horizontal padding only,
          // content is vertically centered same as the button's icon.
          height: 'var(--size-small)',
          padding: '0 var(--space-md)',
          minWidth: 300,
        }}
      >
        <EventIcon icon={def.icon} dot={def.tone} loading={loading} />
        <Text variant="bodyMedium">{loading ? def.loadingLabel : def.title}</Text>
      </div>
    </Card>
  );
}

/** List-row card for persistent events — stays until dismissed or resolved, so it carries an
 *  action (e.g. "Retry") alongside a dismiss control rather than a status dot.
 *
 *  `variant="floating"` (tablet) keeps the rounded, inset WooPosCard treatment with a text
 *  "Dismiss" link. `variant="banner"` (phone) renders edge-to-edge with no radius/margins —
 *  see SystemEventsBanner — and swaps the text link for an icon-only close button. */
function PersistentEventCard({
  def,
  onAction,
  onDismiss,
  onOpen,
  variant = 'floating',
}: {
  def: SystemEventDef;
  onAction: () => void;
  onDismiss: () => void;
  onOpen?: () => void;
  variant?: 'floating' | 'banner';
}) {
  const iconAndText = (
    <>
      <EventIcon icon={def.icon} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
        <Text variant="bodyMedium" bold>
          {def.title}
        </Text>
        <Text variant="bodySmall" color="var(--color-on-surface-variant-highest)">
          {def.subtitle}
        </Text>
      </div>
    </>
  );

  const content = (
    // Outer gap (space-lg) separates the icon+text group from the actions — wider than the
    // icon-to-text gap (space-md) inside that group, per the "more room before the actions"
    // spacing request. On tablet ("floating"), height is fixed to match the menu button next
    // to it, same as TransientEventCard; the phone banner stays content-sized (no button to match).
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        height: variant === 'floating' ? 'var(--size-small)' : undefined,
        padding: variant === 'floating' ? '0 var(--space-md)' : 'var(--space-md)',
      }}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            minWidth: 0,
            flex: 1,
            border: 'none',
            background: 'none',
            padding: 0,
            textAlign: 'left',
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          {iconAndText}
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', minWidth: 0, flex: 1 }}>
          {iconAndText}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 'none' }}>
        {def.actionLabel && (
          <LinkButton label={def.actionLabel} color="var(--color-primary)" onClick={onAction} />
        )}
        {variant === 'banner' ? (
          <IconButton ariaLabel="Dismiss" onClick={onDismiss} />
        ) : (
          <LinkButton label="Dismiss" color="var(--color-on-surface-variant-highest)" onClick={onDismiss} />
        )}
      </div>
    </div>
  );

  if (variant === 'banner') {
    return (
      <div style={{ background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-normal-medium)' }}>
        {content}
      </div>
    );
  }

  return (
    <Card padding="0" shadow="normal">
      {content}
    </Card>
  );
}

function LinkButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
      <Text variant="bodySmall" bold color={color}>
        {label}
      </Text>
    </button>
  );
}

function IconButton({ ariaLabel, onClick }: { ariaLabel: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'none',
        padding: 0,
        color: 'var(--color-on-surface-variant-highest)',
        cursor: 'pointer',
      }}
    >
      <Close size="var(--icon-small)" />
    </button>
  );
}

/** Slides up from the bottom on enter, back down to the bottom on exit — driven by
 *  `useAnimatedList`'s phase rather than instant mount/unmount, per notification. Move only,
 *  no opacity fade. */
function SlideTransition({ phase, children }: { phase: 'entering' | 'visible' | 'leaving'; children: ReactNode }) {
  const hidden = phase !== 'visible';
  return (
    <div
      style={{
        transform: hidden ? 'translateY(28px)' : 'translateY(0)',
        transition: `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
      }}
    >
      {children}
    </div>
  );
}

type FloatingSlot =
  | { kind: 'transient'; def: SystemEventDef; contentPhase: 'loading' | 'shown' }
  | { kind: 'persistent'; def: SystemEventDef };

/** Tablet placement — docks in the bottom-left floating cluster (FloatingToolbar's
 *  `statusSlot`), where the old always-on reader-status pill used to live. Only ever shows a
 *  single notification at a time (the queue head); the next one slides in from the bottom
 *  once the current one has slid out. */
export function SystemEventsFloating() {
  const { current, dismissCurrent, resolveCurrent } = useSystemEvents();
  const navigate = useNav();

  const items: { key: string; value: FloatingSlot }[] = current
    ? [
        {
          key: `${current.kind}:${current.instanceId}`,
          value:
            current.kind === 'transient'
              ? { kind: 'transient', def: current.def, contentPhase: current.phase }
              : { kind: 'persistent', def: current.def },
        },
      ]
    : [];
  const slots = useAnimatedList(items);

  if (slots.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {slots.map(({ key, value, phase }) => {
        const settingsPath = settingsPathForIcon(value.def.icon);
        const onOpen = settingsPath ? () => navigate(settingsPath) : undefined;
        return (
          <SlideTransition key={key} phase={phase}>
            {value.kind === 'transient' ? (
              <TransientEventCard def={value.def} phase={value.contentPhase} onOpen={onOpen} />
            ) : (
              <PersistentEventCard
                def={value.def}
                onAction={resolveCurrent}
                onDismiss={dismissCurrent}
                onOpen={onOpen}
              />
            )}
          </SlideTransition>
        );
      })}
    </div>
  );
}

/** Phone placement — persistent banners only (no transient pings, no reserved space when
 *  idle), pinned to the top of the screen in normal flow so they push page content down
 *  rather than floating over it. Edge-to-edge, no radius — pulled up over the top safe-area
 *  (same `margin-top`/`padding-top` trick as `.woopos-fills-safe-top`, see utilities.css) so
 *  its background reaches the true top of the phone instead of leaving a gap under the notch. */
export function SystemEventsBanner() {
  const { current, dismissCurrent, resolveCurrent } = useSystemEvents();
  const navigate = useNav();

  // Phone only ever queues persistent banners (transients never enqueue on phone), and shows
  // one at a time. Guard on kind anyway so a stray transient could never render here.
  if (!current || current.kind !== 'persistent') return null;

  const settingsPath = settingsPathForIcon(current.def.icon);
  const onOpen = settingsPath ? () => navigate(settingsPath) : undefined;

  return (
    <div
      style={{
        marginTop: 'calc(-1 * var(--device-safe-top, 0px))',
        paddingTop: 'var(--device-safe-top, 0px)',
      }}
    >
      <PersistentEventCard
        def={current.def}
        variant="banner"
        onAction={resolveCurrent}
        onDismiss={dismissCurrent}
        onOpen={onOpen}
      />
    </div>
  );
}
