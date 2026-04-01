import {type PropertyValues} from 'snar'
// import {toast} from 'toastit'

export function copyToClipboard(text: string | number) {
	navigator.clipboard.writeText(text + '')
	// TODO: be careful activating that if you share utils with server.
	// toast('Copied to clipboard.')
}

export function sleep(milli: number = 1000) {
	return new Promise((r) => setTimeout(r, milli))
}

export function preventDefault(event: Event) {
	event.preventDefault()
}
export function stopPropagation(event: Event) {
	event.stopPropagation()
}

/**
 * Re-dispatches an event from the provided element.
 *
 * This function is useful for forwarding non-composed events, such as `change`
 * events.
 *
 * @example
 * class MyInput extends LitElement {
 *   render() {
 *     return html`<input @change=${this.redispatchEvent}>`;
 *   }
 *
 *   protected redispatchEvent(event: Event) {
 *     redispatchEvent(this, event);
 *   }
 * }
 *
 * @param element The element to dispatch the event from.
 * @param event The event to re-dispatch.
 * @return Whether or not the event was dispatched (if cancelable).
 */
export function redispatchEvent(element: Element, event: Event) {
	// For bubbling events in SSR light DOM (or composed), stop their propagation
	// and dispatch the copy.
	if (event.bubbles && (!element.shadowRoot || event.composed)) {
		event.stopPropagation()
	}

	const copy = Reflect.construct(event.constructor, [event.type, event])
	const dispatched = element.dispatchEvent(copy)
	if (!dispatched) {
		event.preventDefault()
	}

	return dispatched
}

const eventOpts = {composed: true, bubbles: true}
export function getElementsTree(node: Element): Promise<Element[]> {
	return new Promise((resolve, _reject) => {
		function f(event: Event) {
			resolve(event.composedPath() as Element[])
			node.removeEventListener('get-elements-tree', f)
		}
		node.addEventListener('get-elements-tree', f)
		node.dispatchEvent(new Event('get-elements-tree', eventOpts))
	})
}
export async function getElementInTree(
	from: Element,
	condition: (element: Element) => boolean,
): Promise<Element | undefined> {
	for (const element of await getElementsTree(from)) {
		if (condition(element)) {
			return element
		}
	}
}

export function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i]!, array[j]!] = [array[j]!, array[i]!]
	}
}

export async function generateHash(input: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(input)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function random(min: number, max: number, decimal = 0): number {
	const random = Math.random() * (max - min) + min
	return parseFloat(random.toFixed(decimal))
}

export function saveDataToFile(data: string, filename: string): void {
	const blob = new Blob([data], {type: 'text/plain'})
	const link = document.createElement('a')
	link.download = filename
	link.href = URL.createObjectURL(blob)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export async function loadDataFromFile(): Promise<string> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input')
		input.type = 'file'

		input.onchange = () => {
			const file = input.files?.[0]
			if (!file) {
				reject(new Error('No file selected'))
				return
			}

			const reader = new FileReader()

			reader.onload = (event) => {
				const result = event.target?.result
				if (typeof result === 'string') {
					resolve(result)
				} else {
					reject(new Error('File read error: result is not a string'))
				}
			}

			reader.onerror = () => {
				reject(new Error('Error reading file'))
			}

			reader.readAsText(file)
		}

		input.click()
	})
}

export function propertyValuesToJson<T>(
	changed: PropertyValues<T>,
	object: T,
): Partial<T> {
	return Object.fromEntries(
		[...changed.keys()].map((key) => [key, object[key as keyof typeof object]]),
	) as Partial<T>
}

export function changeStyleProperty(cssVar: string, value: number | string) {
	document.documentElement.style.setProperty(`--${cssVar}`, value + '')
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous' // prevent CORS taint if server allows
		img.onload = () => {
			if (img.naturalWidth === 0 || img.naturalHeight === 0) {
				reject(new Error('Image has zero dimensions'))
			} else {
				resolve(img)
			}
		}
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
		img.src = url
	})
}

export function roundFloat(value: number, decimals: number): number {
	const factor = 10 ** decimals
	return Math.round(value * factor) / factor
}

export function waitForTransition(element: HTMLElement) {
	return new Promise<void>((resolve) => {
		const handler = () => {
			element.removeEventListener('transitionend', handler)
			resolve()
		}
		element.addEventListener('transitionend', handler)
	})
}

