/**
 * Registry of prototype versions. `main` is the current shipped WooPOS flows (unprefixed
 * routes, `/android/*` + `/ios/*`). Every other entry is a proposal, routed under
 * `/versions/<id>/android|ios/*` — see VERSIONS.md for the full convention.
 */
export type VersionId = 'main' | 'scaling-pos-experience';

export interface VersionEntry {
  id: VersionId;
  label: string;
  description: string;
}

export const VERSIONS: VersionEntry[] = [
  {
    id: 'main',
    label: 'Main',
    description: 'Current WooPOS flows — the shipped baseline.',
  },
  {
    id: 'scaling-pos-experience',
    label: 'Scaling POS experience',
    description:
      'Proposal exploring how the POS experience holds up at scale (large catalogs, high order volume). Screens not yet forked here fall back to Main.',
  },
];

/** Every version except the baseline — these get their own routed subtree. */
export const PROPOSAL_VERSIONS = VERSIONS.filter((v) => v.id !== 'main');
