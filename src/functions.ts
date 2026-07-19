const graphemeSegmenter = new Intl.Segmenter(undefined, {
	granularity: 'grapheme',
})

export function splitLetters(text: string): string[] {
	return [...graphemeSegmenter.segment(text)].map(({segment}) => segment)
}

export function wrapText(text: string, width: number): string {
	const segmenter = new Intl.Segmenter(undefined, {
		granularity: 'grapheme',
	})

	const lines: string[] = []

	for (const originalLine of text.split('\n')) {
		let line = ''
		let length = 0

		for (const {segment} of segmenter.segment(originalLine)) {
			if (length + 1 > width) {
				lines.push(line)
				line = ''
				length = 0
			}

			line += segment
			length++
		}

		if (line) {
			lines.push(line)
		}
	}

	return lines.join('\n')
}

export function breakSentence(text: string): string {
	return text
		.split(/(?<=[。．.!！?？;；、,])(?![。．.!！?？;；、,])/)
		.map((sentence) => sentence.trim())
		.filter(Boolean)
		.join('\n')
}
