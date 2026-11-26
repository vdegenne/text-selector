import { ReactiveController, state } from '@snar/lit'
import { customElement } from 'custom-element-decorator'
import { HTMLTemplateResult, LitElement, TemplateResult, html } from 'lit'
import { withStyles } from 'lit-with-styles'
import { query } from 'lit/decorators.js'
import { StyleInfo, styleMap } from 'lit/directives/style-map.js'

// TODO: remove when official repo implements dialogs
import { DialogElement } from '@mahmoodkhalil/material-web-3-demo/labs/gb/components/dialog/dialog-element.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/dialog/md-gb-dialog.js'

interface DialogOptions {
	/**
	 * @default false
	 */
	quick: boolean
	/**
	 * Controller used to refresh the content when a value changes.
	 */
	ctrl: ReactiveController | ReactiveController[] | undefined

	/**
	 * Width in px
	 *
	 * @default 280
	 */
	width: number | undefined

	height: number | undefined

	/**
	 * @default {}
	 */
	style: StyleInfo

	/**
	 * @default Close
	 */
	closeButton: string | undefined

	/**
	 * @default undefined
	 */
	confirmButton:
		| Partial<{
				/**
				 * @default "Confirm"
				 */
				label: string | TemplateResult
				/**
				 * @default undefined
				 */
				onClick: ((dialog: Dialog) => void) | undefined

				/**
				 * @default false
				 */
				error: boolean
		  }>
		| undefined

	onOpen: ((dialog: Dialog) => void) | undefined
	onClose: (() => void) | undefined

	actions: ((dialog: Dialog) => TemplateResult) | HTMLTemplateResult | undefined

	/**
	 * @default true
	 */
	cancelable: boolean

	/**
	 * @default true
	 */
	removeOnClosed: boolean
}

@customElement({ name: 'content-dialog', inject: true })
@withStyles()
export class Dialog extends LitElement {
	@state() open = true
	#options: DialogOptions

	@query('dialog') dialogElement!: DialogElement

	constructor(
		public headline?: string | TemplateResult,
		public content?: string | TemplateResult | (() => string | TemplateResult),
		// public actions?: string | TemplateResult | (() => string | TemplateResult),
		options?: Partial<DialogOptions>,
	) {
		super()
		this.#options = {
			quick: false,
			ctrl: undefined,
			width: undefined,
			height: undefined,
			style: {},
			closeButton: 'Close',
			confirmButton: undefined,
			onOpen: undefined,
			onClose: undefined,
			actions: undefined,
			cancelable: true,
			removeOnClosed: true,
			...options,
		}

		if (this.#options.width) {
			const width = `min(calc(100vw - 12px), ${this.#options.width}px)`
			this.#options.style['--min-width'] = width
			this.#options.style['--max-width'] = width
		}

		if (this.#options.height) {
			this.#options.style.maxHeight = `min(calc(100vh - 12px), ${
				this.#options.height
			}px)`
			this.#options.style.height = '100%'
		}

		if (this.#options.confirmButton) {
			this.#options.confirmButton.label ??= 'Confirm'
			this.#options.confirmButton.error ??= false
		}

		if (this.#options.ctrl) {
			let ctrls = this.#options.ctrl
			if (!Array.isArray(ctrls)) {
				ctrls = [ctrls]
			}
			ctrls.forEach((ctrl) => ctrl.bind(this))
		}
	}

	get shouldRenderActions() {
		return (
			this.#options.actions !== undefined ||
			this.#options.closeButton !== undefined ||
			this.#options.confirmButton !== undefined
		)
	}

	render() {
		return html`<!-- -->
			<md-gb-dialog
				?quick="${this.#options.quick}"
				?open="${this.open}"
				@opened="${this.#onOpened}"
				@closed="${this.#onClosed}"
				style="${styleMap(this.#options.style)}"
				@cancel="${(event: Event) => {
					if (!this.#options.cancelable) {
						event.preventDefault()
					}
				}}"
			>
				<div slot="headline">${this.headline}</div>

				<!-- <div slot="content" class="overflow-hidden"> -->
				${typeof this.content === 'function' ? this.content?.() : this.content}
				<!-- </div> -->

				${
					this.shouldRenderActions
						? html`
								<div
									slot="actions"
									@click="${this.#onActionsClick}"
									class="w-full flex justify-end"
								>
									${
										this.#options.closeButton
											? html`<!-- -->
													<md-gb-button @click="${() => this.close()}"
														>${this.#options.closeButton}</md-gb-button
													>
													<!-- -->`
											: null
									}
									${
										this.#options.confirmButton
											? html`<!-- -->
													<md-gb-button
														@click="${() => {
															this.#options.confirmButton?.onClick?.(this)
														}}"
														?error="${this.#options.confirmButton.error}"
														>${this.#options.confirmButton.label}</md-gb-button
													>
													<!-- -->`
											: null
									}
									${
										typeof this.#options.actions === 'function'
											? this.#options.actions?.(this)
											: this.#options.actions
									}
								</div>
							`
						: null
				}
			</md-gb-dialog>
			<!-- -->`
	}

	#onActionsClick(event: PointerEvent) {
		const target = event.target as HTMLDivElement
		if (target.hasAttribute('close')) {
			this.close()
		}
	}

	#onClosed = (e: Event) => {
		// This avoids tooltips closing the dialog
		if (e.target !== e.currentTarget) return
		if (this.#options.removeOnClosed) {
			this.remove()
		}
		this.open = false
		this.#options.onClose?.()
	}

	#onOpened = (e: Event) => {
		if (e.target !== e.currentTarget) return
		this.renderRoot.querySelector<HTMLElement>('[autofocus]')?.focus()
		this.#options.onOpen?.(this)
	}

	show() {
		this.open = true
	}
	close() {
		this.open = false
	}

	$<K extends keyof HTMLElementTagNameMap>(selector: K) {
		return this.renderRoot.querySelector(selector)
	}

	scrollToBottom() {
		// @ts-ignore
		const scroller = this.dialogElement.scroller
		scroller!.scrollTop = scroller!.scrollHeight
	}
}
