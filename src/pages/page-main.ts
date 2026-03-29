import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import {HighLightManager} from '../HighlightManager.js'
import {store} from '../store.js'
import {
	getLineIndexFromCharIndex,
	getLineStartIndex,
	getTextInfo,
	getWordBounds,
} from '../utils.js'
import {PageElement} from './PageElement.js'
import {chatGptMediatorOpen} from '@vdegenne/links'

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
	highlighter = new HighLightManager('.letter')

	@query('.letter[selected]') firstSelectedCharacter!: HTMLDivElement

	constructor() {
		super()
		mainPage = this
	}

	render() {
		const lines = store.input.split('\n').filter((l) => l)
		return html`<!---->
			<div class="p-7 text-3xl leading-normal mb-48 max-w-4xl w-full mx-auto">
				${lines.map((line, i) => {
					return html`<!-- -->
						<div class="flex items-center gap-3">
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
		this.highlighter.highlightWhenAvailable(0)
	}

	highlightWordUnderCursor() {
		const info = this.highlighter.getInfo()
		const {start, end} = getWordBounds(
			store.input.replaceAll('\n', ' '),
			info.highlightIndexStart,
		)
		this.highlighter.highlight(start, end)
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
				Math.min(prevLine.length, currLine.cursorIndex ?? 9999999999),
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
				Math.min(nextLine.length, currLine.cursorIndex ?? 9999999999),
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
			chatGptMediatorOpen(highlightContent)
			// document.dispatchEvent(
			// 	new CustomEvent('open-chatgpt-selector', {
			// 		bubbles: true,
			// 		detail: {
			// 			value: highlightContent,
			// 		},
			// 	}),
			// )
		}
	}
}

export let mainPage: PageMain
