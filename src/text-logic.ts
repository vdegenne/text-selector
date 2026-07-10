type CharType =
	| 'hiragana'
	| 'katakana'
	| 'kanji'
	| 'roman'
	| 'number'
	| 'connector'
	| 'punctuation'
	| 'space'
	| 'symbol'
	| 'other'

export function getCharType(c: string): CharType {
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
	text: string,
	startIndex: number,
	endIndex: number = startIndex,
	options?: Partial<GetWordBoundariesOptions>,
): {start: number; end: number} {
	// let startIndex = startIndex
	// let endIndex = endIndex

	const initialType = getCharType(text[startIndex])

	while (startIndex > 0 && isWordChar(text[startIndex - 1])) {
		const type = getCharType(text[startIndex - 1])

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

	while (endIndex < text.length - 1 && isWordChar(text[endIndex + 1])) {
		const type = getCharType(text[endIndex + 1])

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
	text: string,
	startIndex: number,
	endIndex: number = startIndex,
): {start: number; end: number} {
	// let startIndex = startIndex
	// let endIndex = endIndex

	while (startIndex > 0 && text[startIndex - 1] !== '\n') {
		startIndex--
	}

	while (endIndex < text.length - 1 && text[endIndex + 1] !== '\n') {
		endIndex++
	}

	return {start: startIndex, end: endIndex}
}

export function getSpecialBoundaries(
	text: string,
	index: number,
): {start: number; end: number} | null {
	const patterns = [
		// URLs
		/(https?:\/\/[^\s]+)/u,

		// Hashtags
		/(#[\p{L}\p{N}_-]+)/u,

		// Mentions
		/(@[\p{L}\p{N}_-]+)/u,

		// Dollar tags
		/(\$[\p{L}\p{N}_-]+)/u,
	]

	for (const pattern of patterns) {
		const regex = new RegExp(pattern.source, 'gu')

		for (const match of text.matchAll(regex)) {
			const start = match.index!
			const end = start + match[0].length - 1

			if (index >= start && index <= end) {
				return {start, end}
			}
		}
	}

	return null
}
