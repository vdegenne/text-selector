export function getFontSize(text: string): number {
	const length = text.length

	const maxSize = 150 // px
	const minSize = 24 // px

	// tune these values depending on your design
	const size = 300 / Math.sqrt(length)

	return Math.max(minSize, Math.min(maxSize, size))
}

export function openInLocalhost(): void {
	const url = new URL(window.location.href)
	url.host = 'localhost:37923'
	url.protocol = 'http'

	window.open(url.href, '_blank')
}
