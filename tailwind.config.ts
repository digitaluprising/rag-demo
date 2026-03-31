import type { Config } from 'tailwindcss'

/**
 * Spacing: Tailwind’s default scale uses 0.25rem per unit (4px at 16px root).
 * Use integer utilities (`p-2`, `gap-4`, `mt-6`, …) so layout stays on the 4px grid.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config
