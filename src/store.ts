import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import toast from 'toastit'
import {clickAudio} from './assets/assets.js'
import {availablePages} from './constants.js'
import {Page} from './pages/index.js'
import {mainPage} from './pages/page-main.js'
import {generateHash, sleep} from './utils.js'

@saveToLocalStorage('text-selector:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() input = ''
	@state() inputHash = ''

	@state() startIndex = 0
	@state() endIndex = 0

	@state() fontSizePx = 31
	@state() fontWeight = 500

	@state() verticalPadding = 1

	@state() mostHighlightedOpenInSameTab = false

	@state() audioVolume = 0.3

	@state() geminiApiKey = ''

	@state() breakSentences = false

	F = new FormBuilder(this)

	protected async updated(changed: PropertyValues<this>) {
		// const {hash, router} = await import('./router.js')
		if (changed.has('page')) {
			// import('./router.js').then(({router}) => {
			// 	router.hash.$('page', this.page)
			// })
			const page = availablePages.includes(this.page) ? this.page : '404'
			import(`./pages/page-${page}.ts`)
				.then(() => {
					console.log(`Page ${page} loaded.`)
				})
				.catch(() => {})
		}

		if (changed.has('input')) {
			const oldInput = changed.get('input')
			if (oldInput !== undefined && oldInput !== this.input) {
				// TODO: Create a hash map for index history
				this.startIndex = 0
				this.endIndex = 0
				// this.endIndex = this.input.length - 1
			}

			generateHash(this.input).then((hash) => {
				this.inputHash = hash
				toast(hash)
			})
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

	firstUpdated() {
		// const params = new URLSearchParams(location.search)
		// // const input = params.get('input')
		// if (params.has('input')) {
		// 	const input = params.get('input')!.replace(/\n{2,}/g, '\n')
		// 	if (input !== this.input) {
		// 		this.input = input
		// 	}
		// 	// // store.input = params.get('input')!.replace(/\n{2,}/g, '\n')
		// 	// console.log(params.get('input'), this.input)
		// }

		/*
		 * Initial highlight (based on the hash)
		 */
		if (location.hash.slice(1)) {
			// Defer to make sure the initial update has finished updating the indexes if the input is new.
			sleep(50).then(() => {
				const hash = decodeURIComponent(location.hash.slice(1))
				const found = this.input.indexOf(hash)
				if (found > -1) {
					this.startIndex = found
					this.endIndex = found + hash.length - 1
					mainPage.highlighter.highlight(this.startIndex, this.endIndex)
					// window.location.hash = ''
					window.history.replaceState(
						null,
						document.title,
						window.location.pathname + window.location.search,
					)
				}
			})
		}
	}
}

export const store = new AppStore()
