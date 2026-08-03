import {Debouncer} from '@vdegenne/debouncer'
import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import toast from 'toastit'
import {clickAudio} from './assets/assets.js'
import {availablePages} from './constants.js'
import {Page} from './pages/index.js'
import {mainPage} from './pages/page-main.js'
import {breakSentence} from './text-logic.js'
import {generateHash, sleep} from './utils.js'
import {indexesHistory} from './indexesHistory.js'

@saveToLocalStorage('text-selector:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() input = ''
	@state() inputHash = ''

	// @state() startIndex = 0
	// @state() endIndex = 0

	@state() fontSizePx = 31
	@state() fontWeight = 500

	@state() verticalPadding = 1

	@state() mostHighlightedOpenInSameTab = false

	@state() audioVolume = 0.3

	@state() geminiApiKey = ''

	@state() breakSentences = false

	@state() favorites: string[] = []
	toggleFavorite(item: string) {
		if (this.favorites.includes(item)) {
			this.favorites.splice(this.favorites.indexOf(item), 1)
			toast('Removed from favorites')
		} else {
			this.favorites.push(item)
			toast('Added to favorites')
		}

		this.favorites = [...this.favorites]
	}

	#inputHash: string | undefined
	async getInputHash(options?: {refresh?: boolean}) {
		if (!this.#inputHash || options?.refresh) {
			return (this.#inputHash = await generateHash(this.input))
		}
		return this.#inputHash
	}
	// highlightIndexesHistory: {[hash: string]: [number, number]} = {}
	// saveHighlightIndexes = new Debouncer(
	// 	async (start: number, end: number) => {
	// 		const hash = await this.getInputHash()
	// 		const history = this.highlightIndexesHistory[hash]
	//
	// 		if (!history || history[0] !== start || history[1] !== end) {
	// 			console.log(`SAVING INDEXES (${start} / ${end})`)
	//
	// 			this.highlightIndexesHistory[hash] = [start, end]
	//
	// 			const entries = Object.entries(this.highlightIndexesHistory)
	// 			if (entries.length > 100) {
	// 				const excess = entries.length - 100
	//
	// 				for (let i = 0; i < excess; i++) {
	// 					delete this.highlightIndexesHistory[entries[i][0]]
	// 				}
	// 			}
	// 		}
	// 	},
	// 	500,
	// 	{throwOnCancel: false},
	// )
	// async getHighlightIndexes() {
	// 	return this.highlightIndexesHistory[await this.getInputHash()]
	// }

	F = new FormBuilder(this)

	protected async updated(changed: PropertyValues<this>) {
		let pagePromise = Promise.resolve()

		if (changed.has('page')) {
			const page = availablePages.includes(this.page) ? this.page : '404'
			pagePromise = import(`./pages/page-${page}.ts`)
				// .then(() => console.log(`Page ${page} loaded.`))
				.catch(() => {})
		}

		if (changed.has('input')) {
			// We generate a new hash for external consumers
			this.getInputHash({refresh: true}).then((hash) => {
				console.log('HASH GENERATED', hash)
			})

			// const oldInput = changed.get('input')
			// if (oldInput !== undefined && oldInput !== this.input) {
			// 	// TODO: Create a hash map for index history
			// 	// Take the values from the history
			// 	this.startIndex = 0
			// 	this.endIndex = 0
			// 	// this.endIndex = this.input.length - 1
			// }

			// generateHash(this.input).then((hash) => {
			// 	this.inputHash = hash
			// 	this.#inputHash
			// 	toast(hash)
			// })
		}

		if (changed.has('fontSizePx')) {
			mainPage.style.setProperty('--font-size-px', `${this.fontSizePx}px`)
		}
		if (changed.has('fontWeight')) {
			mainPage.style.setProperty('--font-weight', this.fontWeight + '')
		}

		if (changed.has('audioVolume')) {
			if (clickAudio) {
				clickAudio.volume = this.audioVolume
			}
		}
	}

	async firstUpdated() {
		const params = new URLSearchParams(location.search)
		if (params.has('input')) {
			const inputParam = params.get('input')!.replace(/\n{2,}/g, '\n')
			const input = this.breakSentences ? breakSentence(inputParam) : inputParam
			if (input !== this.input) {
				this.input = input
			}
		}

		/*
		 * Initial highlight (based on the hash)
		 */
		if (location.hash.slice(1) && this.page === 'main') {
			// Defer to make sure the initial update has finished updating the indexes if the input is new.
			await this.updateComplete
			// sleep(100).then(() => {
			const hash = decodeURIComponent(location.hash.slice(1))
			const found = this.input.indexOf(hash)
			if (found > -1) {
				// this.startIndex = found
				// this.endIndex = found + hash.length - 1
				const start = found
				const end = found + hash.length - 1
				indexesHistory.saveHighlightIndexes.call(start, end)
				console.log(
					'INTIAL HIGHLIGHT LOCATIONS FOUND IN THE HASH',
					hash,
					found,
					found + hash.length - 1,
				)
				mainPage.highlighter.highlight(start, end)
				// window.location.hash = ''
				window.history.replaceState(
					null,
					document.title,
					window.location.pathname + window.location.search,
				)
			}
			// })
		}
	}
}

export const store = new AppStore()
