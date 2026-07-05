import type { CSSProperties } from 'react';
import { Spinner } from './Spinner';
import './Button.css';

/** Mirrors WooPosButtonState. */
export type ButtonState = 'enabled' | 'disabled' | 'loading';

interface BaseButtonProps {
  text: string;
  onClick?: () => void;
  state?: ButtonState;
  /** 'large' = 80px height + body-lg (WooPosButton); 'small' = 40px + body-sm. */
  size?: 'large' | 'small';
  fullWidth?: boolean;
  style?: CSSProperties;
  className?: string;
}

function ButtonInner({
  text,
  onClick,
  state = 'enabled',
  size = 'large',
  fullWidth,
  variant,
  style,
  className,
}: BaseButtonProps & { variant: 'primary' | 'outlined' }) {
  const isLoading = state === 'loading';
  const isDisabled = state === 'disabled';
  const clickable = state === 'enabled';

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={clickable ? onClick : undefined}
      className={[
        'woopos-btn',
        `woopos-btn--${variant}`,
        `woopos-btn--${size}`,
        isDisabled ? 'is-disabled' : '',
        fullWidth ? 'is-full' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* Keep the label in the layout when loading so width doesn't jump. */}
      <span className="woopos-btn__label" style={{ opacity: isLoading ? 0 : 1 }}>
        {text}
      </span>
      {isLoading && (
        <span className="woopos-btn__spinner">
          <Spinner
            size={size === 'large' ? 'var(--icon-medium)' : '20px'}
            arcColor="currentColor"
          />
        </span>
      )}
    </button>
  );
}

/** WooPosButton — primary filled button. */
export function Button(props: BaseButtonProps) {
  return <ButtonInner {...props} variant="primary" />;
}

/** WooPosOutlinedButton — transparent fill, 2px inverseSurface border. */
export function OutlinedButton(props: BaseButtonProps) {
  return <ButtonInner {...props} variant="outlined" />;
}
