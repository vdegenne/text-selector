import {ReactiveController} from '@snar/lit'
import {Debouncer} from '@vdegenne/debouncer'
import {store} from './store.js'

class IndexesHistoryController extends ReactiveController {
	saveComplete: Promise<void> = Promise.resolve()

	loadHighlightIndexesHistory(): {[hash: string]: [number, number]} {
		try {
			const value = localStorage.getItem('text-selector:indexes-history')
			return value ? JSON.parse(value) : {}
		} catch {
			return {}
		}
	}

	private async saveIndexes(start: number, end: number) {
		const hash = await store.getInputHash()

		const history = this.loadHighlightIndexesHistory()
		const current = history[hash]

		if (!current || current[0] !== start || current[1] !== end) {
			console.log(`SAVING INDEXES (${start} / ${end})`)

			history[hash] = [start, end]

			const entries = Object.entries(history)
			if (entries.length > 100) {
				const excess = entries.length - 100

				for (let i = 0; i < excess; i++) {
					delete history[entries[i][0]]
				}
			}

			localStorage.setItem(
				'text-selector:indexes-history',
				JSON.stringify(history),
			)
		}
	}

	updateSaveDebouncerTime(timeoutMs: number) {
		return (this.saveHighlightIndexes = new Debouncer(
			async (start: number, end: number) => {
				this.saveComplete = this.saveIndexes(start, end)
				await this.saveComplete
			},
			timeoutMs,
			{throwOnCancel: false},
		))
	}
	saveHighlightIndexes = this.updateSaveDebouncerTime(500)

	async getHighlightIndexes(): Promise<[number, number] | undefined> {
		const hash = await store.getInputHash()
		return this.loadHighlightIndexesHistory()[hash]
	}
}

export const indexesHistory = new IndexesHistoryController()
