import {cquerySelector} from 'html-vision'
import {askGemini} from './gemini.js'
import {openSettingsDialog} from './imports.js'

const inputNames = ['INPUT', 'TEXTAREA', 'MD-FILLED-TEXT-FIELD']
export function eventIsFromInput(event: Event) {
	return (event.composedPath() as HTMLElement[]).some((el) => {
		return (
			inputNames.includes(el.tagName) || el.hasAttribute?.('contenteditable')
		)
	})
}

window.addEventListener('keypress', async (event: KeyboardEvent) => {
	// console.log(event)

	if (event.altKey || event.ctrlKey) {
		return
	}

	if (eventIsFromInput(event)) {
		return
	}

	const button = cquerySelector(`[key="${event.key}"]`)
	if (button) {
		button?.click()
		return
	}

	switch (event.key) {
		case 'd':
			// ;(await getThemeStore()).toggleMode()
			break
		case 's':
			openSettingsDialog()
			break

		case 't':
			const response = await askGemini(
				'590さんでエイムビジョン買っても流石におもんない？？？',
				{
					apiKey: '<INSERT_YOUR_GEMINI_API_KEY_HERE>',
				},
			)
			console.log(response)
			break
	}
})
