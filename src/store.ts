import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import toast from 'toastit'
import {clickAudio} from './assets/assets.js'
import {availablePages, fontFamily, FontValue, NEW_LINE} from './constants.js'
import {cleanInput, findSubarray} from './functions.js'
import {indexesHistory} from './indexesHistory.js'
import {Page} from './pages/index.js'
import {mainPage} from './pages/page-main.js'
import {stateless} from './stateless.js'
import {breakSentence, splitLetters} from './text-logic.js'
import {generateHash} from './utils.js'

@saveToLocalStorage('text-selector:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() input = ''
	@state() inputHash = ''

	// @state() startIndex = 0
	// @state() endIndex = 0

	@state() font: FontValue = 'Noto Serif JP'
	@state() fontSizePx = 31
	@state() fontWeight = 500

	@state() lineVerticalPaddingPx = 12

	@state() verticalPadding = 1

	@state() mostHighlightedOpenInSameTab = false

	@state() audioVolume = 0.3

	@state() geminiApiKey = ''

	@state() breakSentences = false

	@state() repeaterInitialDelayMs = 300
	@state() repeaterIntervalMs = 30

	@state() loop = false

	@state() closeFullScreenOnWindowFocus = false
	@state() fullScreenShowHiragana = false

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

		if (changed.has('font')) {
			document.documentElement.style.setProperty(
				'--jp-font',
				`Roboto, '${this.font}'`,
			)
		}
		if (changed.has('fontSizePx')) {
			document.documentElement.style.setProperty(
				'--font-size-px',
				`${this.fontSizePx}px`,
			)
		}
		if (changed.has('fontWeight')) {
			document.documentElement.style.setProperty(
				'--font-weight',
				this.fontWeight + '',
			)
		}

		if (changed.has('lineVerticalPaddingPx')) {
			document.documentElement.style.setProperty(
				'--line-vertical-padding-px',
				`${this.lineVerticalPaddingPx}px`,
			)
		}

		if (changed.has('audioVolume')) {
			if (clickAudio) {
				clickAudio.volume = this.audioVolume
			}
		}

		if (
			changed.has('repeaterInitialDelayMs') ||
			changed.has('repeaterIntervalMs')
		) {
			indexesHistory.updateSaveDebouncerTime(this.repeaterInitialDelayMs + 10)
			const {
				leftPrevRepeater,
				leftNextRepeater,
				rightPrevRepeater,
				rightNextRepeater,
				rightUpRepeater,
				rightDownRepeater,
				upRepeater,
				downRepeater,
			} = await import('./gamepad-repeaters.js')
			leftPrevRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			leftPrevRepeater.options.intervalMs = this.repeaterIntervalMs
			leftNextRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			leftNextRepeater.options.intervalMs = this.repeaterIntervalMs

			rightPrevRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			rightPrevRepeater.options.intervalMs = this.repeaterIntervalMs
			rightNextRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			rightNextRepeater.options.intervalMs = this.repeaterIntervalMs

			rightUpRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			rightUpRepeater.options.intervalMs = this.repeaterIntervalMs
			rightDownRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			rightDownRepeater.options.intervalMs = this.repeaterIntervalMs

			upRepeater.options.initialDelayMs = this.repeaterInitialDelayMs
			downRepeater.options.intervalMs = this.repeaterIntervalMs / 0.5
		}

		if (changed.has('loop')) {
			mainPage.highlighter.setLoop(this.loop)
		}
	}

	async firstUpdated() {
		const params = new URLSearchParams(location.search)
		if (params.has('input')) {
			const rawInput = params.get('input')!
			console.log('RAW INPUT', rawInput.split(''))

			const cleanedInput = cleanInput(rawInput)
			stateless.cleanLetters = splitLetters(cleanedInput)
			console.log(
				'CLEAN INPUT',
				stateless.cleanLetters.map((c) => (c === NEW_LINE ? 'NEW_LINE' : c)),
			)

			const finalInput = breakSentence(cleanedInput, {
				breakPunctuations: this.breakSentences,
			})
			stateless.finalLetters = splitLetters(finalInput)
			console.log(
				'FINAL INPUT',
				stateless.finalLetters.map((c) => (c === NEW_LINE ? 'NEW_LINE' : c)),
			)

			console.log(stateless)

			if (finalInput !== this.input) {
				this.input = finalInput
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
			const hashLetters = splitLetters(hash)
			const found = findSubarray(stateless.cleanLetters, hashLetters)
			if (found > -1) {
				// this.startIndex = found
				// this.endIndex = found + hash.length - 1
				const start = found
				const end = found + hashLetters.length - 1
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

	cycleThroughFontFamilies() {
		const index = fontFamily.indexOf(this.font)
		const next = (index + 1) % fontFamily.length
		const font = fontFamily[next]
		this.font = font
		toast(font)
	}
}

export const store = new AppStore()
