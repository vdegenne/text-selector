import { AudioPlayer } from '@vdegenne/audio-player'
import { GeminiTtsProxyClient } from '@vdegenne/gemini-tts-proxy'
import {
	GEMINI_TTS_VOICES,
	SpeechOptions as GeminiSpeechOptions,
} from '@vdegenne/gemini-tts-proxy/core'
import { KokoroProxyClient } from '@vdegenne/kokoro-proxy'
import { VoicevoxProxyClient } from '@vdegenne/voicevox'
import { handleAsync } from './errors.js'
import { getLanguageCode, Language } from './lang.js'
import { toast } from './snackbar.js'
import { store } from './store.js'

export const geminiTtsProxy = new GeminiTtsProxyClient({
	// endpoint: 'http://127.0.0.1:3001',
	endpoint: 'https://gemini-tts-proxy.gl-ai-z.win',
})

// Voicevox and Kokoro use local servers
export const voicevoxProxy = new VoicevoxProxyClient({
	endpoint: 'http://127.0.0.1:50021',
})
export const kokoroProxy = new KokoroProxyClient({
	endpoint: 'http://127.0.0.1:3000',
})

export const ttsPlayer = new AudioPlayer(
	async (text: string, lang: Language) => {
		// let voiceId = store[`kokoro${lang}VoiceId`]
		// if (store[`kokoro${lang}Random`]) {
		// 	voiceId = store[`kokoro${lang}VoiceId`] = kokoro.getRandomVoiceId({
		// 		lang,
		// 		exclude: [],
		// 	})
		// }
		// store.bottomRightFeedback = `kokoro: ${voiceId}`
		//
		// // return await kokoro.getAudio(text, {
		// // 	voiceId,
		// // 	speed: 1,
		// // 	volume_multiplier: 1,
		// // })

		// Gemini

		if (store[`${lang}TTS`] === 'gemini') {
			if (!store.geminiApiKey) {
				throw new Error('No API key')
			}

			store.bottomRightFeedback = `Gemini: Achird`

			const options: GeminiSpeechOptions = {
				input: text,
				model: 'gemini-3.8-flash-lite-tts',
				// TODO: update this
				voice: 'Achird',
				languageCode: getLanguageCode(lang),
			}

			return geminiTtsProxy.createAudioRequest(options, {
				headers: {
					'x-goog-api-key': store.geminiApiKey,
				},
			})
		}

		// Other TTS

		switch (lang) {
			case 'ja':
				switch (store.jaTTS) {
					case 'voicevox': {
						await prepareVoicevoxVoice()

						return voicevoxProxy.createAudioRequest({
							input: text,
							speaker: store.voicevoxVoiceId,
						})
					}
					case 'kokoro': {
						return kokoroProxy.createAudioRequest({
							input: text,
						})
					}
				}
				break

			case 'en':
				switch (store.enTTS) {
					case 'kokoro':
						break
				}
				break

			case 'fr':
				switch (store.frTTS) {
					case 'kokoro':
						break
				}
				break
		}

		return {} as any
	},
)

export async function playTTS(text: string, lang: Language) {
	const { playPromise } = ttsPlayer.play([text, lang], { volume: store.volume })

	return handleAsync(playPromise, function (error) {
		toast({
			message: error instanceof Error ? error.message : String(error),
			actionLabel: 'Close',
		})
		console.error('TTS playback failed:', error)
	})
}

export async function prepareVoicevoxVoice() {
	const voices = await voicevoxProxy.getVoices()

	if (voices.length === 0) {
		throw new Error('No VOICEVOX voices available')
	}

	if (store.voicevoxRandom) {
		const randomVoice = voices[Math.floor(Math.random() * voices.length)]
		store.voicevoxVoiceId = randomVoice.id
	}

	const voice = voices.find((voice) => voice.id === store.voicevoxVoiceId)

	if (!voice) {
		throw new Error(`VOICEVOX voice not found: ${store.voicevoxVoiceId}`)
	}

	store.bottomRightFeedback = `voicevox: ${voice.name}`
}

export function setGeminiRandomVoice() {
	store.geminiVoice =
		GEMINI_TTS_VOICES[Math.floor(Math.random() * GEMINI_TTS_VOICES.length)]
}
