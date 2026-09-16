/**
 * Registry of prototype versions. The baseline keeps the id `main` (unprefixed routes,
 * `/android/*` + `/ios/*`) but is labelled **Trunk**, because that is what it tracks: the
 * flows currently on the iOS and Android trunks. It is the version flow-parity work is done
 * against — proposals fork off it and are not expected to match source.
 *
 * Every other entry is a proposal, routed under `/versions/<id>/android|ios/*` — see
 * VERSIONS.md for the full convention.
 */
import type { FlagId } from '../state/flags';
import type { PlatformId } from '../device/PlatformContext';

export type VersionId = 'main' | 'scaling-pos-experience' | 'cash-reconciliation';

export interface VersionEntry {
  id: VersionId;
  label: string;
  description: string;
  /**
   * Feature flags this version runs with, overriding production defaults (see
   * `src/state/flags.ts`). A proposal that exists to explore what a flag enables should turn
   * it on here rather than expecting the reviewer to flip it by hand every session. Flags are
   * held per version, so this never leaks into Trunk.
   */
  flagDefaults?: Partial<Record<FlagId, boolean>>;
  /**
   * The platforms this version is built for. Omit for both.
   *
   * A proposal exploring one platform declares it here, and the other platform stops existing
   * for that version: its routes aren't generated and the Platform switcher is hidden. Without
   * this, the unbuilt side still routes — and shows Trunk's screens back, which reads as "this
   * proposal looks identical over here" rather than "this proposal isn't about that platform".
   */
  platforms?: PlatformId[];
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
    // Reconciliation is per-operator work — who counted, who closed the shift — so this
    // proposal runs with POS roles on.
    flagDefaults: { roles: true },
    // Explored on iOS only — the cash drawer flows are built against the iOS designs.
    platforms: ['ios'],
  },
];

/** Every version except the Trunk baseline — these get their own routed subtree. */
export const PROPOSAL_VERSIONS = VERSIONS.filter((v) => v.id !== 'main');

/** The platforms a version is built for — both, unless it says otherwise. */
export function versionPlatforms(version: VersionId): PlatformId[] {
  return VERSIONS.find((v) => v.id === version)?.platforms ?? ['android', 'ios'];
}

/**
 * The platform a version is pinned to, or `null` when it has both. Routing clamps to this, so
 * arriving from the other platform lands somewhere that exists rather than on a dead route.
 */
export function pinnedPlatform(version: VersionId): PlatformId | null {
  const platforms = versionPlatforms(version);
  return platforms.length === 1 ? platforms[0] : null;
}
