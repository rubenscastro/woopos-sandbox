/**
 * Feature-flag definitions, split out from `FlagsContext` so the version registry can declare
 * per-version defaults without the two modules importing each other.
 *
 * These mirror the iOS POS FeatureFlag gates so we can preview behaviour both on and off.
 * Only the flags we actually wire up are listed.
 */
export type FlagId = 'roles';

export const FLAG_DEFS: { id: FlagId; label: string; description: string }[] = [
  // pointOfSaleRoles — signed-in operator + capability gating. Off by default in production.
  { id: 'roles', label: 'POS roles', description: 'Signed-in operator & role gating' },
];

/** Production defaults — what a version gets unless it overrides them (see registry.ts). */
export const FLAG_DEFAULTS: Record<FlagId, boolean> = { roles: false };
