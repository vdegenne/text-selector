import {cquerySelector} from 'html-vision'
import {askGemini} from './gemini.js'
import {openSettingsDialog} from './imports.js'
import {mainPage} from './pages/page-main.js'
import toast from 'toastit'
import {hasSomeJapanese} from 'asian-regexps'

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
			const sentence = mainPage.getContent()
			if (!hasSomeJapanese(sentence)) return

			const response = await askGemini(sentence, {
				apiKey: '<insert_api_key>',
			})
			console.log(response)
			break
	}
})
