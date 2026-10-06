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

export const jaTTSs = ['gemini', 'voicevox', 'kokoro'] as const
export const enTTSs = ['gemini', 'kokoro'] as const
export const frTTSs = ['gemini', 'kokoro'] as const

export type JaTTS = (typeof jaTTSs)[number]
export type EnTTS = (typeof enTTSs)[number]
export type FrTTS = (typeof frTTSs)[number]

export const VOICEVOX_DEFAULT_HOST = 'http://127.0.0.1:50021'
export const KOKORO_DEFAULT_HOST = 'http://localhost:8880'

export const languages = ['ja', 'en', 'fr'] as const
export type Language = (typeof languages)[number]
