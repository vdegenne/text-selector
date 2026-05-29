import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {availablePages} from './constants.js'
import {Page} from './pages/index.js'
import {generateHash} from './utils.js'
import toast from 'toastit'

@saveToLocalStorage('text-selector:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() input = ''
	@state() inputHash = ''

	@state() startIndex = 0
	@state() endIndex = 0

	@state() verticalPadding = 1

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
				this.startIndex = 0
				this.endIndex = 0
				// this.endIndex = this.input.length - 1
			}

			generateHash(this.input).then((hash) => {
				this.inputHash = hash
				toast(hash)
			})
		}
	}

	firstUpdated() {
		const params = new URLSearchParams(location.search)
		// const input = params.get('input')
		if (params.has('input')) {
			const input = params.get('input')!.replace(/\n{2,}/g, '\n')
			if (input !== this.input) {
				this.input = input
			}
			// // store.input = params.get('input')!.replace(/\n{2,}/g, '\n')
			// console.log(params.get('input'), this.input)
		}
	}
}

export const store = new AppStore()
