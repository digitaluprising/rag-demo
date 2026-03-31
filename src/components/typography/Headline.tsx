import type { HTMLAttributes } from 'react'

import { typographyColorVar, type TypographyColor } from './typography-color'

export type HeadlineProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
  /** Semantic text color (maps to design tokens in `index.css`). */
  color?: TypographyColor
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/** Section titles and headings. Line-height **1.2**; uses modular scale `--step-2`. */
export function Headline({
  as: Tag = 'h2',
  color = 'primary',
  style,
  ...props
}: HeadlineProps) {
  return (
    <Tag
      style={{
        fontFamily: 'var(--heading)',
        fontSize: 'var(--step-2)',
        lineHeight: 1.2,
        fontWeight: 500,
        color: typographyColorVar[color],
        ...style,
      }}
      {...props}
    />
  )
}
