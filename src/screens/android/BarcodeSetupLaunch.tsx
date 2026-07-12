import { useEffect } from 'react';
import { useBarcodeSetup } from '../../tools/BarcodeSetup';
import { ItemSelection } from './ItemSelection';

/** Opens the barcode-setup modal over the items screen (flow 15 entry point). */
export function BarcodeSetupLaunch() {
  const { openSetup } = useBarcodeSetup();
  useEffect(() => {
    openSetup();
  }, [openSetup]);
  return <ItemSelection />;
}
