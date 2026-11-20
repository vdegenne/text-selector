import { AudioPlayer } from '@vdegenne/audio-player'
import { GeminiTtsProxyClient } from '@vdegenne/gemini-tts-proxy'
import {
	GeminiSpeechOptions,
	GeminiTtsVoice,
} from '@vdegenne/gemini-tts-proxy/core'
import { KokoroProxyClient } from '@vdegenne/kokoro-proxy'
import { Language } from '@vdegenne/kokoro-proxy/core'
import { VoicevoxProxyClient } from '@vdegenne/voicevox'
import { handleAsync } from './errors.js'
import { toast } from './snackbar.js'
import { store } from './store.js'

export const geminiTtsProxy = new GeminiTtsProxyClient({
	// endpoint: 'http://127.0.0.1:3001',
	endpoint: 'https://gemini-tts-proxy.gl-ai-z.win',
})

export const voicevoxProxy = new VoicevoxProxyClient()

export const kokoroProxy = new KokoroProxyClient({
	endpoint: 'https://kokoro-proxy.gl-ai-z.win',
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

		switch (lang) {
			case 'Ja':
				switch (store.jaTTS) {
					case 'gemini': {
						if (!store.geminiApiKey) {
							throw new Error('No API key')
						}

						const options: GeminiSpeechOptions = {
							input: text,
							model: 'gemini-3.8-flash-lite-tts',
							voice: 'Aoede' as GeminiTtsVoice,
							languageCode: 'ja-JP',
						}

						return geminiTtsProxy.createAudioRequest(options, {
							headers: {
								'x-goog-api-key': store.geminiApiKey,
							},
						})
					}
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

			case 'En':
				switch (store.enTTS) {
					case 'gemini':
					case 'kokoro':
						break
				}
				break

			case 'Fr':
				switch (store.frTTS) {
					case 'gemini':
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
