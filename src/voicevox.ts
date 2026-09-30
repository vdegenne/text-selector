import {ReactiveController, state} from '@snar/lit'
import {VOICEVOX_DEFAULT_HOST} from './constants.js'

interface VoiceVoxStyle {
	id: number
	name: string
}

interface VoiceVoxSpeaker {
	name: string
	speaker_uuid: string
	styles: VoiceVoxStyle[]
}

type CachedAudio = Blob | Promise<Blob>

class VoiceVoxClient extends ReactiveController {
	@state() state:
		'disconnected' | 'connecting' | 'connection_error' | 'connected' =
		'disconnected'
	@state() speakers: VoiceVoxSpeaker[] = []
	@state() host = VOICEVOX_DEFAULT_HOST

	private cache = new Map<string, CachedAudio>()
	private currentAudio: HTMLAudioElement | null = null
	private currentResolve: (() => void) | null = null

	async connect() {
		this.state = 'connecting'

		try {
			const response = await fetch(`${this.host}/speakers`)

			if (!response.ok) {
				throw new Error(`VoiceVox returned HTTP ${response.status}`)
			}

			this.speakers = await response.json()
			this.state = 'connected'
		} catch (error) {
			console.error('Failed to connect to VoiceVox:', error)
			this.speakers = []
			this.state = 'connection_error'
		}
	}

	disconnect() {
		this.stop()

		this.speakers = []
		this.state = 'disconnected'
	}

	async play(sentence: string, voiceId: number, speed: number) {
		if (this.state !== 'connected') {
			throw new Error('VoiceVox is not connected')
		}

		const key = this.getCacheKey(sentence, voiceId, speed)
		const cached = this.cache.get(key)

		if (cached) {
			this.stop()

			const audio = cached instanceof Promise ? await cached : cached

			this.cache.set(key, audio)

			await this.playBlob(audio)
			return
		}

		const promise = this.fetchAudio(sentence, voiceId, speed)

		this.cache.set(key, promise)

		try {
			const audio = await promise
			this.cache.set(key, audio)

			await this.playBlob(audio)
		} catch (error) {
			this.cache.delete(key)
			throw error
		}
	}

	async togglePlay(sentence: string, voiceId: number, speed: number) {
		if (this.currentAudio) {
			this.stop()
			return
		}

		return this.play(sentence, voiceId, speed)
	}

	private async fetchAudio(sentence: string, voiceId: number, speed: number) {
		const queryResponse = await fetch(
			`${this.host}/audio_query?text=${encodeURIComponent(sentence)}&speaker=${voiceId}`,
			{
				method: 'POST',
			},
		)

		if (!queryResponse.ok) {
			throw new Error(
				`VoiceVox audio_query failed: HTTP ${queryResponse.status}`,
			)
		}

		const query = await queryResponse.json()

		query.speedScale = speed

		const synthesisResponse = await fetch(
			`${this.host}/synthesis?speaker=${voiceId}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(query),
			},
		)

		if (!synthesisResponse.ok) {
			throw new Error(
				`VoiceVox synthesis failed: HTTP ${synthesisResponse.status}`,
			)
		}

		return synthesisResponse.blob()
	}

	private async playBlob(blob: Blob) {
		const url = URL.createObjectURL(blob)
		const audio = new Audio(url)

		this.currentAudio = audio

		try {
			await audio.play()

			await new Promise<void>((resolve, reject) => {
				this.currentResolve = resolve

				audio.addEventListener(
					'ended',
					() => {
						if (this.currentAudio === audio) {
							this.currentAudio = null
							this.currentResolve = null
						}

						URL.revokeObjectURL(url)
						resolve()
					},
					{once: true},
				)

				audio.addEventListener(
					'error',
					() => {
						if (this.currentAudio === audio) {
							this.currentAudio = null
							this.currentResolve = null
						}

						URL.revokeObjectURL(url)
						reject(new Error('Audio playback failed'))
					},
					{once: true},
				)
			})
		} catch (error) {
			if (this.currentAudio === audio) {
				this.currentAudio = null
				this.currentResolve = null
			}

			URL.revokeObjectURL(url)
			throw error
		}
	}

	private stop() {
		if (!this.currentAudio) {
			return
		}

		this.currentAudio.pause()
		this.currentAudio.currentTime = 0

		this.currentAudio = null

		const resolve = this.currentResolve
		this.currentResolve = null

		resolve?.()
	}

	private getCacheKey(sentence: string, voiceId: number, speed: number) {
		return `${voiceId}:${speed}:${sentence}`
	}

	getRandomVoiceId() {
		const styles = this.speakers.flatMap((speaker) => speaker.styles)

		if (styles.length === 0) {
			throw new Error('VoiceVox has no available voices')
		}

		return styles[Math.floor(Math.random() * styles.length)].id
	}

	getVoiceTitles() {
		const titles: string[] = []

		for (const speaker of this.speakers) {
			for (const style of speaker.styles) {
				titles[style.id] = `${speaker.name} - ${style.name}`
			}
		}

		return titles
	}

	getVoiceTitleFromId(voiceId: number) {
		return this.getVoiceTitles()[voiceId]
	}
}

export const voicevox = new VoiceVoxClient()
