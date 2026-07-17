/**
 * Sample data for flow 1 (splash / eligibility), pulled from the @Preview composables
 * in WooPosSplashScreen.kt / WooPosEligibilityScreen.kt and strings.xml. Copy is verbatim
 * from the real app so the prototype reads true to WooPOS.
 */

// ---- Splash copy (strings.xml: woopos_home_syncing_catalog_* / woopos_home_sync_failed_*) ----
export const splashCopy = {
  syncingTitle: 'Syncing catalog',
  preparing: 'Preparing catalog…',
  // woopos_home_syncing_catalog_progress: "%1$d of %2$d items"
  progress: (processed: number, total: number) => `${processed} of ${total} items`,
  hint: 'Catalog syncing may take a few minutes.',
  subtitle: 'You can leave and syncing will continue in the background.',
  exitButton: 'Exit POS',
  // Sample progress used by the "Syncing" @Preview
  sampleProcessed: 131,
  sampleTotal: 4512,
};

export const syncFailedCopy = {
  transient: {
    title: 'Unable to sync',
    message:
      'We are unable to sync your product catalog. Please check your internet connection and retry.',
    primaryButton: 'Retry',
  },
  serverPermissions: {
    title: 'Action needed on your store',
    message:
      "Point of Sale can't access a file with your product information because your hosting " +
      'provider is blocking it. Please ask them to allow access to it so Point of Sale keeps ' +
      'working properly.',
    primaryButton: 'Got it',
  },
  exitButton: 'Exit POS',
};

// ---- Eligibility retry states (WooPosEligibilityRetryState) ----
export type EligibilityState =
  | {
      kind: 'retryable';
      title: string;
      suggestionText: string;
    }
  | {
      kind: 'loading';
      title: string;
      suggestionText: string;
    };

// From WooPosEligibilityScreenRetryablePreview
export const retryableIneligiblePreview: EligibilityState = {
  kind: 'retryable',
  title: 'Unable to load',
  suggestionText:
    "The POS system is not available for your store's currency. In United States, it " +
    'currently supports only USD. Please check your store currency settings or contact ' +
    'support for assistance.',
};

export const eligibilityButtons = {
  retry: 'Retry',
  exit: 'Exit POS',
};
