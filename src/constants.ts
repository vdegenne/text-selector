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
