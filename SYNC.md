# Syncing from source

How to pull the latest `woocommerce-android` / `woocommerce-ios` trunk and find what
changed relative to what the prototype has built. The output of a sync is an updated
**Source sync log** in `FLOW_PARITY.md` (new pinned SHAs + a delta table), plus updates to
any doc a delta invalidates.

## The local clones

| Repo | Path | Shape |
|---|---|---|
| `woocommerce-android` | `/Users/automattic/Projects Local/pos-base-prototype/woocommerce-android` | Shallow (`--depth 1`), `blob:none`, sparse: `ui/woopos`, `ui/compose/theme`, `res/values/strings.xml`. On branch `trunk`. |
| `woocommerce-ios` | `/Users/Shared/Projects/automattic/woocommerce-ios` | Full clone (not shallow, not sparse). On branch `trunk`. |

Do **not** sync from these lookalikes:

- `/Users/Shared/Projects/automattic/woocommerce` — WooCommerce **core** (web), unrelated.
- `/Users/automattic/Projects Local/woocommerce-android` — a personal fork checkout used
  for PR work, sitting on a feature branch; not the sync baseline.

## Baseline

The previous sync's pinned SHAs live in the newest dated section of `FLOW_PARITY.md` →
"Source sync log" ("### DATE … Synced — `woocommerce-android` @ `SHA` …"). Everything on
trunk after those SHAs is the new window. Both clones' worktrees are normally checked out at the
pinned SHAs, so during analysis: **disk = old pin**, `git show origin/trunk:<path>` = new.

## Procedure

### 1. Fetch

```
# iOS (full clone — plain fetch)
git -C /Users/Shared/Projects/automattic/woocommerce-ios fetch origin trunk

# Android (shallow clone — must deepen far enough to connect old pin to new tip,
# or `git log old..new` finds no merge base; use a date a few days before the old pin)
git -C "/Users/automattic/Projects Local/pos-base-prototype/woocommerce-android" \
  fetch --shallow-since=<old-pin-date minus ~5 days> origin trunk
```

Record the new tips: `git rev-parse --short origin/trunk` and
`git log -1 --format='%ci' origin/trunk` in each repo.

### 2. Diff the window

Android — scope to the POS module, POS strings, and assets:

```
git log --oneline --no-merges <old-pin>..origin/trunk -- WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos
git diff --name-status <old-pin> origin/trunk -- WooCommerce/src/main/kotlin/com/woocommerce/android/ui/woopos
git diff <old-pin> origin/trunk -- WooCommerce/src/main/res/values/strings.xml   # look at woopos_* keys
git diff --name-status <old-pin> origin/trunk -- 'WooCommerce/src/main/res/drawable*' WooCommerce/src/main/res/raw
```

The sparse checkout excludes `res/drawable`/`res/raw`, so changed assets show in
`--name-status` but aren't on disk — read one with `git show origin/trunk:<path>` (blobs
fetch lazily over the network) or widen the sparse checkout.

iOS — scope to the PointOfSale module (which includes `Resources/Images.xcassets` and
`Colors/POSColorPalette.xcassets`) and the POS networking models:

```
git log --oneline --no-merges <old-pin>..origin/trunk -- Modules/Sources/PointOfSale Modules/Sources/Networking/Model/POS
git diff --name-status <old-pin> origin/trunk -- Modules/Sources/PointOfSale Modules/Sources/Networking/Model/POS
```

### 3. Classify deltas

Most commits are plumbing — analytics/Tracks, crash fixes, R8/Gson, refactors, feature-flag
removals, comment churn. A delta matters to the prototype only if it's **user-visible**:
new screens/states, changed copy, layout, colors/tokens, icons/illustrations, or
interaction behavior a designer would notice.

For each candidate, read the actual change (`git show origin/trunk:<path>`, `git log -p`),
and get ground-truth states/copy from the `@Preview` composables (Android, bottom of each
`*Screen.kt`) or `PreviewHelpers.swift` / `#Preview` blocks (iOS). Quote exact copy in the
log — the delta table is what gets built from later, often without re-reading source.

Fanning the two repos out to one read-only agent each works well; give each the pin range,
scope paths, and the changed-file list, and ask for user-visible deltas with exact copy vs.
one-line "plumbing only" verdicts.

### 4. Compare against the prototype and update docs

For each user-visible delta, check whether the prototype already has it (screens live in
`src/screens/<platform>/`, components in `src/components/<platform>/`), then update:

- **`FLOW_PARITY.md` → Source sync log** — always. Add a new dated section *above* the
  previous one: new pinned SHAs + date, then a `| Delta | Platforms | Status |` table
  (Status: `✅ Built at <route>` / `Already built` / `Not built` / `N/A — never built`).
  Keep old sections as history. Also note whether illustrations/assets changed.
- **`FLOW_PARITY.md` parity table** — only rows whose verified claims changed; stamp the
  note with the new sync date.
- **`FLOWS.md` / `FLOWS.ios.md`** — if a flow was added/removed/renamed in source.
- **`DESIGN.md` / `DESIGN-ios-deltas.md`** — if tokens changed (new colors, typography,
  shape). New iOS colorsets carry light+dark values in their `Contents.json`.

Deltas marked "Not built" are backlog, not part of the sync — building them is separate
work, one flow at a time per the working style in `CLAUDE.md`.

### 5. Advance the clones to the new pin

Once analysis is done (nothing else is reading the old worktree):

```
git -C <repo> merge --ff-only origin/trunk    # both repos, on branch `trunk`
```

This matters: flow-building sessions read source from **disk**, so the worktree must match
the SHAs pinned in the sync log.

### 6. Commit

Commit the doc updates (and any built deltas) in the sandbox repo with a message like
`Sync source deltas: <headline items>`.
