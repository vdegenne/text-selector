export const availableTTSs = ['gemini', 'voicevox', 'kokoro'] as const

export const jaTTSs = [
	'gemini',
	'voicevox',
	'kokoro',
] as const satisfies readonly (typeof availableTTSs)[number][]
export const enTTSs = [
	'gemini',
	'kokoro',
] as const satisfies readonly (typeof availableTTSs)[number][]
export const frTTSs = [
	'gemini',
	'kokoro',
] as const satisfies readonly (typeof availableTTSs)[number][]

export type TTS = (typeof availableTTSs)[number]
export type JaTTS = (typeof jaTTSs)[number]
export type EnTTS = (typeof enTTSs)[number]
export type FrTTS = (typeof frTTSs)[number]

export const KOKORO_DEFAULT_HOST = 'http://127.0.0.1:8880'
