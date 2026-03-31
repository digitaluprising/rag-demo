export const typographyColorVar = {
  primary: 'var(--text-h)',
  muted: 'var(--text)',
  secondary: 'var(--text-secondary)',
  danger: 'var(--text-danger)',
} as const

export type TypographyColor = keyof typeof typographyColorVar
