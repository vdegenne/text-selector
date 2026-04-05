import {withController} from '@snar/lit'
import {chatGptMediatorOpen, chatGptMediatorUrl} from '@vdegenne/links'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import toast from 'toastit'
import {HighLightManager} from '../HighlightManager.js'
import {store} from '../store.js'
import {copyToClipboard, getTextInfo, getWordBounds} from '../utils.js'
import {PageElement} from './PageElement.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

@customElement('page-main')
@withController(store)
@withStyles(css`
	:host {
	}

	.letter[highlight1] {
		background-color: #caca00;
		background-color: var(--md-sys-color-primary);
		color: #ff0000;
		color: #ab9a00;
	}
`)
export class PageMain extends PageElement {
	highlighter = new HighLightManager('.letter', {
		onSelectionChange(info) {
			store.startIndex = info.highlightIndexStart
			store.endIndex = info.highlightIndexEnd
		},
	})

	@query('.letter[selected]') firstSelectedCharacter!: HTMLDivElement

	render() {
		const lines = store.input.split('\n').filter((l) => l)
		return html`<!---->
			${!store.input
				? html`<!---->
						<div class="m-12">
							Use ?input=${'<your-text>'} in the url (then use your controller
							to navigate)
						</div>
						<!---->`
				: null}
			<div
				class="p-7 text-3xl leading-normal mb-48 max-w-4xl w-full mx-auto box-border"
			>
				${lines.map((line, i) => {
					return html`<!-- -->
						<div
							class="flex items-center gap-5 py-3"
							style="border-bottom: 1px solid var(--md-sys-color-outline-variant)"
						>
							<span class="text-(--md-sys-color-outline) text-sm">#${i}</span>
							<div>
								${line.split('').map((letter) => {
									return html`<!-- --><span class="letter">${letter}</span
										><!-- -->`
								})}
								${i !== lines.length - 1
									? html`<span class="letter"></span>`
									: null}
							</div>
						</div>
						<!-- -->`
				})}
			</div>
			<!----> `
	}

	firstUpdated() {
		console.log(store.startIndex, store.endIndex)
		this.highlighter.highlight(store.startIndex, store.endIndex)
	}

	highlightWordUnderCursor() {
		const info = this.highlighter.getInfo()
		const {start, end} = getWordBounds(
			store.input.replaceAll('\n', ' '),
			info.highlightIndexStart,
		)
		this.highlighter.highlight(start, end)
	}

	selectAll() {
		this.highlighter.highlight(0, store.input.length)
	}

	previousLine() {
		const {highlightIndexStart} = this.highlighter.getInfo()
		const {currentLineIndex, previousLineIndex, lines} = getTextInfo(
			store.input,
			{
				cursorPosition: highlightIndexStart,
			},
		)
		const currLine = lines[currentLineIndex]
		const prevLine = lines[previousLineIndex]
		this.highlighter.highlight(
			prevLine.firstCharIndex +
				Math.min(prevLine.length - 1, currLine.cursorIndex ?? 9999999999),
		)
		// if (highlightIndexStart >= 0) {
		// 	const {currentLineIndex} = getTextInfo(store.input, {
		// 		cursorPosition: highlightIndexStart,
		// 	})
		// 	// const currentLineIndex = getLineIndexFromCharIndex(
		// 	// 	store.input,
		// 	// 	highlightIndexStart,
		// 	// )
		// 	if (currentLineIndex > 0) {
		// 		const nextLineIndex = currentLineIndex - 1
		// 		const nextLineFirstCharIndex = getLineStartIndex(
		// 			store.input,
		// 			nextLineIndex,
		// 		)
		// 		if (nextLineFirstCharIndex >= 0) {
		// 			this.highlighter.highlight(nextLineFirstCharIndex)
		// 		}
		// 	}
		// }
	}

	nextLine() {
		const {highlightIndexStart} = this.highlighter.getInfo()
		const {currentLineIndex, nextLineIndex, lines} = getTextInfo(store.input, {
			cursorPosition: highlightIndexStart,
		})
		const currLine = lines[currentLineIndex]
		const nextLine = lines[nextLineIndex]
		this.highlighter.highlight(
			nextLine.firstCharIndex +
				Math.min(nextLine.length - 1, currLine.cursorIndex ?? 9999999999),
		)
		// if (highlightIndexStart >= 0) {
		// 	const currentLineIndex = getLineIndexFromCharIndex(
		// 		store.input,
		// 		highlightIndexStart,
		// 	)
		// 	console.log(currentLineIndex)
		// 	if (currentLineIndex >= 0) {
		// 		const nextLineIndex = currentLineIndex + 1
		// 		const nextLineFirstCharIndex = getLineStartIndex(
		// 			store.input,
		// 			nextLineIndex,
		// 		)
		// 		if (nextLineFirstCharIndex >= 0) {
		// 			this.highlighter.highlight(nextLineFirstCharIndex)
		// 		}
		// 	}
		// }
	}

	openFullScreener() {
		return
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			document.dispatchEvent(
				new CustomEvent('open-fullscreener', {
					bubbles: true,
					detail: {
						value: highlightContent,
					},
				}),
			)
		}
	}

	openChatGPTSelector() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			window.location.href = chatGptMediatorUrl(highlightContent)
			// chatGptMediatorOpen(highlightContent)
		}
	}

	addCurrentSelectionToJpSynDex() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			document.dispatchEvent(
				new CustomEvent('add-jpsyndex-item', {
					bubbles: true,
					detail: {
						word: highlightContent,
					},
				}),
			)
		}
	}

	copySelectionToClipBoard() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			copyToClipboard(highlightContent)
			toast(highlightContent)
		}
	}

	openCNRTL() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			window.open(
				`https://www.cnrtl.fr/definition/${encodeURIComponent(highlightContent)}`,
				'_blank',
			)
		}
	}
}

export let mainPage = new PageMain()
mainPage.active = true
