import { PosText } from '../../../ios/PosText';

/** Info badge (POS Design System, Figma node 2718-3863): marks a tile that is already on the home page. */
export function AddedBadge() {
  return (
    <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 4, background: 'var(--color-info-lowest)' }}>
      <PosText variant="caption" color="var(--color-on-info-lowest)">Added</PosText>
    </span>
  );
}
