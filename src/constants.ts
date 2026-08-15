/* vite only */
export const DEV = import.meta.env.DEV

export const availablePages = ['main', 'search'] as const
// true as AllValuesPresent<Page, typeof availablePages>

export const fontFamily = [
	'Noto Sans JP',
	'Noto Serif JP',
	'Zen Maru Gothic',
	'Zen Kaku Gothic New',
	'Zen Kaku Gothic Antique',
	'Klee One',
	'BIZ UDMincho',
	'Zen Kurenaido',
	'Playfair Display',
	'BJCree',
	'Merriweather',
] as const

export type FontValue = (typeof fontFamily)[number]

/**
 * Used to determine the original new lines in the input
 * apart from the ones intentionally added when "break sentences" option is on.
 */
export const NEW_LINE = '\uE000'
