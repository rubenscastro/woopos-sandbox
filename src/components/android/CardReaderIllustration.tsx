/**
 * WooPosIcons card-reader illustrations (reader-with-NFC / error), reproduced path-for-path
 * from the app. `variant` recolors the blob/body/face + NFC or exclamation overlay to match
 * the real Scanning / Found / Connecting / Success / Error states.
 */
type Variant = 'scanning' | 'found' | 'connecting' | 'success' | 'error';

interface Colors {
  blob: string;
  body: string;
  face: string;
  accent: string;
  overlay: 'nfc' | 'exclamation';
}

const VARIANTS: Record<Variant, Colors> = {
  scanning: { blob: '#AD86E9', body: '#DFD1FB', face: '#F2EDFF', accent: '#966CCF', overlay: 'nfc' },
  found: { blob: '#7F54B3', body: '#DFD1FB', face: '#F2EDFF', accent: '#966CCF', overlay: 'nfc' },
  connecting: { blob: '#BEA0F2', body: '#DFD1FB', face: '#F2EDFF', accent: '#CFB9F6', overlay: 'nfc' },
  success: { blob: '#66EA87', body: '#9EFAAD', face: '#DBFFDB', accent: '#18CD82', overlay: 'nfc' },
  error: { blob: '#FFEE86', body: '#FF7122', face: '#FFBE16', accent: '#BD4200', overlay: 'exclamation' },
};

const NFC =
  'M92.4512 89.369C94.0182 93.1521 94.142 97.5329 92.4512 101.615M99.8422 86.3076C102.193 91.9822 102.378 98.5534 99.8422 104.676M107.233 83.2461C110.367 90.8122 110.615 99.5739 107.233 107.738';

export function CardReaderIllustration({ variant, size = '160px' }: { variant: Variant; size?: string }) {
  const c = VARIANTS[variant];
  return (
    <svg width={size} height={size} viewBox="0 0 202 181" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill={c.blob}
        d="M54.6986 141.943C51.6569 143.799 48.2843 145.052 44.6415 145.58C25.393 148.373 5.88991 129.904 1.08011 104.328C-3.72969 78.7526 7.97517 55.7552 27.2236 52.9623C35.6626 51.7378 44.1505 54.6001 51.4277 60.3565C60.8814 22.6925 84.173 -2.94319 108.874 0.271658C126.42 2.55524 140.716 18.8801 148.469 42.2086C160.466 33.0717 173.517 30.0297 184.124 35.3818C203.378 45.0968 207.285 78.7903 192.851 110.638C179.655 139.756 155.697 157.25 136.972 152.612C125.423 171.338 109.489 182.162 92.9209 180.005C76.3635 177.85 62.6999 163.192 54.6986 141.943Z"
      />
      <path
        fill={c.body}
        d="M61.4512 31.2461L141.4512 31.2461A16 16 0 0 1 157.4512 47.2461L157.4512 128.2461A16 16 0 0 1 141.4512 144.2461L61.4512 144.2461A16 16 0 0 1 45.4512 128.2461L45.4512 47.2461A16 16 0 0 1 61.4512 31.2461Z"
      />
      <path
        fill={c.face}
        d="M61.4512 47.2461L141.4512 47.2461A16 16 0 0 1 157.4512 63.2461L157.4512 128.2461A16 16 0 0 1 141.4512 144.2461L61.4512 144.2461A16 16 0 0 1 45.4512 128.2461L45.4512 63.2461A16 16 0 0 1 61.4512 47.2461Z"
      />
      {c.overlay === 'nfc' ? (
        <path d={NFC} stroke={c.accent} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <path
            fill={c.accent}
            d="M101.451 102.468C99.5499 102.468 98.5746 101.514 98.5252 99.6055L98.0438 80.4351C98.0191 79.5171 98.3154 78.7561 98.9327 78.1521C99.5746 77.5481 100.402 77.2461 101.414 77.2461C102.402 77.2461 103.217 77.5602 103.859 78.1883C104.525 78.7923 104.846 79.5533 104.822 80.4714L104.266 99.6055C104.241 101.514 103.303 102.468 101.451 102.468Z"
          />
          <path
            fill={c.accent}
            d="M101.451 114.246C100.365 114.246 99.4265 113.884 98.6364 113.159C97.8462 112.41 97.4512 111.516 97.4512 110.477C97.4512 109.438 97.8462 108.557 98.6364 107.832C99.4265 107.083 100.365 106.708 101.451 106.708C102.538 106.708 103.476 107.071 104.266 107.796C105.056 108.52 105.451 109.414 105.451 110.477C105.451 111.54 105.044 112.434 104.229 113.159C103.439 113.884 102.513 114.246 101.451 114.246Z"
          />
        </>
      )}
    </svg>
  );
}
