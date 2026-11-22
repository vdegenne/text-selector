import { hasSomeJapanese } from 'asian-regexps'
import { app } from './app-shell/app-shell.js'
import { NEW_LINE } from './constants.js'
import { geminiTranslate } from './gemini.js'
import { toast } from './snackbar.js'
import { store } from './store.js'

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

export function findSubarray<T>(array: T[], search: T[]): number {
	if (search.length === 0) return 0

	for (let i = 0; i <= array.length - search.length; i++) {
		let found = true

		for (let j = 0; j < search.length; j++) {
			if (array[i + j] !== search[j]) {
				found = false
				break
			}
		}

		if (found) return i
	}

	return -1
}

export function closeTab() {
	// ydotool('29:1 17:1 17:0 29:0')

	// You need `control-page-with-controller` extension for that.
	// The content script receives this event and will forward to the background to close the tab.
	window.postMessage(
		{
			type: 'close-tab',
		},
		'*',
	)
}

export async function translateSelection() {
	if (!store.geminiApiKey) {
		toast({
			message: 'No Gemini API Key found. (press S to open the settings.)',
		})
		return
	}
	const content = app.mainPage.getContent()
	if (!content) {
		toast({ message: 'No content to analyze.' })
		return
	}

	if (!hasSomeJapanese(content)) {
		toast({ message: 'Only Japanese content supported for now.' })
		return
	}

	try {
		const result = await geminiTranslate(content)
		if (result) toast({ message: result, timeoutMs: 0 })
	} catch (err) {
		console.log(err)
		// toast(err)
	}
}
