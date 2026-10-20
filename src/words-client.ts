import {Endpoint, Rest} from '@vdegenne/mini-rest'
import toast from 'toastit'

const wordsClient = new Rest<{
	post: {
		toggle: Endpoint<{lang: string; word: string}, {removed: boolean}>
	}
}>('http://127.0.0.1:8000')

export async function toggleSaveWord(lang: string, word: string) {
	try {
		const response = await wordsClient.post('toggle', {
			lang,
			word,
		})
		if (!response.ok) {
			throw 1
		}
		const data = await response.json()
		if (!data.removed) {
			toast('Word added')
		} else {
			toast('Word removed')
		}
	} catch {
		toast("Couldn't save the word")
		return
	}
}
