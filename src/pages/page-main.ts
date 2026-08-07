import {withController} from '@snar/lit'
import {HighlightManager} from '@vdegenne/highlight-manager'
import {
	chatGptMediatorOpen,
	chatGptMediatorUrl,
	cnrtlUrl,
	jishoUrl,
} from '@vdegenne/links'
import {playJapanese, speakEnglish, speakFrench} from '@vdegenne/speech'
import {tts, TTS_MODELS} from '@vdegenne/tts-server'
import {hasSomeJapanese} from 'asian-regexps'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, property, query, queryAll} from 'lit/decorators.js'
import toast from 'toastit'
import {playClick} from '../assets/assets.js'
import {fullscreenElement} from '../fullscreen-element.js'
import {indexesHistory} from '../indexesHistory.js'
import {stateless} from '../stateless.js'
import {store} from '../store.js'
import {
	getLineBoundaries,
	getSpecialBoundaries,
	getTextInfo,
	getWordBoundaries,
	isWordChar,
	splitLetters,
} from '../text-logic.js'
import {
	copyToClipboard,
	getFirstVisibleElement,
	getLastVisibleElement,
	isVisible,
} from '../utils.js'
import {PageElement} from './PageElement.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

// const {fullscreenElement} = await import('../fullscreen-element.js')

@customElement('page-main')
@withController(store)
@withStyles(css`
	:host {
		font-family: 'Playfair Display'; /* why not */
		font-family: BJCree; /* BOF */
		font-family: Merriweather; /* not bad at all */
		font-size: var(--font-size-px);
		font-weight: var(--font-weight);
	}

	.letter[highlight1] {
		background-color: #caca00;
		background-color: var(--md-sys-color-secondary-container);
		background-color: var(--md-sys-color-outline);
		background-color: var(--md-sys-color-outline-variant);
		background-color: var(--md-sys-color-primary);
		background-color: var(--md-sys-color-primary-container);
		color: #ff0000;
		color: #ab9a00;
		color: var(--md-sys-color-on-secondary-container);
		color: var(--md-sys-color-inverse-on-surface);
		color: var(--md-sys-color-on-surface);
		color: var(--md-sys-color-on-primary);
		color: var(--md-sys-color-on-primary-container);
	}

	:host([special]) .letter[highlight1] {
		background-color: var(--md-sys-color-tertiary-container);
		color: var(--md-sys-color-on-tertiary-container);
		background-color: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
	}

	/* SINGLE highlighted element */
	.letter[highlight1]:not(:has(~ .letter[highlight1])):not(
			.letter[highlight1] ~ .letter[highlight1]
		) {
		border-radius: 5px;
	}

	/* FIRST in a group */
	.letter[highlight1]:not(.letter[highlight1] ~ .letter[highlight1]) {
		border-radius: 5px 0 0 5px;
	}

	/* LAST in a group */
	.letter[highlight1]:not(:has(~ .letter[highlight1])) {
		border-radius: 0 5px 5px 0;
	}

	[jp] .letter {
		font-family: Roboto, 'Noto Serif JP';
	}
`)
export class PageMain extends PageElement {
	@property({type: Boolean, reflect: true}) special = false

	// /**
	//  * @deprecated Use `stateless.feedback` instead
	//  */
	// @state() feedback: any = ''

	@queryAll('.letter') letterElements!: HTMLElement[]
	@query('.letter[highlight1]') firstHighlightedLetter?: HTMLDivElement

	getHighlightedLettersRatio() {
		const letters = [...this.letterElements]
		const highlightLetters = letters.filter((l) => l.hasAttribute('highlight1'))
		return highlightLetters.length / letters.length
	}

	isMostHighlighted() {
		// TODO: tweak this value if needed
		return this.getHighlightedLettersRatio() > 0.95
	}

	// firstHighlight = true

