import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as amplitude from '@amplitude/unified'
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
