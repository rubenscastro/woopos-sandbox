import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * iOS POS text primitive (POSFontStyle.swift). Sizes come from the shared font tokens (same
 * as Android at tablet; SF Pro is applied via [data-platform='ios']). iOS quirk: bodyXLarge
 * *regular* renders semibold, and button/symbol text defaults to semibold — see
 * DESIGN-ios-deltas.md. NOTE: the iOS phone type scale (24/22/18/16/14/12) isn't encoded yet;
 * tablet sizes match Android, so this is faithful on tablet — phone scale is a follow-up.
 */
export type PosTextVariant =
  | 'heading'
  | 'bodyXLarge'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption';

const VARS: Record<PosTextVariant, { size: string; line: string }> = {
  heading: { size: 'var(--font-heading-size)', line: 'var(--font-heading-line)' },
  bodyXLarge: { size: 'var(--font-body-xl-size)', line: 'var(--font-body-xl-line)' },
  bodyLarge: { size: 'var(--font-body-lg-size)', line: 'var(--font-body-lg-line)' },
  bodyMedium: { size: 'var(--font-body-md-size)', line: 'var(--font-body-md-line)' },
  bodySmall: { size: 'var(--font-body-sm-size)', line: 'var(--font-body-sm-line)' },
  caption: { size: 'var(--font-caption-size)', line: 'var(--font-caption-line)' },
};

interface PosTextProps {
  variant?: PosTextVariant;
  bold?: boolean;
  align?: CSSProperties['textAlign'];
  color?: string;
  as?: ElementType;
  children: ReactNode;
  style?: CSSProperties;
}

export function PosText({
  variant = 'bodyMedium',
  bold = false,
  align,
  color = 'var(--color-on-surface)',
  as: Tag = 'span',
  children,
  style,
}: PosTextProps) {
  const v = VARS[variant];
  // iOS renders bodyXLarge regular as semibold; headings are bold.
  const weight = bold || variant === 'heading' ? 700 : variant === 'bodyXLarge' ? 600 : 400;
  return (
    <Tag style={{ fontSize: v.size, lineHeight: v.line, fontWeight: weight, textAlign: align, color, margin: 0, ...style }}>
      {children}
    </Tag>
  );
}
