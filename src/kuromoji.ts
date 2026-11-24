import * as kuromoji from 'kuromoji'

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>

let tokenizerPromise: Promise<Tokenizer> | undefined

const readingCache = new Map<string, string>()

function loadTokenizer(): Promise<Tokenizer> {
	if (!tokenizerPromise) {
		tokenizerPromise = new Promise<Tokenizer>((resolve, reject) => {
			kuromoji
				.builder({
					dicPath: `${import.meta.env.BASE_URL}dict/`,
				})
				.build((error, tokenizer) => {
					if (error) {
						reject(error)
						return
					}

					resolve(tokenizer)
				})
		}).catch((error: unknown) => {
			tokenizerPromise = undefined
			throw error
		})
	}

	return tokenizerPromise
}

function katakanaToHiragana(text: string): string {
	return text.replace(/[ァ-ヶ]/g, (character) =>
		String.fromCharCode(character.charCodeAt(0) - 0x60),
	)
}

export async function toHiragana(text: string): Promise<string> {
	if (!text) return text

	const cached = readingCache.get(text)

	if (cached !== undefined) {
		return cached
	}

	let result: string

	// No dictionary required when the text contains no kanji.
	if (!/\p{Script=Han}/u.test(text)) {
		result = katakanaToHiragana(text)
	} else {
		const tokenizer = await loadTokenizer()
		const tokens = tokenizer.tokenize(text)

		result = ''
		let cursor = 0

		for (const token of tokens) {
			const start = token.word_position - 1

			// Preserve whitespace and other characters between tokens.
			if (start > cursor) {
				result += text.slice(cursor, start)
			}

			const reading =
				token.reading && token.reading !== '*'
					? token.reading
					: token.surface_form

			result += katakanaToHiragana(reading)
			cursor = start + token.surface_form.length
		}

		result += text.slice(cursor)
	}

	readingCache.set(text, result)

	return result
}
