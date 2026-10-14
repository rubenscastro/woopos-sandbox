/**
 * Copy for the POS loading / catalog-sync screen, verbatim from
 * PointOfSaleLoadingView.swift's `Localization` enum (Presentation/CardReaderConnection/UI
 * States/) — same English strings as Android's splashCopy, since both platforms sync the same
 * local catalog on first load.
 */
export const loadingCopy = {
  syncingTitle: 'Syncing catalog',
  preparing: 'Preparing catalog...',
  progress: (processed: number, total: number) => `${processed} of ${total} items`,
  hint: 'Catalog syncing may take a few minutes.',
  subtitle: 'You can leave and syncing will continue in the background.',
  exitButton: 'Exit POS',
  // Sample progress used by the Swift #Preview("Catalog Sync Progress")
  sampleProcessed: 131,
  sampleTotal: 4512,
};
