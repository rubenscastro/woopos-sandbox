import { Text } from '../../../android/Text';

/**
 * Custom amounts proposal — Android's "discard changes?" dialog: a Material alert, the way the
 * system draws one (surface card, large radius, headline, supporting text, text buttons at the
 * end), over a scrim. Shown by UnsavedChangesHost when leaving the custom amount with changes.
 */
export function DiscardDialog({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  return (
    <div role="presentation" style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.32)' }}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Discard changes?"
        style={{ width: 'min(312px, calc(100% - 48px))', boxSizing: 'border-box', background: 'var(--color-surface-container-low)', borderRadius: 28, padding: 24, boxShadow: 'var(--shadow-normal-large)', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Text variant="heading" style={{ fontSize: 24, lineHeight: '32px' }}>Discard changes?</Text>
        <Text variant="bodyMedium" color="var(--color-on-surface-variant-highest)" style={{ display: 'block' }}>
          You have unsaved changes to this custom amount. If you leave now, they will be lost.
        </Text>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <TextButton label="Keep editing" onClick={onKeep} />
          <TextButton label="Discard" onClick={onDiscard} />
        </div>
      </div>
    </div>
  );
}

function TextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 'none', background: 'transparent', padding: '10px 12px', borderRadius: 20, cursor: 'pointer', color: 'var(--color-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-body-md-size)', fontWeight: 500 }}>
      {label}
    </button>
  );
}