	highlighter = new HighlightManager('.letter', {
		// fastTravel: false,
		scroll: {
			if: (is) => !is('partially-visible'),
			block: 'center',
			behavior: 'instant',
		},
		// keep the arrow form to avoid breaking "this"
		onSelectionChange: (info) => {
			playClick()
			// store.startIndex = info.highlightIndexStart
			// store.endIndex = info.highlightIndexEnd
			console.log(
				'SELECTION CHANGED',
				info.highlightIndexStart,
				info.highlightIndexEnd,
			)
			indexesHistory.saveHighlightIndexes.debounce(
				info.highlightIndexStart,
				info.highlightIndexEnd,
			)

			// await this.updateComplete
			// if (
			// 	this.firstHighlightedLetter &&
			// 	!isVisible(this.firstHighlightedLetter)
			// ) {
			// 	// if (this.firstTime) {
			// 	// this.firstHighlightedLetter.scrollIntoView({
			// 	// 	block: 'center',
			// 	// 	inline: 'center',
			// 	// 	behavior: this.firstTime ? 'smooth' : 'instant',
			// 	// })
			// 	// }
			// }
			// this.firstTime = false

			// this.special = false
			// stateless.feedback = ''
			const {highlightContent} = info
			if (highlightContent) {
				fullscreenElement.updateRemoteInfo.call('')
				if (highlightContent.length < 15) {
					const info = stateless.remoteInfoMap[highlightContent]
					if (info && info.collections) {
						fullscreenElement.updateRemoteInfo.call(highlightContent)
					} else {
						fullscreenElement.updateRemoteInfo.debounce(highlightContent)
					}
				}
			}

			// if (this.firstHighlight) {
			// 	const params = new URLSearchParams(location.search)
			// 	if (params.has('full')) {
			// 		this.updateComplete.then(async () => {
			// 			mainPage.selectAll()
			// 			fullscreenElement.show()
			// 		})
			// 	}
			// 	this.firstHighlight = false
			// }
		},
	})

	render() {
		const lines = store.input.split('\n').filter((l) => l)
		const isJp = hasSomeJapanese(store.input ?? '')

		return html`<!---->
			${
				!store.input
					? html`<!---->
							<div class="m-12">
								Use ?input=${'<your-text>'} in the url (then use your controller
								to navigate)
							</div>
							<!---->`
					: null
			}
			<div
				class="p-7 leading-normal mb-48 -max-w-7xl w-full mx-auto box-border"
			>
				${lines.map((line, i) => {
					return html`<!-- -->
						<div
							class="flex items-center gap-5 py-1"
							style="${i % 2 === 0 ? 'background-color:rgba(200, 200, 200, 0.06)' : ''}"
							__style="border-bottom: 1px dashed var(--md-sys-color-outline)"
							?jp=${isJp}
						>
							<span
								class="text-(--md-sys-color-outline) opacity-70 font-[roboto]"
								style="font-size: initial"
								>#${i}</span
							>
							<div class="break-all">
								${splitLetters(line).map((letter) => {
									return html`<!-- --><span class="letter">${letter}</span
										><!-- -->`
								})}
								${
									i !== lines.length - 1
										? html`<span class="letter"></span>`
										: null
								}
							</div>
						</div>
						<!-- -->`
				})}
			</div>

			<div
				id="feedback"
				class="fixed top-0 right-0 p-0 text-lg flex items-center gap-2 *:even:text-(--md-sys-color-outline) font-[roboto] bg-(--md-sys-color-surface-container)"
			>
				${stateless.feedback}
			</div>

			${fullscreenElement}
			<!----> `
	}

	async firstUpdated() {
		const params = new URLSearchParams(window.location.search)
		// await sleep(2000)
		let start: number, end: number
		const indexes = await indexesHistory.getHighlightIndexes()
		if (indexes) {
			;[start, end] = indexes
		} else {
			if (params.has('full')) {
				start = 0
				end = store.input.length - 1
			} else {
				start = end = 0
			}
		}

		console.log('HIGHLIGHT FROM MAIN PAGE FIRST UPDATE', start, end)
		this.highlighter.highlight(start, end)
		console.log(start, end, store.input.length - 1)
		if (start === 0 && end === store.input.length - 1 && params.has('full')) {
			fullscreenElement.show()
		}
	}

