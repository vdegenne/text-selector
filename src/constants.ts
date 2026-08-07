/* vite only */
export const DEV = import.meta.env.DEV

export const availablePages = ['main', 'search'] as const
// true as AllValuesPresent<Page, typeof availablePages>

export const fontFamily = [
	'Noto Serif JP',
	'Noto Sans JP',
	'Zen Maru Gothic',
	'Playfair Display',
	'BJCree',
	'Merriweather',
] as const

export type FontValue = (typeof fontFamily)[number]
