import type { CSSProperties, ElementType, ReactNode } from 'react';

/** Mirrors WooPosTypography styles. Sizes/line-heights resolve from tokens.css. */
export type TextVariant =
  | 'heading'
  | 'bodyXLarge'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption';

const VARIANT_VARS: Record<TextVariant, { size: string; line: string }> = {
  heading: { size: 'var(--font-heading-size)', line: 'var(--font-heading-line)' },
  bodyXLarge: { size: 'var(--font-body-xl-size)', line: 'var(--font-body-xl-line)' },
  bodyLarge: { size: 'var(--font-body-lg-size)', line: 'var(--font-body-lg-line)' },
  bodyMedium: { size: 'var(--font-body-md-size)', line: 'var(--font-body-md-line)' },
  bodySmall: { size: 'var(--font-body-sm-size)', line: 'var(--font-body-sm-line)' },
  caption: { size: 'var(--font-caption-size)', line: 'var(--font-caption-line)' },
};

interface TextProps {
  variant?: TextVariant;
  bold?: boolean;
  align?: CSSProperties['textAlign'];
  color?: string;
  as?: ElementType;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Text({
  variant = 'bodyMedium',
  bold = false,
  align,
  color = 'var(--color-on-surface)',
  as: Tag = 'span',
  children,
  style,
  className,
}: TextProps) {
  const vars = VARIANT_VARS[variant];
  return (
    <Tag
      className={className}
      style={{
        fontSize: vars.size,
        lineHeight: vars.line,
        fontWeight: bold ? 700 : 400,
        textAlign: align,
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
