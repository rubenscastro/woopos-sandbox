import { useEffect, useState } from 'react';
import { PosText } from '../../../../components/ios/PosText';
import { PosButton } from '../../../../components/ios/PosButton';
import { centsFromInput, formatUsd } from '../../../../lib/currency';
import { expectedInDrawer, type CashSession } from '../../../../mocks/versions/cash-reconciliation/cashDrawer';
import { CashSheet } from './CashSheet';
import { CashSheetReveal, CashSheetValue } from './CashSheetValue';

/**
 * Closing a session (2020:4526 → 2020:4570 → 2020:4727). Two questions: what's actually in the
 * drawer, and — if that isn't what the drawer says should be there — why.
 *
 * The count is the whole point of the flow, so the screen shows what's expected while the
 * merchant types and names the gap the moment one exists. Nothing is hidden until the end:
 * they know where they stand before they commit.
 */
export interface CloseSessionSheetProps {
  /** The session being closed; `null` closes the sheet. */
  session: CashSession | null;
  onClose: () => void;
  /** Fired on the last step, with what was counted and why it differs. */
  onConfirm: (counted: number, note: string) => void;
}

type Step = 'count' | 'note';

/** `+$50.00` / `-$50.00` — a discrepancy is always signed, because its direction is the point. */
function signed(amount: number): string {
  return `${amount > 0 ? '+' : '-'}${formatUsd(Math.abs(amount))}`;
}

export function CloseSessionSheet({ session, onClose, onConfirm }: CloseSessionSheetProps) {
  const open = session !== null;
  const [step, setStep] = useState<Step>('count');
  /*
   * `null` until the merchant touches the field, because an empty drawer is a real count and
   * has to be tellable from one that hasn't been made yet. Both read $0.00; only one of them
   * should let you continue.
   */
  const [cents, setCents] = useState<number | null>(null);
  const [note, setNote] = useState('');
  // Held through the slide-out, so the figures don't empty mid-animation.
  const [expected, setExpected] = useState(0);

  useEffect(() => {
    if (session) setExpected(expectedInDrawer(session));
  }, [session]);

  useEffect(() => {
    if (!open) return;
    setStep('count');
    setCents(null);
    setNote('');
  }, [open]);

  const entered = cents !== null;
  const counted = (cents ?? 0) / 100;
  const discrepancy = Number((counted - expected).toFixed(2));
  // An untouched field isn't a $0 count, it's no count — so nothing is said about a gap until
  // a number has actually been given.
  const showsDiscrepancy = entered && discrepancy !== 0;

  /*
   * The last gap there was to name. The line collapses rather than unmounting, so it is still
   * on screen for the length of that transition after the count comes back into balance — and
   * what it says while it closes should be the gap that just went away, not "+$0.00".
   */
  const [lastDiscrepancy, setLastDiscrepancy] = useState(0);
  useEffect(() => {
    if (showsDiscrepancy) setLastDiscrepancy(discrepancy);
  }, [showsDiscrepancy, discrepancy]);

  return (
    <CashSheet
      open={open}
      onClose={onClose}
      onBack={step === 'note' ? () => setStep('count') : undefined}
      title={step === 'count' ? 'Current amount in drawer' : 'Enter a note'}
      // Whether the step has to be answered is the header's second line, not a parenthesis on
      // the question itself (2013:2756).
      description={step === 'note' ? 'Optional' : undefined}
      label="Close session"
      step={step}
      action={
        step === 'count' ? (
          <PosButton label="Continue" fullWidth disabled={!entered} onClick={() => setStep('note')} />
        ) : (
          <PosButton
            label="Close session"
            fullWidth
            onClick={() => {
              onConfirm(counted, note.trim());
              onClose();
            }}
          />
        )
      }
    >
      {step === 'count' ? (
        <div className="cash-sheet__value-block">
          <CashSheetValue
            value={formatUsd(counted)}
            onChange={(next) => setCents(centsFromInput(next))}
            empty={!entered}
            numeric
            ariaLabel="Current amount in drawer"
          />
          <CashSheetReveal shown>
            <PosText variant="bodyMedium" align="center" color="var(--color-on-surface-variant-highest)">
              Expected amount is {formatUsd(expected)}
            </PosText>
          </CashSheetReveal>
          {/* Named as it's typed, in the alert colour — a gap is neither good news nor an
              error, it's something to account for. */}
          <CashSheetReveal shown={showsDiscrepancy}>
            <PosText variant="bodyMedium" align="center" color="var(--color-alert)">
              There's a {signed(showsDiscrepancy ? discrepancy : lastDiscrepancy)} discrepancy
            </PosText>
          </CashSheetReveal>
        </div>
      ) : (
        <div className="cash-sheet__value-block">
          <CashSheetValue
            value={note}
            onChange={setNote}
            /* One prompt either way. The design writes the discrepancy into it, but the step
               is reached whether or not there is one, and the amount is already on the screen
               behind this — repeating it in the field's own prompt narrows what the note is
               for. */
            placeholder="Add a note"
            ariaLabel="Note"
          />
        </div>
      )}
    </CashSheet>
  );
}
