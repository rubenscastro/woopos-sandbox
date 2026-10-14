import { useEffect, useState } from 'react';
import { PosButton } from '../../../../components/ios/PosButton';
import { centsFromInput, formatUsd } from '../../../../lib/currency';
import type { CashMovement } from '../../../../mocks/versions/cash-reconciliation/cashDrawer';
import { CashSheet } from './CashSheet';
import { CashSheetValue } from './CashSheetValue';

/**
 * Record Pay in/out (2013:2634 → 2013:2755). Two questions: how much moved, and why. The
 * description is optional, so the second step's button records rather than continues — there's
 * nothing after it.
 *
 * Which direction the money went is settled before the sheet opens, by the "..." menu in the
 * session header, so the design's own first step (2013:2528, a page of Pay in / Pay out
 * buttons) has nothing left to ask and isn't built. That also leaves the amount step with
 * nothing behind it inside the flow, so it carries ✕ alone where the design shows ‹ as well —
 * both would have dismissed.
 */
export interface RecordPayInOutSheetProps {
  /** The direction chosen in the header menu; `null` closes the sheet. */
  kind: CashMovement['kind'] | null;
  onClose: () => void;
  /** Fired once, on the last step, with what the merchant entered. */
  onRecord: (movement: CashMovement) => void;
}

type Step = 'amount' | 'note';

export function RecordPayInOutSheet({ kind, onClose, onRecord }: RecordPayInOutSheetProps) {
  const open = kind !== null;
  const [step, setStep] = useState<Step>('amount');
  // Holds the direction through the slide-out, so the sheet doesn't retitle itself mid-animation.
  const [shown, setShown] = useState<CashMovement['kind']>('pay-in');
  // Held in minor units, because that's how it's typed — see `centsFromInput`.
  const [cents, setCents] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (kind) setShown(kind);
  }, [kind]);

  // A fresh open starts at the first question with nothing filled in — this records one
  // movement at a time, it isn't a form you come back to.
  useEffect(() => {
    if (!open) return;
    setStep('amount');
    setCents(0);
    setNote('');
  }, [open]);

  const label = shown === 'pay-in' ? 'Pay in' : 'Pay out';

  const record = () => {
    onRecord({ kind: shown, amount: cents / 100, note: note.trim() });
    onClose();
  };

  return (
    <CashSheet
      open={open}
      onClose={onClose}
      onBack={step === 'note' ? () => setStep('amount') : undefined}
      title={step === 'amount' ? `How much is the ${label}?` : 'Enter a description'}
      // Whether the step has to be answered is the header's second line, not a parenthesis on
      // the question itself (2013:2756).
      description={step === 'note' ? 'Optional' : undefined}
      label="Record Pay in/out"
      step={step}
      action={
        step === 'amount' ? (
          <PosButton label="Continue" fullWidth disabled={cents === 0} onClick={() => setStep('note')} />
        ) : (
          <PosButton label={`Record ${label}`} fullWidth onClick={record} />
        )
      }
    >
      <div className="cash-sheet__value-block">
        {step === 'amount' ? (
          <CashSheetValue
            value={formatUsd(cents / 100)}
            onChange={(next) => setCents(centsFromInput(next))}
            empty={cents === 0}
            numeric
            ariaLabel={`${label} amount`}
          />
        ) : (
          <CashSheetValue value={note} onChange={setNote} placeholder="Petty cash" ariaLabel="Description" />
        )}
      </div>
    </CashSheet>
  );
}
