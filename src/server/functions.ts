import {hasSomeJapanese} from 'asian-regexps'
import toast from 'toastit'
import {geminiTranslate} from '../gemini.js'
import {mainPage} from '../pages/page-main.js'
import {store} from '../store.js'

export async function translateSelection() {
	if (!store.geminiApiKey) {
		toast('No Gemini API Key found. (press S to open the settings.)')
		return
	}
	const content = mainPage.getContent()
	if (!content) {
		toast('No content to analyze.')
		return
	}

	if (!hasSomeJapanese(content)) {
		toast('Only Japanese content supported for now.')
		return
	}

	try {
		const result = await geminiTranslate(content, {
			apiKey: store.geminiApiKey,
		})
		toast(result, {timeoutMs: -1})
	} catch (err) {
		toast(err)
	}
}