	expandHighlight() {
		const info = this.highlighter.getInfo()
		// TODO: should uncomment the replaceAll below back?
		const text = store.input //.replaceAll('\n', ' ')
		// TODO: should use the caache
		const letters = splitLetters(store.input)

		const start = info.highlightIndexStart
		const end = info.highlightIndexEnd

		let next = getSpecialBoundaries(text, start)

		if (next && next.start === start && next.end === end) {
			next = null
		}

		if (!next) {
			next = getWordBoundaries(letters, start, end)
		}

		if (next.start === start && next.end === end) {
			// Nothing changed, try extending
			next = getWordBoundaries(letters, start, end, {
				ignoreTypeBoundaries: true,
			})
		}

		if (next.start === start && next.end === end) {
			// Still nothing changed, select the line
			next = getLineBoundaries(letters, start, end)
		}

		if (next.start === start && next.end === end) {
			// Still nothing changed, select all text
			next = {
				start: 0,
				end: text.length - 1,
			}
		}

		this.highlighter.highlight(next.start, next.end)
	}

	selectAll() {
		this.highlighter.highlight(0, store.input.length - 1)
	}

	previous() {
		// const {highlightElement} = this.highlighter.getInfo()
		//
		// if (!isVisible(highlightElement)) {
		// 	const letterElements = [...this.letterElements]
		// 	const lastVisibleElement = getLastVisibleElement(letterElements)
		// 	const index = letterElements.indexOf(lastVisibleElement)
		// 	this.highlighter.highlight(index - 1)
		// 	return
		// }

		this.highlighter.previous()
	}

	next() {
		// const {highlightElements} = this.highlighter.getInfo()
		//
		// const last = highlightElements.pop()
		//
		// if (!isVisible(last)) {
		// 	const letterElements = [...this.letterElements]
		// 	const firstVisibleElement = getFirstVisibleElement(letterElements)
		// 	const index = letterElements.indexOf(firstVisibleElement)
		// 	this.highlighter.highlight(index)
		// 	return
		// }

		this.highlighter.next()
	}

	getTextInfo(cursorPosition?: number) {
		if (!cursorPosition) {
			;({highlightIndexStart: cursorPosition} = this.highlighter.getInfo())
		}

		// TODO: make letters cache from store
		const letters = splitLetters(store.input)
		return getTextInfo(letters, {cursorPosition})
	}

	previousLine() {
		const {highlightIndexStart, highlightIndexEnd, highlightElement} =
			this.highlighter.getInfo()
		const cursorPosition = highlightIndexStart
		// const textInfo = getTextInfo(store.input, {cursorPosition})
		const textInfo = this.getTextInfo()

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
			// this.highlighter.highlight(highlightIndexStart, highlightIndexStart)
			// return
		}

		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const prevIndex =
			currentLineIndex === 0 ? lines.length - 1 : currentLineIndex - 1

		const prevLine = lines[prevIndex]

