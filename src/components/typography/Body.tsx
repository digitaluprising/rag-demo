import type { HTMLAttributes } from 'react'

import { typographyColorVar, type TypographyColor } from './typography-color'

export type BodyProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
  color?: TypographyColor
  as?: 'p' | 'span' | 'div'
}

/** Paragraphs and main reading text. Line-height **1.4**; size `--step-0` (base). */
export function Body({
  as: Tag = 'p',
  color = 'muted',
  style,
  ...props
}: BodyProps) {
  return (
    <Tag
      style={{
        fontFamily: 'var(--sans)',
        fontSize: 'var(--step-0)',
        lineHeight: 1.4,
        fontWeight: 400,
        color: typographyColorVar[color],
        ...style,
      }}
      {...props}
    />
  )
}
