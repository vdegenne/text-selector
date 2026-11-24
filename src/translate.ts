import { toast } from './snackbar.js'

const TRANSLATE_API_URL =
	'https://script.google.com/macros/s/AKfycbygynQ_0F018pSlvWglmtnGKfbWRoPGmFCO-9ydu01-IkJPwPHUIVNkyduR0jGTYY94/exec'

const cache = new Map<string, Promise<string>>()

export function translate(
	text: string,
	source = '',
	target = 'en',
): Promise<string> {
	text = text.trim()
	source = source.trim()
	target = target.trim()

	const key = JSON.stringify([text, source, target])

	const cached = cache.get(key)

	if (cached) {
		return cached
	}

	const promise = fetchTranslation(text, source, target).catch(
		(error: unknown) => {
			cache.delete(key)
			throw error
		},
	)

	cache.set(key, promise)

	return promise
}

async function fetchTranslation(
	text: string,
	source: string,
	target: string,
): Promise<string> {
	const params = new URLSearchParams({
		text,
		source,
		target,
	})

	toast('Translating please wait...')
	const response = await fetch(`${TRANSLATE_API_URL}?${params}`)

	if (!response.ok) {
		throw new Error(
			`Translation request failed: ${response.status} ${response.statusText}`,
		)
	}

	const result = (await response.json()) as {
		translation?: string
		error?: string
	}

	if (result.error) {
		throw new Error(result.error)
	}

	if (typeof result.translation !== 'string') {
		throw new Error('Invalid translation response')
	}

	return result.translation
}
