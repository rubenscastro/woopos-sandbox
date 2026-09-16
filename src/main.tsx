import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as amplitude from '@amplitude/unified'
/* Roboto, self-hosted. Android's type is Roboto and iOS's is SF Pro — DESIGN-ios-deltas.md
   calls the family the biggest difference between the two platforms — but Roboto isn't on a
   Mac, so the stack fell through to the system font and both platforms rendered in SF Pro.
   The one visible thing separating them was invisible. 400/500/700 are Roboto's real weights;
   nothing here asks for a 600 on the Android side. */
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import App from './App.tsx'

// Client-side only, initialized once at app bootstrap.
amplitude.initAll('efbd82cac7187d4b2fce40bbfc7302d7', {
  analytics: { autocapture: true },
  sessionReplay: { sampleRate: 1 },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
