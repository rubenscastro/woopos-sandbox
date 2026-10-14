import './Spinner.css';

interface SpinnerProps {
  /** Diameter in CSS length units (e.g. 'var(--size-xlarge)' or '20px'). */
  size?: string;
  /** The rotating arc color. Defaults to primary (Woo Purple). */
  arcColor?: string;
  /** The static track color behind the arc. Defaults to secondary (light purple). */
  trackColor?: string;
}

/**
 * Mirrors WooPosCircularLoadingIndicator: a thick donut, not a thin stroked ring.
 * A full secondary-color disc as the track, a rotating 110° filled arc in the arc
 * color on top, and the center punched out at 40% of the radius (so the ring fills
 * the outer ~60% of the radius). Rotation eases in/out per cycle (FastOutSlowIn).
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
