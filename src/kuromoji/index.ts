import { Kuromoji } from './kuromoji.client.js'

export const kuromoji = new Kuromoji({
	// dicPath: `${import.meta.env.BASE_URL}dict/`,
	dicPath: '/dict/',
	onProgress(progress) {
		// console.log('[Kuromoji progress]', progress)
	},
})
