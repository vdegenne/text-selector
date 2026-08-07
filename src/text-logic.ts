const graphemeSegmenter = new Intl.Segmenter(undefined, {
	granularity: 'grapheme',
})

export function splitLetters(text: string) {
	return [...graphemeSegmenter.segment(text)].map(({segment}) => segment)
}

export function utf16IndexToGraphemeIndex(text: string, index: number): number {
	let count = 0
	let offset = 0

	for (const letter of splitLetters(text)) {
		if (offset >= index) {
			break
		}

		offset += letter.length
		count++
	}

	return count
}

export function getCharType(c: string): tselect.CharType {
	if (/[\u3040-\u309F]/u.test(c)) return 'hiragana'
	if (/[\u30A0-\u30FF\u31F0-\u31FF]/u.test(c)) return 'katakana'
	if (/[\u4E00-\u9FFF\u3400-\u4DBF\u3005]/u.test(c)) return 'kanji'
	if (/[A-Za-z]/u.test(c)) return 'roman'
	if (/\p{N}/u.test(c)) return 'number'
	if (/[_-]/u.test(c)) return 'connector'
	if (/\s/u.test(c)) return 'space'
	if (/\p{P}/u.test(c)) return 'punctuation'
	if (/\p{S}/u.test(c)) return 'symbol'

	return 'other'
}

export function isWordChar(c: string): boolean {
	const type = getCharType(c)

	return (
		type === 'hiragana' ||
		type === 'katakana' ||
		type === 'kanji' ||
		type === 'roman' ||
		type === 'number' ||
		type === 'connector'
	)
}

interface GetWordBoundariesOptions {
	ignoreTypeBoundaries?: boolean
}

export function getWordBoundaries(
	letters: string[],
	startIndex: number,
	endIndex: number = startIndex,
	options?: Partial<GetWordBoundariesOptions>,
): {start: number; end: number} {
	const initialType = getCharType(letters[startIndex])

	while (startIndex > 0 && isWordChar(letters[startIndex - 1])) {
		const type = getCharType(letters[startIndex - 1])

		if (
			!options?.ignoreTypeBoundaries &&
			type !== 'connector' &&
			initialType !== 'connector' &&
			type !== initialType
		) {
			break
		}

		startIndex--
	}

	while (endIndex < letters.length - 1 && isWordChar(letters[endIndex + 1])) {
		const type = getCharType(letters[endIndex + 1])

		if (
			!options?.ignoreTypeBoundaries &&
			type !== 'connector' &&
			initialType !== 'connector' &&
			type !== initialType
		) {
			break
		}

		endIndex++
	}

	return {start: startIndex, end: endIndex}
}

export function getLineBoundaries(
	letters: string[],
	startIndex: number,
	endIndex: number = startIndex,
): {start: number; end: number} {
	while (startIndex > 0 && letters[startIndex - 1] !== '\n') {
		startIndex--
	}

	while (endIndex < letters.length - 1 && letters[endIndex + 1] !== '\n') {
		endIndex++
	}

	return {start: startIndex, end: endIndex}
}

export function getSpecialBoundaries(
	text: string,
	index: number,
): {start: number; end: number} | null {
	const patterns = [
		/(https?:\/\/[^\s]+)/u,
		/(#[\p{L}\p{N}_-]+)/u,
		/(@[\p{L}\p{N}_-]+)/u,
		/(\$[\p{L}\p{N}_-]+)/u,
	]

	for (const pattern of patterns) {
		const regex = new RegExp(pattern.source, 'gu')

		for (const match of text.matchAll(regex)) {
			const start = utf16IndexToGraphemeIndex(text, match.index!)
			const end =
				utf16IndexToGraphemeIndex(text, match.index! + match[0].length) - 1

			if (index >= start && index <= end) {
				return {start, end}
			}
		}
	}

	return null
}

export function getTextInfo(
	letters: string[],
	options: tselect.TextInfoOptions = {},
): tselect.TextInfo {
	const lineDelimiter = options.lineDelimiter ?? '\n'
	const cursorPosition = options.cursorPosition ?? 0

	const lines: tselect.LineInfo[] = []
	let index = 0

	const rawLines: string[][] = []
	let currentLine: string[] = []

	for (const letter of letters) {
		if (letter === lineDelimiter) {
			rawLines.push(currentLine)
			currentLine = []
		} else {
			currentLine.push(letter)
		}
	}

	if (currentLine.length > 0) {
		rawLines.push(currentLine)
	}

	let currentLineIndex = 0

	for (let i = 0; i < rawLines.length; i++) {
		const lineLetters = rawLines[i]
		const line = lineLetters.join('')
		const lineStart = index
		const lineEnd = lineStart + lineLetters.length

		const lineInfo: tselect.LineInfo = {
			firstCharIndex: lineStart,
			length: lineLetters.length,
			line,
		}

		if (cursorPosition >= lineStart && cursorPosition <= lineEnd) {
			lineInfo.cursorIndex = cursorPosition - lineStart
			currentLineIndex = i
		}

		lines.push(lineInfo)
		index += lineLetters.length + splitLetters(lineDelimiter).length
	}

	const numberOfLines = lines.length
	const previousLineIndex =
		(currentLineIndex - 1 + numberOfLines) % numberOfLines
	const nextLineIndex = (currentLineIndex + 1) % numberOfLines

	return {
		numberOfLines,
		lines,
		currentLineIndex,
		previousLineIndex,
		nextLineIndex,
	}
}

export function wrapText(text: string, width: number): string {
	// const segmenter = new Intl.Segmenter(undefined, {
	// 	granularity: 'grapheme',
	// })

	const lines: string[] = []

	for (const originalLine of text.split('\n')) {
		let line = ''
		let length = 0

		for (const letter of splitLetters(originalLine)) {
			if (length + 1 > width) {
				lines.push(line)
				line = ''
				length = 0
			}

			line += letter
			length++
		}

		if (line) {
			lines.push(line)
		}
	}

	return lines.join('\n')
}

export function breakSentence(text: string): string {
	const urls: string[] = []

	const protectedText = text.replace(
		/\bhttps?:\/\/[^\s。．！？、；，]+/g,
		(url) => {
			urls.push(url)
			return `\u0001\u0000${urls.length - 1}\u0000\u0001`
		},
	)

	return protectedText
		.split(/(?:\u0001|(?<=[。．.!！?？;；、,])(?![。．.!！?？;；、,]))/)
		.map((sentence) =>
			sentence.replace(/\u0000(\d+)\u0000/g, (_, i) => urls[Number(i)]),
		)
		.map((sentence) => sentence.trim())
		.filter(Boolean)
		.join('\n')
}
