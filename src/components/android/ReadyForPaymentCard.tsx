import type { ComponentType, CSSProperties } from 'react';
import LottieImport from 'lottie-react';
import animationData from '../../assets/android/readyForPaymentCard.lottie.json';

interface Props {
  size?: string;
}

type LottieProps = {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  initialSegment?: [number, number];
  style?: CSSProperties;
};

// Vite's CJS/ESM interop can resolve lottie-react's default export to the module namespace
// object (with the real component nested under `.default`) rather than the component itself.
// Unwrap both shapes so this works regardless of how the dep gets bundled.
const Lottie = ((LottieImport as unknown as { default?: ComponentType<LottieProps> }).default ??
  (LottieImport as unknown as ComponentType<LottieProps>)) as ComponentType<LottieProps>;

/**
 * "Ready for payment" illustration — the real app's Lottie animation (raw resource
 * `woopos_card_ilustration`, fetched from woocommerce-android), rendered with lottie-react.
 *
 * Matches WooPosTotalsScreen's ReaderReadyForPayment: plays only the `reader_awaiting` marker
 * segment (frames 92–337 of the 792-frame comp) on an infinite loop. Source comp is 495×522,
 * so the box keeps that aspect ratio rather than forcing a square.
 */
export function ReadyForPaymentCard({ size = '140px' }: Props) {
  return (
    <div aria-hidden style={{ width: size, aspectRatio: '495 / 522' }}>
      <Lottie
        animationData={animationData}
        loop
        autoplay
        initialSegment={[92, 337]}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
