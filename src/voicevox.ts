import {ReactiveController, state} from '@snar/lit'
import {VOICEVOX_DEFAULT_HOST} from './constants.js'
import toast from 'toastit'

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
	private currentAudios = new Map<
		string,
		{
			audio: HTMLAudioElement
			resolve: () => void
		}
	>()

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

	async play(sentence: string, voiceId: number, speed: number, volume = 1) {
		if (this.state !== 'connected') {
			throw new Error('VoiceVox is not connected')
		}

		toast(this.getVoiceTitleFromId(voiceId))

		const key = this.getCacheKey(sentence, voiceId, speed)

		this.stop(key)

		let cached = this.cache.get(key)

		if (!cached) {
			const promise = this.fetchAudio(sentence, voiceId, speed)

			this.cache.set(key, promise)

			try {
				const audio = await promise
				this.cache.set(key, audio)

				await this.playBlob(audio, key, volume)
			} catch (error) {
				this.cache.delete(key)
				throw error
			}

			return
		}

		const audio = cached instanceof Promise ? await cached : cached

		this.cache.set(key, audio)

		await this.playBlob(audio, key, volume)
	}

	async togglePlay(
		sentence: string,
		voiceId: number,
		speed: number,
		volume = 1,
	) {
		if (this.currentAudios.size > 0) {
			this.stop()
			return
		}

		return this.play(sentence, voiceId, speed, volume)
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

	private async playBlob(blob: Blob, key: string, volume: number) {
		const url = URL.createObjectURL(blob)
		const audio = new Audio(url)

		audio.volume = Math.max(0, Math.min(1, volume))

		this.currentAudios.set(key, {
			audio,
			resolve: () => {},
		})

		console.log(audio.volume)

		try {
			await audio.play()

			await new Promise<void>((resolve, reject) => {
				const current = this.currentAudios.get(key)

				if (current?.audio === audio) {
					current.resolve = resolve
				}

				audio.addEventListener(
					'ended',
					() => {
						if (this.currentAudios.get(key)?.audio === audio) {
							this.currentAudios.delete(key)
						}

						URL.revokeObjectURL(url)
						resolve()
					},
					{once: true},
				)

				audio.addEventListener(
					'error',
					() => {
						if (this.currentAudios.get(key)?.audio === audio) {
							this.currentAudios.delete(key)
						}

						URL.revokeObjectURL(url)
						reject(new Error('Audio playback failed'))
					},
					{once: true},
				)
			})
		} catch (error) {
			if (this.currentAudios.get(key)?.audio === audio) {
				this.currentAudios.delete(key)
			}

			URL.revokeObjectURL(url)
			throw error
		}
	}

	private stop(key?: string) {
		if (key) {
			const current = this.currentAudios.get(key)

			if (!current) {
				return
			}

			current.audio.pause()
			current.audio.currentTime = 0

			this.currentAudios.delete(key)
			current.resolve()

			return
		}

		for (const current of this.currentAudios.values()) {
			current.audio.pause()
			current.audio.currentTime = 0
			current.resolve()
		}

		this.currentAudios.clear()
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
