const TRANSLATE_API_URL =
	'https://script.google.com/macros/s/AKfycbygynQ_0F018pSlvWglmtnGKfbWRoPGmFCO-9ydu01-IkJPwPHUIVNkyduR0jGTYY94/exec'

export async function translate(
	text: string,
	source = '',
	target = 'en',
): Promise<string> {
	const params = new URLSearchParams({
		text,
		source,
		target,
	})

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
