import {$} from 'html-vision'
import {fullscreenElement} from './fullscreen-element.js'
import {openInLocalhost} from './functions.js'
import {openSettingsDialog} from './imports.js'
import {mainPage} from './pages/page-main.js'
import {translateSelection} from './server/functions.js'
import {store} from './store.js'
import {voicevox} from './voicevox.js'
import toast from 'toastit'

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

	const button = $(`[key="${event.key}"]`)
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
			translateSelection()
			break

		case 'l':
			openInLocalhost()
			break

		case 'r':
			if (store.jaTTS === 'voicevox' && voicevox.state === 'connected') {
				const voiceId = voicevox.getRandomVoiceId()
				store.voicevoxVoiceId = voiceId
				const voiceName = voicevox.getVoiceTitleFromId(voiceId)
				toast(voiceName)
			}
			break
	}
})

window.addEventListener('focus', () => {
	if (store.closeFullScreenOnWindowFocus) {
		if (
			store.fullscreenPreventClosingWhenFullSelection &&
			mainPage.highlighter.isFullyHighlighted
		)
			return

		fullscreenElement.open = false
	}
})
