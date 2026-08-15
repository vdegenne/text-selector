import {NEW_LINE} from './constants.js'

export function cleanInput(input: string) {
	return input
		.replaceAll('\u200B', '') // remove zero width spaces
		.replace(/\n{2,}/g, '\n') // avoid too much new lines
		.replace(/\n/g, NEW_LINE) // replace new lines with new line code
}

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
