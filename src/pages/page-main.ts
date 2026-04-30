import {speakEnglish, speakFrench, speakJapanese} from '@vdegenne/speech'
import {withController} from '@snar/lit'
import {chatGptMediatorOpen} from '@vdegenne/links'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query, queryAll} from 'lit/decorators.js'
import toast from 'toastit'
import {playClick} from '../assets/assets.js'
import {HighLightManager} from '../HighlightManager.js'
import {store} from '../store.js'
import {
	copyToClipboard,
	getFirstVisibleElement,
	getLastVisibleElement,
	getTextInfo,
	getWordBoundaries,
	getWordBounds,
	isInViewport,
	isVisible,
	isWordChar,
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
	@queryAll('.letter') letterElements!: HTMLElement[]
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
				!isVisible(this.firstHighlightedLetter)
			) {
				// if (this.firstTime) {
				this.firstHighlightedLetter.scrollIntoView({
					block: 'center',
					inline: 'center',
					behavior: this.firstTime ? 'smooth' : 'instant',
				})
				this.firstTime = false
				// }
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
							class="flex items-center gap-5 py-1"
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

	previous() {
		const {highlightElement} = this.highlighter.getInfo()

		if (!isVisible(highlightElement)) {
			const letterElements = [...this.letterElements]
			const lastVisibleElement = getLastVisibleElement(letterElements)
			const index = letterElements.indexOf(lastVisibleElement)
			this.highlighter.highlight(index - 1)
			return
		}

		this.highlighter.previous()
	}

	next() {
		const {highlightElements} = this.highlighter.getInfo()

		const last = highlightElements.pop()

		if (!isVisible(last)) {
			const letterElements = [...this.letterElements]
			const firstVisibleElement = getFirstVisibleElement(letterElements)
			const index = letterElements.indexOf(firstVisibleElement)
			this.highlighter.highlight(index)
			return
		}

		this.highlighter.next()
	}

	previousLine() {
		const {highlightIndexStart, highlightIndexEnd, highlightElement} =
			this.highlighter.getInfo()
		const cursorPosition = highlightIndexStart
		const textInfo = getTextInfo(store.input, {cursorPosition})

		if (!isVisible(highlightElement)) {
			const letterElements = [...this.letterElements]
			const lastVisibleElement = getLastVisibleElement(letterElements)
			const index = letterElements.indexOf(lastVisibleElement)
			const line = textInfo.lines.find(
				(l) =>
					index >= l.firstCharIndex && index <= l.firstCharIndex + l.length,
			)
			this.highlighter.highlight(line.firstCharIndex)
			return
		}

		if (highlightIndexStart !== highlightIndexEnd) {
			this.highlighter.highlight(highlightIndexStart, highlightIndexStart)
			return
		}

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const prevIndex =
			currentLineIndex === 0 ? lines.length - 1 : currentLineIndex - 1

		const prevLine = lines[prevIndex]

		const col = cursorPosition - currLine.firstCharIndex
		const safeCol = Math.min(col, prevLine.length)

		const target = prevLine.firstCharIndex + safeCol

		this.highlighter.highlight(target, target)
	}

	nextLine() {
		const {highlightIndexStart, highlightIndexEnd, highlightElement} =
			this.highlighter.getInfo()

		if (!isVisible(highlightElement)) {
			const letterElements = [...this.letterElements]
			const firstVisibleElement = getFirstVisibleElement(letterElements)
			const index = letterElements.indexOf(firstVisibleElement)
			this.highlighter.highlight(index)
			return
		}

		if (highlightIndexStart !== highlightIndexEnd) {
			this.highlighter.highlight(highlightIndexEnd, highlightIndexEnd)
			return
		}

		const cursorPosition = highlightIndexEnd

		const textInfo = getTextInfo(store.input, {cursorPosition})
		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const nextIndex =
			currentLineIndex === lines.length - 1 ? 0 : currentLineIndex + 1

		const nextLine = lines[nextIndex]

		const col = cursorPosition - currLine.firstCharIndex
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

	increaseLeftWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string

		let i = highlightIndexStart - 1

		if (i < 0) return

		// skip tout ce qui n'est pas un mot
		while (i >= 0 && !isWordChar(text[i])) i--

		if (i < 0) return

		const {start} = getWordBoundaries(text, i)

		this.highlighter.highlight(start, highlightIndexEnd)
	}

	decreaseLeftWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string

		let i = highlightIndexStart

		if (i >= highlightIndexEnd) return

		// move right to exit current word if we're inside one
		if (i < text.length && isWordChar(text[i])) {
			while (i < text.length && isWordChar(text[i])) i++
		}

		// skip non-word chars (spaces, punctuation)
		while (i < text.length && !isWordChar(text[i])) i++

		if (i >= text.length) return

		const {start} = getWordBoundaries(text, i)

		// guard: do not cross end
		if (start > highlightIndexEnd) {
			this.highlighter.highlight(highlightIndexEnd, highlightIndexEnd)
			return
		}

		this.highlighter.highlight(start, highlightIndexEnd)
	}

	increaseRightWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string

		let i = highlightIndexEnd + 1

		if (i >= text.length) return

		// skip tout ce qui n'est pas un mot (espaces, ponctuation)
		while (i < text.length && !isWordChar(text[i])) i++

		if (i >= text.length) return

		const {end} = getWordBoundaries(text, i)

		this.highlighter.highlight(highlightIndexStart, end)
	}

	decreaseRightWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string

		let i = highlightIndexEnd

		if (i <= highlightIndexStart) return

		// move left to exit current word if we're inside one
		if (i >= 0 && isWordChar(text[i])) {
			while (i >= 0 && isWordChar(text[i])) i--
		}

		// skip non-word chars (spaces, punctuation)
		while (i >= 0 && !isWordChar(text[i])) i--

		// if no word found, collapse to start
		if (i < highlightIndexStart) {
			this.highlighter.highlight(highlightIndexStart, highlightIndexStart)
			return
		}

		const {end} = getWordBoundaries(text, i)

		// guard: do not cross start
		if (end < highlightIndexStart) {
			this.highlighter.highlight(highlightIndexStart, highlightIndexStart)
			return
		}

		this.highlighter.highlight(highlightIndexStart, end)
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

	async speakSelection() {
		const {highlightContent} = this.highlighter.getInfo()
		if (!highlightContent) return

		const text = highlightContent.trim()
		if (!text) return

		const {detect} = await import('tinyld')

		function guessWithKeywords(t: string) {
			const s = t.toLowerCase()

			// FR
			if (/[éèêàùç]/.test(s)) return 'fr'
			if (/\b(le|la|les|un|une|des|est|et)\b/.test(s)) return 'fr'

			// EN
			if (/\b(a|an|the|and|is|are|this|that)\b/.test(s)) return 'en'

			return null
		}

		let lang = detect(text, {only: ['en', 'fr', 'ja']})

		if (!lang) {
			lang = guessWithKeywords(text)
		}

		// fallback final assumé
		if (!lang) lang = 'en'

		toast(lang)

		switch (lang) {
			case 'fr':
				speakFrench(text)
				break
			case 'ja':
				speakJapanese(text)
				break
			default:
				speakEnglish(text)
		}
	}
}

export let mainPage = new PageMain()
mainPage.active = true
