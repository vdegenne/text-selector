import {MdDialog} from '@material/web/all.js'
import {Debouncer} from '@vdegenne/debouncer'
import {customElement} from 'custom-element-decorator'
import {SS} from 'html-vision/ss.js'
import {css, html, LitElement, PropertyValues} from 'lit'
import {withStyles} from 'lit-with-styles'
import {property, query, state} from 'lit/decorators.js'
import {jpsyndexAPI} from './api.js'
import {getFontSize} from './functions.js'
import {mainPage} from './pages/page-main.js'
import {RemoteInfo, stateless} from './stateless.js'
import {store} from './store.js'

@customElement({name: 'fullscreen-element', inject: true})
@withStyles()
class FullscreenElement extends LitElement {
	@property({type: Boolean}) open = false
	@state() input = ''
	@state() collections: RemoteInfo['collections']
	@state() hiragana: RemoteInfo['hiragana']

	@query('md-dialog') dialog!: MdDialog

	protected render() {
		return html`<!-- -->
			<md-dialog
				?quick="${false}"
				?open="${this.open}"
				@closed="${() => (this.open = false)}"
				style="min-width: calc(100vw - 0px); min-height: calc(100vh - 0px); --md-dialog-container-color: var(--md-sys-color-surface-container);"
			>
				<div slot="content" class="flex-1 flex flex-col">
					<div></div>
					<div
						class="flex-1 flex flex-col gap-2 items-center justify-center jp"
					>
						<span
							style="font-size:${getFontSize(this.input)}px;"
							class="leading-normal"
							>${this.input}</span
						>
						<span class="text-xl">${this.hiragana}</span>
					</div>
					<div></div>
				</div>
			</md-dialog>
			<!-- -->`
	}

	protected firstUpdated(): void {
		new SS(
			css`
				.content {
					display: flex;
					flex-direction: column;
				}
			`,
			this.dialog.shadowRoot!,
		)
	}

	updated(changed: PropertyValues<this>) {
		if (changed.has('open')) {
			if (this.open)
				document.documentElement.setAttribute('hide-scrollbar', undefined)
			else document.documentElement.removeAttribute('hide-scrollbar')
		}
	}

	show(input?: string) {
		this.updateRemoteInfo.call(input ?? this.input)

		this.open = true
	}

	private infoPromises = new Map<string, Promise<RemoteInfo>>()

	async #fetchInfo(query: string): Promise<RemoteInfo> {
		const info = (stateless.remoteInfoMap[query] ??= {})

		const tasks: Promise<void>[] = []

		if (!info.collections) {
			tasks.push(
				jpsyndexAPI
					.get(`/search/${encodeURIComponent(query)}` as '/search/:word')
					.then(async ({response}) => {
						if (!response.ok) throw 0

						info.collections = await response.text()
					})
					.catch(() => {}),
			)
		}

		if (!info.hiragana) {
			tasks.push(
				jpsyndexAPI
					.get(`/hiragana/${encodeURIComponent(query)}` as '/hiragana/:query')
					.then(async ({response}) => {
						if (!response.ok) throw 0

						const map = await response.json()

						if (!map[query]) throw 0

						info.hiragana = map[query]
					})
					.catch(() => {}),
			)
		}

		await Promise.all(tasks)

		return info
	}

	async getInfo(query: string): Promise<RemoteInfo> {
		const info = stateless.remoteInfoMap[query]

		if (info?.collections && info.hiragana) {
			return info
		}

		const existing = this.infoPromises.get(query)

		if (existing) {
			return existing
		}

		const promise = this.#fetchInfo(query)

		this.infoPromises.set(query, promise)

		try {
			return await promise
		} finally {
			this.infoPromises.delete(query)
		}
	}

	private remoteInfoRequestId = 0

	updateRemoteInfo = new Debouncer(
		async (query: string) => {
			this.input = query
			this.collections = ''
			this.hiragana = ''
			mainPage.special = false

			if (!query) return

			const requestId = ++this.remoteInfoRequestId

			const info = await this.getInfo(query)

			if (requestId !== this.remoteInfoRequestId) {
				return
			}

			if (info.collections) {
				mainPage.special = true
				this.collections = info.collections
			}

			if (info.hiragana) {
				this.hiragana = info.hiragana
			} else {
			}
		},
		store.repeaterInitialDelayMs + 100,
		{throwOnCancel: false},
	)
}

export const fullscreenElement = new FullscreenElement()
