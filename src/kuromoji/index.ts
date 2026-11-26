import { Kuromoji } from './kuromoji.client.js'

export const kuromoji = new Kuromoji({
	dicPath: `${import.meta.env.BASE_URL}dict/`,
	onProgress(progress) {
		// console.log('[Kuromoji progress]', progress)
	},
})
