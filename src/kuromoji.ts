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
 * 3. Configure Vite (vite.config.ts):
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
 * 4. Apply the required patches:
 *
 *    Patches are available here:
 *    https://github.com/vdegenne/text-selector/tree/main/patches
 *
 *    Copy the patch files into your project's ./patches/ directory.
 *
 *    Add to package.json:
 *
 *    "postinstall": "patch-package"
 *
 *    Run:
 *
 *    npx patch-package
 *
 *    This applies all patches to the installed dependencies.
 *    The postinstall script automatically reapplies them after
 *    every npm install.
 *
 * 5. Configure Kuromoji's dictionary path:
 *
 *    dicPath: `${import.meta.env.BASE_URL}dict/`
 *
 * 6. Force Vite dependency optimization if needed:
 *
 *    npm run dev -- --force
 */

import * as kuromoji from 'kuromoji'

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>

let tokenizerPromise: Promise<Tokenizer> | undefined

const readingCache = new Map<string, Promise<string>>()

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

async function analyze(text: string): Promise<string> {
	// No dictionary required when the text contains no kanji.
	if (!/\p{Script=Han}/u.test(text)) {
		return katakanaToHiragana(text)
	}

	const tokenizer = await loadTokenizer()
	const tokens = tokenizer.tokenize(text)

	let result = ''
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

	return result
}

export function toHiragana(text: string): Promise<string> {
	if (!text) {
		return Promise.resolve(text)
	}

	const cached = readingCache.get(text)

	if (cached) {
		return cached
	}

	const promise = analyze(text).catch((error: unknown) => {
		readingCache.delete(text)
		throw error
	})

	readingCache.set(text, promise)

	return promise
}
