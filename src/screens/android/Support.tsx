import { useNav } from '../../device/platformNav';
import { Toolbar } from '../../components/android/Toolbar';
import { MenuItem } from '../../components/android/MenuItem';

/**
 * Flow 20 — Support / help (settings/details/help + support). The help menu: product info,
 * documentation, and contacting support.
 */
export function Support() {
  const navigate = useNav();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar title="Get help and support" onBack={() => navigate('/products')} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <MenuItem title="Where are my products?" subtitle="Learn about which products are supported in POS" onClick={() => navigate('/settings')} />
        <MenuItem title="Documentation" subtitle="View guides and tutorials" onClick={() => {}} />
        <MenuItem title="Get Support" subtitle="Contact our support team" onClick={() => {}} />
      </div>
    </div>
  );
}