export function createHighlightedHtml(
	input: string,
	search: string | string[],
): string {
	if (!search || (Array.isArray(search) && search.length === 0)) return input

	const esc = function (s: string): string {
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	const escapedInput = esc(input)

	// Normalize search to array of strings
	const keywords = Array.isArray(search)
		? search.filter(Boolean)
		: search.split(/\s+/).filter(Boolean)

	if (keywords.length === 0) return escapedInput

	// Escape regex characters in each keyword
	const escapedKeywords = keywords.map((k) =>
		k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
	)

	// Create a regex matching any keyword
	const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi')

	return escapedInput.replace(regex, '<span class="highlight">$1</span>')
}

export function loremIpsum(paragraphs: number = 1): string {
	const base =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
		'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
		'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

	if (paragraphs <= 1) {
		return base
	}

	return Array(paragraphs).fill(base).join('\n\n')
}

/**
 * Returns a new reference
 */
export function removeObjectKeys(arr: any, keys: string[]) {
	const clone = {...arr}
	for (const key of keys) {
		delete clone[key]
	}
	return clone
}

export function getWordBounds(
	text: string,
	index: number,
): {start: number; end: number} {
	if (index < 0 || index >= text.length) {
		return {start: index, end: index}
	}

	const isDelimiter = (c: string): boolean => {
		return /[\s.,;:!?()[\]{}"']/u.test(c)
	}

	// Si on est sur un délimiteur → rien
	if (isDelimiter(text[index])) {
		return {start: index, end: index}
	}

	let start = index
	let end = index

	// expand left
	while (start > 0 && !isDelimiter(text[start - 1])) {
		start--
	}

	// expand right
	while (end < text.length - 1 && !isDelimiter(text[end + 1])) {
		end++
	}

	return {start, end}
}

interface LineInfo {
	/**
	 * Index of the first character of this line relative to the whole text
	 */
	firstCharIndex: number
	/**
	 * Length of the text
	 */
	length: number

	/**
	 * Cursor index relative to this line
	 * undefined if the cursor is not in the line
	 */
	cursorIndex?: number
}
interface TextInfo {
	/**
	 * Number of lines in the text
	 */
	numberOfLines: number
	/**
	 * Information about the lines
	 */
	lines: LineInfo[]
	/**
	 * The line of the cursor's current position
	 * @default 0
	 */
	currentLineIndex: number

	previousLineIndex: number
	nextLineIndex: number
}

interface TextInfoOptions {
	lineDelimiter?: string
	cursorPosition?: number
}

export function getTextInfo(
	text: string,
	options: TextInfoOptions = {},
): TextInfo {
	const lineDelimiter = options.lineDelimiter ?? '\n'
	const cursorPosition = options.cursorPosition ?? 0

	const lines: LineInfo[] = []
	let index = 0

	const rawLines = text.split(lineDelimiter)
	if (rawLines[rawLines.length - 1] === '') {
		rawLines.pop()
	}
	let currentLine = 0

	for (let i = 0; i < rawLines.length; i++) {
		const line = rawLines[i]
		const lineStart = index
		const lineEnd = lineStart + line.length

		const lineInfo: LineInfo = {
			firstCharIndex: lineStart,
			length: line.length,
		}

		// Si le curseur est dans cette ligne, on calcule l'index relatif
		if (cursorPosition >= lineStart && cursorPosition <= lineEnd) {
			lineInfo.cursorIndex = cursorPosition - lineStart
			currentLine = i
		}

		lines.push(lineInfo)
		index += line.length + lineDelimiter.length
	}

	const numberOfLines = lines.length
	const previousLineIndex = (currentLine - 1 + numberOfLines) % numberOfLines
	const nextLineIndex = (currentLine + 1) % numberOfLines

	return {
		numberOfLines,
		lines,
		currentLineIndex: currentLine,
		previousLineIndex,
		nextLineIndex,
	}
}

export function getLineIndexFromCharIndex(
	text: string,
	charIndex: number,
): number {
	if (charIndex < 0 || charIndex > text.length) return -1

	let line = 0

	for (let i = 0; i < charIndex; i++) {
		if (text[i] === '\n') {
			line++
		}
	}

	return line
}

export function getLineStartIndex(text: string, lineIndex: number): number {
	if (lineIndex < 0) return -1

	let currentLine = 0

	// cas ligne 0 → début du texte
	if (lineIndex === 0) return 0

	for (let i = 0; i < text.length; i++) {
		if (text[i] === '\n') {
			currentLine++

			if (currentLine === lineIndex) {
				return i + 1 // premier caractère après le \n
			}
		}
	}

	return -1 // out of bounds
}
