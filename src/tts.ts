import {Language} from '@vdegenne/kokoro'
import {AudioPlayer} from './audio-player.js'
import {kokoro} from './kokoro.js'
import {store} from './store.js'

export const kokoroPlayer = new AudioPlayer(
	async (text: string, lang: Language) => {
		let voiceId = store[`kokoro${lang}VoiceId`]
		if (store[`kokoro${lang}Random`]) {
			voiceId = store[`kokoro${lang}VoiceId`] = kokoro.getRandomVoiceId({
				lang,
				exclude: [],
			})
		}
		store.bottomRightFeedback = `kokoro: ${voiceId}`

		return await kokoro.getAudio(text, {
			voiceId,
			speed: 1,
			volume_multiplier: 1,
		})
	},
)
