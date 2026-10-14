/**
 * Mock System Events content for the `scaling-pos-experience` proposal. No backend — these
 * are fired by SystemEventsContext in response to the chrome toolbar's hardware/connectivity
 * toggles (and, for catalog sync, its own manual toolbar trigger).
 */
export type SystemEventId =
  | 'reader-connected'
  | 'reader-disconnected'
  | 'reader-connect-failed'
  | 'printer-connected'
  | 'printer-disconnected'
  | 'scanner-connected'
  | 'scanner-disconnected'
  | 'offline'
  | 'online'
  | 'catalog-sync-failed'
  | 'catalog-synced';

export type SystemEventIcon = 'reader' | 'printer' | 'scanner' | 'connectivity' | 'catalog';
export type SystemEventTone = 'success' | 'error';

export interface SystemEventDef {
  id: SystemEventId;
  icon: SystemEventIcon;
  tone: SystemEventTone;
  title: string;
  subtitle: string;
  /** Stays visible until dismissed or resolved, instead of auto-dismissing after a few seconds. */
  persistent?: boolean;
  /** Primary action link shown on persistent events (e.g. "Retry"). */
  actionLabel?: string;
  /** Action-verb text ("Connecting card reader…") shown with a spinner before this event's
   *  normal content — only used for the startup sequence (see fireStartup in
   *  SystemEventsContext), not when the same event fires from a toolbar toggle. */
  loadingLabel?: string;
  /** Overrides SystemEventsContext's default LOADING_DURATION_MS for this event's loading
   *  phase — e.g. the printer takes noticeably longer to connect than the reader. */
  loadingDurationMs?: number;
}

export const SYSTEM_EVENT_DEFS: Record<SystemEventId, SystemEventDef> = {
  'reader-connected': {
    id: 'reader-connected',
    icon: 'reader',
    tone: 'success',
    title: 'Card reader connected',
    subtitle: 'Ready to accept card payments',
    loadingLabel: 'Connecting card reader…',
  },
  'reader-disconnected': {
    id: 'reader-disconnected',
    icon: 'reader',
    tone: 'error',
    title: 'Card reader disconnected',
    subtitle: 'Reconnect to accept card payments',
  },
  'reader-connect-failed': {
    id: 'reader-connect-failed',
    icon: 'reader',
    tone: 'error',
    title: 'Card reader connection failed',
    subtitle: 'Reconnect from Settings to accept card payments',
    persistent: true,
    actionLabel: 'Retry',
  },
  'printer-connected': {
    id: 'printer-connected',
    icon: 'printer',
    tone: 'success',
    title: 'Printer connected',
    subtitle: 'Ready to print receipts',
    loadingLabel: 'Connecting printer…',
    loadingDurationMs: 4800,
  },
  'printer-disconnected': {
    id: 'printer-disconnected',
    icon: 'printer',
    tone: 'error',
    title: 'Printer disconnected',
    subtitle: 'Reconnect to print receipts',
  },
  'scanner-connected': {
    id: 'scanner-connected',
    icon: 'scanner',
    tone: 'success',
    title: 'Barcode scanner connected',
    subtitle: 'Ready to scan products',
  },
  'scanner-disconnected': {
    id: 'scanner-disconnected',
    icon: 'scanner',
    tone: 'error',
    title: 'Barcode scanner disconnected',
    subtitle: 'Reconnect to scan products',
  },
  offline: {
    id: 'offline',
    icon: 'connectivity',
    tone: 'error',
    title: "You're offline",
    subtitle: 'Some features may be unavailable',
    persistent: true,
  },
  online: {
    id: 'online',
    icon: 'connectivity',
    tone: 'success',
    title: 'Back online',
    subtitle: 'Connection restored',
  },
  'catalog-sync-failed': {
    id: 'catalog-sync-failed',
    icon: 'catalog',
    tone: 'error',
    title: 'Catalog sync failed',
    subtitle: 'Some products may be outdated',
    persistent: true,
    actionLabel: 'Retry',
  },
  'catalog-synced': {
    id: 'catalog-synced',
    icon: 'catalog',
    tone: 'success',
    title: 'Catalog synced',
    subtitle: 'Products are up to date',
    loadingLabel: 'Syncing catalog…',
  },
};

/** Fires once per session, in this order, when POS Home first loads (tablet only).
 *  Catalog sync isn't part of the startup beat yet — its trigger (manual toolbar toggle
 *  only, see SystemEventsContext.markSyncFailed/markSyncResolved) is still being figured
 *  out, so it stays out of here until that's settled. */
export const STARTUP_SEQUENCE: SystemEventId[] = ['reader-connected', 'printer-connected'];
