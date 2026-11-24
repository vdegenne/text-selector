/**
 * Kuromoji browser integration (Vite)
 *
 * 1. Install dependencies:
 *
 *    npm install -D kuromoji path-browserify patch-package
 *
 * 2. Copy dictionary files:
 *
 *    mkdir -p public/dict
 *    cp -r node_modules/kuromoji/dict/* public/dict/
 *
 * 3. Configure Vite (`vite.config.ts`):
 *
 *    resolve: {
 *      alias: [
 *        {
 *          find: /^path$/,
 *          replacement: 'path-browserify',
 *        },
 *      ],
 *    }
 *
 * 4. Patch zlibjs:
 *
 *    File: node_modules/zlibjs/bin/gunzip.min.js
 *
 *    Replace:
 *    var p=void 0,aa=this;
 *
 *    With:
 *    var p=void 0,aa=globalThis;
 *
 *    Generate patch:
 *    npx patch-package zlibjs
 *
 * 5. Patch Kuromoji's browser loader:
 *
 *    File: node_modules/kuromoji/src/loader/BrowserDictionaryLoader.js
 *
 *    Replace:
 *    new zlib.Zlib.Gunzip(
 *
 *    With:
 *    new globalThis.Zlib.Gunzip(
 *
 *    Generate patch:
 *    npx patch-package kuromoji
 *
 * 6. Add to package.json:
 *    "postinstall": "patch-package"
 *
 * 7. Add a Vite middleware plugin:
 *    Intercept requests under `/dict/` ending in `.gz`.
 *    Prevent the response from setting the `Content-Encoding` header.
 *    This ensures the browser passes the original compressed bytes
 *    to Kuromoji instead of decompressing them automatically.
 *
 * 8. Configure Kuromoji's dictionary path:
 *
 *    dicPath: `${import.meta.env.BASE_URL}dict/`
 *
 * 9. Force Vite dependency optimization:
 *    npm run dev -- --force
 */

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
