import { useIsDark } from '../../hooks/useIsDark';
import scanningLight from '../../assets/ios/reader-scanning-light.png';
import scanningDark from '../../assets/ios/reader-scanning-dark.png';
import errorLight from '../../assets/ios/reader-error-light.png';
import errorDark from '../../assets/ios/reader-error-dark.png';
import successLight from '../../assets/ios/reader-success-light.png';
import successDark from '../../assets/ios/reader-success-dark.png';
import locationLight from '../../assets/ios/location-light.png';
import locationDark from '../../assets/ios/location-dark.png';

/**
 * The illustration at the top of every iOS card-reader connection alert —
 * `PointOfSaleAssets.readerConnection` / `.readerConnectionError` / `.readerConnectionSuccess`,
 * taken from the app's own asset catalogue.
 *
 * iOS draws a purple reader tile here, nothing like Android's line-art reader, which is why
 * this is its own component rather than the shared one: the two platforms genuinely don't show
 * the same picture. Each asset ships a variant per appearance, so the file is chosen rather
 * than recoloured.
 */
export type PosReaderIllustrationVariant = 'scanning' | 'error' | 'success' | 'location';

const ASSETS: Record<PosReaderIllustrationVariant, { light: string; dark: string }> = {
  scanning: { light: scanningLight, dark: scanningDark },
  error: { light: errorLight, dark: errorDark },
  success: { light: successLight, dark: successDark },
  // `PointOfSaleAssets.location` — a map pin, not a reader. The location alert is about the
  // device's permissions, not the hardware, and the picture says so.
  location: { light: locationLight, dark: locationDark },
};

export function PosReaderIllustration({
  variant,
  size = 'var(--size-xlarge)',
}: {
  variant: PosReaderIllustrationVariant;
  size?: string | number;
}) {
  const isDark = useIsDark();
  const asset = ASSETS[variant];
  return (
    <img
      src={isDark ? asset.dark : asset.light}
      alt=""
      aria-hidden
      style={{ width: size, height: size, objectFit: 'contain', flex: 'none' }}
    />
  );
}
