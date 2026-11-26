import { Kuromoji } from '@vdegenne/kuromoji'

type WorkerRequest =
	| { type: 'init'; options: ConstructorParameters<typeof Kuromoji>[0] }
	| { type: 'toHiragana'; id: number; text: string }

const scope = self as unknown as {
	onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
	postMessage(message: unknown): void
}

let kuromoji: Kuromoji | undefined

scope.onmessage = async function (event: MessageEvent<WorkerRequest>) {
	const message = event.data

	try {
		if (message.type === 'init') {
			kuromoji = new Kuromoji({
				...message.options,
				preload: true,
				onProgress(progress) {
					scope.postMessage({ type: 'progress', progress })
				},
			})

			await kuromoji.ready
			scope.postMessage({ type: 'ready' })
			return
		}

		if (!kuromoji) {
			throw new Error('Kuromoji has not been initialized.')
		}

		const result = await kuromoji.toHiragana(message.text)

		scope.postMessage({
			type: 'result',
			id: message.id,
			result,
		})
	} catch (error) {
		scope.postMessage({
			type: 'error',
			id: 'id' in message ? message.id : undefined,
			error: error instanceof Error ? error.message : String(error),
		})
	}
}
