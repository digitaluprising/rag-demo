import type { HTMLAttributes } from 'react'

import { typographyColorVar, type TypographyColor } from './typography-color'

export type LabelProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
  color?: TypographyColor
  as?: 'span' | 'label' | 'div'
}

/** Captions, metadata, and UI labels. Line-height **1**; size at least **12px** via `max()`. */
export function Label({
  as: Tag = 'span',
  color = 'secondary',
  style,
  ...props
}: LabelProps) {
  return (
    <Tag
      style={{
        fontFamily: 'var(--sans)',
        fontSize: 'max(var(--font-size-label-min), var(--step--1))',
        lineHeight: 1,
        fontWeight: 500,
        color: typographyColorVar[color],
        ...style,
      }}
      {...props}
    />
  )
}
