export function getFontSize(text: string): number {
	const length = text.length

	const maxSize = 120 // px
	const minSize = 24 // px

	// tune these values depending on your design
	const size = 300 / Math.sqrt(length)

	return Math.max(minSize, Math.min(maxSize, size))
}
