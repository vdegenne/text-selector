import {withController} from '@snar/lit'
import {chatGptMediatorOpen} from '@vdegenne/links'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import toast from 'toastit'
import {playClick} from '../assets/assets.js'
import {HighLightManager} from '../HighlightManager.js'
import {store} from '../store.js'
import {
	copyToClipboard,
	getTextInfo,
	getWordBounds,
	isInViewport,
} from '../utils.js'
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
		background-color: var(--md-sys-color-primary-container);
		background-color: var(--md-sys-color-secondary-container);
		background-color: var(--md-sys-color-outline);
		color: #ff0000;
		color: #ab9a00;
		color: var(--md-sys-color-on-primary-container);
		color: var(--md-sys-color-on-secondary-container);
		color: var(--md-sys-color-inverse-on-surface);
	}
`)
export class PageMain extends PageElement {
	@query('.letter[highlight1]') firstHighlightedLetter?: HTMLDivElement

	firstTime = true

	highlighter = new HighLightManager('.letter', {
		onSelectionChange: async (info) => {
			playClick()
			store.startIndex = info.highlightIndexStart
			store.endIndex = info.highlightIndexEnd

			await this.updateComplete
			if (
				this.firstHighlightedLetter &&
				!isInViewport(this.firstHighlightedLetter)
			) {
				if (this.firstTime) {
					this.firstHighlightedLetter.scrollIntoView({
						block: 'center',
						inline: 'center',
						behavior: 'smooth',
					})
					this.firstTime = false
				}
			}
		},
	})

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
				class="p-7 text-3xl leading-normal mb-48 max-w-6xl w-full mx-auto box-border"
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
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		if (highlightIndexStart !== highlightIndexEnd) {
			this.highlighter.highlight(highlightIndexStart, highlightIndexStart)
			return
		}

		const anchor = highlightIndexStart

		const textInfo = getTextInfo(store.input, {
			cursorPosition: anchor,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]
		const prevLine = lines[Math.max(0, currentLineIndex - 1)]

		const col = anchor - currLine.firstCharIndex
		const safeCol = Math.min(col, prevLine.length)

		const target = prevLine.firstCharIndex + safeCol

		this.highlighter.highlight(target, target)
	}

	nextLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		if (highlightIndexStart !== highlightIndexEnd) {
			this.highlighter.highlight(highlightIndexEnd, highlightIndexEnd)
			return
		}

		const anchor = highlightIndexEnd

		const textInfo = getTextInfo(store.input, {
			cursorPosition: anchor,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]
		const nextLine = lines[Math.min(lines.length - 1, currentLineIndex + 1)]

		const col = anchor - currLine.firstCharIndex
		const safeCol = Math.min(col, nextLine.length)

		const target = nextLine.firstCharIndex + safeCol

		this.highlighter.highlight(target, target)
	}

	moveSelectionStartToPreviousLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		const textInfo = getTextInfo(store.input, {
			cursorPosition: highlightIndexStart,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const isAtLineStart = highlightIndexStart === currLine.firstCharIndex

		const targetLineIndex = isAtLineStart
			? Math.max(0, currentLineIndex - 1)
			: currentLineIndex

		const target = lines[targetLineIndex].firstCharIndex

		this.highlighter.highlight(target, highlightIndexEnd)
	}

	moveSelectionStartToNextLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		const textInfo = getTextInfo(store.input, {
			cursorPosition: highlightIndexStart,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const isAtLineStart = highlightIndexStart === currLine.firstCharIndex

		const targetLineIndex = isAtLineStart
			? Math.min(lines.length - 1, currentLineIndex + 1)
			: currentLineIndex

		const target = lines[targetLineIndex].firstCharIndex

		if (target > highlightIndexEnd) {
			return
		}

		this.highlighter.highlight(target, highlightIndexEnd)
	}

	moveSelectionEndToPreviousLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		const textInfo = getTextInfo(store.input, {
			cursorPosition: highlightIndexEnd,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const lineEnd = currLine.firstCharIndex + currLine.length - 1

		const isAtLineEnd = highlightIndexEnd === lineEnd

		const targetLineIndex = isAtLineEnd
			? Math.max(0, currentLineIndex - 1)
			: currentLineIndex

		const targetLine = lines[targetLineIndex]
		const target = targetLine.firstCharIndex + targetLine.length

		if (target < highlightIndexStart) {
			return
		}

		this.highlighter.highlight(highlightIndexStart, target - 1)
	}

	moveSelectionEndToNextLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		const textInfo = getTextInfo(store.input, {
			cursorPosition: highlightIndexEnd,
		})

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const isAtLineEnd =
			highlightIndexEnd === currLine.firstCharIndex + currLine.length - 1

		let targetLineIndex = currentLineIndex

		if (isAtLineEnd) {
			targetLineIndex = Math.min(lines.length - 1, currentLineIndex + 1)
		}

		const targetLine = lines[targetLineIndex]
		const target = targetLine.firstCharIndex + targetLine.length

		this.highlighter.highlight(highlightIndexStart, target - 1)
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
			// window.location.href = chatGptMediatorUrl(highlightContent)
			chatGptMediatorOpen(highlightContent)
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
