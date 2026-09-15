/**
 * Registry of prototype versions. The baseline keeps the id `main` (unprefixed routes,
 * `/android/*` + `/ios/*`) but is labelled **Trunk**, because that is what it tracks: the
 * flows currently on the iOS and Android trunks. It is the version flow-parity work is done
 * against — proposals fork off it and are not expected to match source.
 *
 * Every other entry is a proposal, routed under `/versions/<id>/android|ios/*` — see
 * VERSIONS.md for the full convention.
 */
export type VersionId = 'main' | 'scaling-pos-experience' | 'cash-reconciliation';

export interface VersionEntry {
  id: VersionId;
  label: string;
  description: string;
}

export const VERSIONS: VersionEntry[] = [
  {
    id: 'main',
    label: 'Trunk',
    description:
      'The flows currently on the iOS and Android trunks — the baseline flow parity is measured against. Proposals fork from here.',
  },
  {
    id: 'scaling-pos-experience',
    label: 'Scaling POS experience',
    description:
      'Proposal exploring how the POS experience holds up at scale (large catalogs, high order volume). Screens not yet forked here fall back to Trunk.',
  },
  {
    id: 'cash-reconciliation',
    label: 'Cash reconciliation',
    description:
      'Proposal exploring cash reconciliation (counting the drawer, shift open/close, over/short). A copy of Trunk — every screen falls back to Trunk until it is forked here.',
  },
];

/** Every version except the Trunk baseline — these get their own routed subtree. */
export const PROPOSAL_VERSIONS = VERSIONS.filter((v) => v.id !== 'main');
