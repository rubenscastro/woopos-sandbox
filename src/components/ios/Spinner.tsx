import '../android/Spinner.css';

interface SpinnerProps {
  /** Diameter in CSS length units (e.g. 'var(--size-xlarge)' or '20px'). */
  size?: string;
  /** The rotating arc color. Defaults to primary (Woo Purple). */
  arcColor?: string;
  /** The static track color behind the arc. Defaults to secondary (light purple). */
  trackColor?: string;
}

/**
 * Mirrors POSProgressViewStyle / IndefiniteCircularProgressViewStyle (posSecondary track disc
 * + rotating posPrimary arc, center punched out) — same shape spec as Android's donut spinner,
 * kept as its own iOS component per the platform split rather than importing Android's.
 */
export function Spinner({
  size = 'var(--icon-medium)',
  arcColor = 'var(--color-primary)',
  trackColor = 'var(--color-secondary)',
}: SpinnerProps) {
  return (
    <span
      className="woopos-spinner"
      style={
        {
          width: size,
          height: size,
          '--woopos-spinner-arc': arcColor,
          '--woopos-spinner-track': trackColor,
        } as React.CSSProperties
      }
      role="progressbar"
      aria-label="Loading"
    />
  );
}