		const col = cursorPosition - currLine.firstCharIndex
		const safeCol = Math.min(col, prevLine.length - 1)

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
			// this.highlighter.highlight(highlightIndexEnd, highlightIndexEnd)
			// return
		}

		const cursorPosition = highlightIndexEnd

		const textInfo = this.getTextInfo(cursorPosition)
		const {lines, currentLineIndex} = textInfo

		const currLine = lines[currentLineIndex]

		const nextIndex =
			currentLineIndex === lines.length - 1 ? 0 : currentLineIndex + 1

		const nextLine = lines[nextIndex]

		const col = cursorPosition - currLine.firstCharIndex
		const safeCol = Math.min(col, nextLine.length - 1)

		const target = nextLine.firstCharIndex + safeCol

		this.highlighter.highlight(target, target)
	}

	moveSelectionStartToPreviousLine() {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()

		const textInfo = this.getTextInfo()

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

		const textInfo = this.getTextInfo()

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

		const textInfo = this.getTextInfo(highlightIndexEnd)

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

		const textInfo = this.getTextInfo(highlightIndexEnd)

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
		// TODO: change this to cache
		const letters = splitLetters(text)

		let i = highlightIndexStart - 1

		if (i < 0) return

		// skip tout ce qui n'est pas un mot
		while (i >= 0 && !isWordChar(text[i])) i--

		if (i < 0) return

		const {start} = getWordBoundaries(letters, i)

		this.highlighter.highlight(start, highlightIndexEnd)
	}

	decreaseLeftWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string
		// TODO: change this to cache
		const letters = splitLetters(text)

		let i = highlightIndexStart

		if (i >= highlightIndexEnd) return

		// move right to exit current word if we're inside one
		if (i < text.length && isWordChar(text[i])) {
			while (i < text.length && isWordChar(text[i])) i++
		}

		// skip non-word chars (spaces, punctuation)
		while (i < text.length && !isWordChar(text[i])) i++

		if (i >= text.length) return

		const {start} = getWordBoundaries(letters, i)

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
		// TODO: change this to cache
		const letters = splitLetters(text)

		let i = highlightIndexEnd + 1

		if (i >= text.length) return

		// skip tout ce qui n'est pas un mot (espaces, ponctuation)
		while (i < text.length && !isWordChar(text[i])) i++

		if (i >= text.length) return

		const {end} = getWordBoundaries(letters, i)

		this.highlighter.highlight(highlightIndexStart, end)
	}

	decreaseRightWordSelection(): void {
		const {highlightIndexStart, highlightIndexEnd} = this.highlighter.getInfo()
		const text = store.input as string
		// TODO: change this to cache
		const letters = splitLetters(text)

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

		const {end} = getWordBoundaries(letters, i)

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
			toast(highlightContent, {timeoutMs: 1500})
		}
	}

	getContent() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			return highlightContent
		}
	}

	openChatGPTSelector() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			if (store.mostHighlightedOpenInSameTab && this.isMostHighlighted()) {
				window.location.href = chatGptMediatorUrl(highlightContent)
			} else {
				chatGptMediatorOpen(highlightContent)
			}
		}
	}

	openCNRTLOrJisho() {
		const {highlightContent} = this.highlighter.getInfo()
		if (highlightContent) {
			let url: string
			if (hasSomeJapanese(highlightContent)) {
				url = jishoUrl(highlightContent)
			} else {
				// url = `https://www.cnrtl.fr/definition/${encodeURIComponent(highlightContent)}`
				url = cnrtlUrl(highlightContent)
			}
			if (store.mostHighlightedOpenInSameTab && this.isMostHighlighted()) {
				window.location.href = url
			} else {
				window.open(url, '_blank')
			}
		}
	}

	async speakSelection() {
		const {highlightContent} = this.highlighter.getInfo()
		if (!highlightContent) return

		const text = highlightContent.trim()
		if (!text) return

		let lang: string | undefined

		if (hasSomeJapanese(text)) {
			lang = 'ja'
		} else {
			const {detect} = await import('tinyld')
			lang = detect(text, {only: ['en', 'fr']})
		}

		function guessWithKeywords(t: string) {
			const s = t.toLowerCase()

			// FR
			if (/[éèêàùç]/.test(s)) return 'fr'
			if (/\b(le|la|les|un|une|des|est|et)\b/.test(s)) return 'fr'

			// EN
			if (/\b(a|an|the|and|is|are|this|that)\b/.test(s)) return 'en'

			return null
		}

		if (!lang) {
			lang = guessWithKeywords(text)
		}

		// fallback final assumé
		if (!lang) lang = 'en'

		// toast(lang)

		switch (lang) {
			case 'fr':
				speakFrench(text)
				break
			case 'ja':
				// speakJapanese(text)
				try {
					await playJapanese(text, {fallbackToSpeechSynthesis: false})
				} catch {
					try {
						// Couldn't play real japanese audio, fallback to tts if possible
						const audio = tts({
							text,
							languageCode: 'ja-JP',
							model: TTS_MODELS.GEMINI_3_1_FLASH_TTS,
							// model: TTS_MODELS.GEMINI_2_5_FLASH_TTS,
							voice: 'random',
						})
						await audio.play()
					} catch {
						toast('No TTS found.')
					}
				}
				break
			default:
				speakEnglish(text)
		}
	}
}

export let mainPage = new PageMain()
mainPage.active = true
