import type { KuromojiOptions, KuromojiProgress } from '@vdegenne/kuromoji'

type WorkerResponse =
	| { type: 'ready' }
	| { type: 'progress'; progress: KuromojiProgress }
	| { type: 'result'; id: number; result: string }
	| { type: 'error'; id?: number; error: string }

export class Kuromoji {
	readonly ready: Promise<void>

	private worker: Worker
	private requestId = 0
	private pending = new Map<
		number,
		{ resolve: (result: string) => void; reject: (error: Error) => void }
	>()

	constructor(options: KuromojiOptions = {}) {
		this.worker = new Worker(new URL('./kuromoji.worker.ts', import.meta.url), {
			type: 'module',
		})
		console.count('[Kuromoji] Worker created')

		this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const message = event.data

			if (message.type === 'progress') {
				options.onProgress?.(message.progress)
				return
			}

			if (message.type === 'ready') {
				return
			}

			if (message.type === 'result' || message.type === 'error') {
				const pending = this.pending.get(message.id)

				if (!pending) return

				this.pending.delete(message.id)

				if (message.type === 'result') {
					pending.resolve(message.result)
				} else {
					pending.reject(new Error(message.error))
				}
			}
		}

		this.ready = new Promise<void>((resolve, reject) => {
			const previousHandler = this.worker.onmessage

			this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				previousHandler?.call(this.worker, event)

				if (event.data.type === 'ready') {
					resolve()
				} else if (event.data.type === 'error' && event.data.id === undefined) {
					reject(new Error(event.data.error))
				}
			}

			this.worker.postMessage({
				type: 'init',
				options: {
					...options,
					onProgress: undefined,
				},
			})
		})
	}

	toHiragana(text: string): Promise<string> {
		if (!text) return Promise.resolve(text)

		return new Promise((resolve, reject) => {
			const id = ++this.requestId

			this.pending.set(id, { resolve, reject })

			this.worker.postMessage({
				type: 'toHiragana',
				id,
				text,
			})
		})
	}

	terminate(): void {
		this.worker.terminate()

		for (const pending of this.pending.values()) {
			pending.reject(new Error('Kuromoji worker terminated.'))
		}

		this.pending.clear()
	}
}
