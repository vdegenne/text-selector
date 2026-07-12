import {hasSomeJapanese} from 'asian-regexps'
import {cquerySelector} from 'html-vision'
import toast from 'toastit'
import {askGemini} from './gemini.js'
import {openSettingsDialog} from './imports.js'
import {store} from './store.js'

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
			function showJson(json: unknown) {
				const win = window.open('', '_blank')

				if (!win) {
					return
				}

				const doc = win.document

				doc.title = 'JSON'

				const style = doc.createElement('style')
				style.textContent = `
		body {
			margin: 16px;
			font-family: monospace;
			background: #1e1e1e;
			color: #ddd;
		}

		pre {
			white-space: pre-wrap;
			word-break: break-word;
		}
	`

				const pre = doc.createElement('pre')
				pre.textContent = JSON.stringify(json, null, 2)

				doc.head.append(style)
				doc.body.append(pre)
			}
			if (!store.geminiApiKey) {
				toast('No Gemini API Key found. (press S to open the settings.)')
				return
			}
			const sentence = store.input
			if (!sentence) {
				toast('No content to analyze.')
				return
			}

			if (!hasSomeJapanese(sentence)) {
				toast('Only Japanese content supported for now.')
				return
			}

			try {
				const response = await askGemini(sentence, {apiKey: store.geminiApiKey})
				showJson(response)
				// console.log(response)
			} catch (err) {
				toast(err)
			}
			break
	}
})
