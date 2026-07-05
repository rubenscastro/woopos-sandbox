/**
 * Illustrations reproduced path-for-path from the app's WooPosIcons vector drawables so the
 * prototype matches the real screens. Colors map to the theme tokens (primary / secondary /
 * tertiary icon color).
 */

interface Props {
  size?: string;
}

/** WooPosIcons.CardReaderNotConnected — card reader with a "no connection" X badge. */
export function CardReaderNotConnected({ size = '140px' }: Props) {
  const primary = 'var(--color-primary)';
  const secondary = 'var(--color-secondary)';
  const tertiary = 'var(--color-tertiary-icon)';
  return (
    <svg width={size} height={size} viewBox="0 0 169 169" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill={primary}
        d="M155.557 28.9419C155.557 20.2518 150.755 15.3636 142.159 15.3636H57.5111C48.9147 15.3636 44.1131 20.2518 44.1131 28.9419V113.515C44.1131 122.205 48.9147 127.094 57.5111 127.094H142.159C150.755 127.094 155.557 122.205 155.557 113.515V45.779V28.9419Z"
      />
      <path
        fill={secondary}
        d="M75.3242 39.8038L80.2033 44.692C85.2372 39.6487 92.1298 36.5451 99.7969 36.5451C107.464 36.5451 114.357 39.6487 119.391 44.692L124.27 39.8038C117.997 33.519 109.323 29.6395 99.7969 29.6395C90.2712 29.6395 81.5973 33.519 75.3242 39.8038Z"
      />
      <path
        fill={secondary}
        d="M85.0825 49.6587L89.9616 54.5469C92.4398 52.064 95.9248 50.5122 99.7197 50.5122C103.514 50.5122 107 52.064 109.478 54.5469L114.357 49.6587C110.562 45.8568 105.373 43.5291 99.6422 43.5291C93.9113 43.5291 88.7224 45.8568 84.9276 49.6587H85.0825Z"
      />
      <path
        fill={secondary}
        d="M94.9181 59.4341L99.7971 64.3223L104.676 59.4341C103.437 58.1926 101.733 57.4167 99.7971 57.4167C97.861 57.4167 96.1572 58.1926 94.9181 59.4341Z"
      />
      <path
        fill={tertiary}
        d="M44.1131 78.266V101.566V113.515C44.1131 122.205 48.9147 127.094 57.5111 127.094H142.159L44.1131 78.266Z"
      />
      <path
        fill={secondary}
        d="M13.443 132.377C13.443 152.566 29.8459 169 49.9972 169C70.1484 169 86.5513 152.566 86.5513 132.377C86.5513 112.188 70.1484 95.7545 49.9972 95.7545C29.8459 95.7545 13.443 112.188 13.443 132.377Z"
      />
      <path
        fill={primary}
        d="M64.7339 122.501L59.8238 117.558L49.996 127.443L40.1682 117.558L35.2582 122.493L45.0937 132.378L35.2582 142.271L40.1682 147.206L49.996 137.313L59.8238 147.198L64.7339 142.263L54.906 132.378L64.7339 122.501Z"
      />
    </svg>
  );
}

/** "Ready for payment" card illustration — a card sitting in a rounded reader plate. */
export function ReadyForPaymentCard({ size = '140px' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 169 169" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="20" y="34" width="129" height="101" rx="18" fill="var(--color-secondary)" />
      <rect x="36" y="58" width="97" height="60" rx="10" fill="var(--color-primary)" />
      <rect x="36" y="70" width="97" height="12" fill="var(--color-tertiary-icon)" opacity="0.55" />
      <rect x="46" y="98" width="34" height="9" rx="4.5" fill="var(--color-secondary)" />
    </svg>
  );
}
