import { usePlatform } from '../../../device/PlatformContext';
import { useDiscardPending, resolveDiscard } from '../../../state/unsavedGuard';
import { DiscardDialog as AndroidDiscardDialog } from './android/DiscardDialog';
import { DiscardDialog as IosDiscardDialog } from './ios/DiscardDialog';

/** Custom amounts proposal — renders the platform's "discard changes?" dialog when a way off the
 *  details screen is held back by unsaved changes (see state/unsavedGuard). Lives in the device
 *  overlay, so it sits above the keyboard and everything else. */
export function UnsavedChangesHost() {
  const pending = useDiscardPending();
  const { platform } = usePlatform();
  if (!pending) return null;
  const Dialog = platform === 'ios' ? IosDiscardDialog : AndroidDiscardDialog;
  return <Dialog onKeep={() => resolveDiscard(false)} onDiscard={() => resolveDiscard(true)} />;
}
