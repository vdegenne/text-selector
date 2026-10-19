import {GoogleGenAI, ThinkingLevel, Type} from '@google/genai'
import {askGemini as _askGemini, RateLimitError} from '@vdegenne/gemini'
import toast from 'toastit'
import {store} from './store.js'

export async function askGemini(
	sentence: string,
	options: {apiKey: string},
): Promise<string> {
	const ai = new GoogleGenAI({apiKey: options.apiKey})

	const response = await ai.models.generateContent({
		model: 'gemini-3.1-flash-lite',
		// model: 'gemini-3.5-flash',
		contents: `Analyze this japanese sentence: ${sentence}`,
		config: {
			// systemInstruction: [{text: `Answer with only one sentence or two.`}],
			// thinkingConfig: {
			// 	thinkingLevel: ThinkingLevel.MINIMAL,
			// },
			thinkingConfig: {
				thinkingLevel: ThinkingLevel.MINIMAL,
			},
			responseMimeType: 'application/json',
			responseSchema: {
				type: Type.OBJECT,
				properties: {
					sentence: {type: Type.STRING},
					overallMeaning: {type: Type.STRING},
					romanization: {type: Type.STRING},
					literalGloss: {type: Type.STRING},
					parts: {
						type: Type.ARRAY,
						items: {
							type: Type.OBJECT,
							properties: {
								word: {type: Type.STRING},
								furigana: {type: Type.STRING},
								romaji: {type: Type.STRING},
								partOfSpeech: {type: Type.STRING},
								partOfSpeechJa: {type: Type.STRING},
								category: {type: Type.STRING},
								baseForm: {type: Type.STRING},
								translation: {type: Type.STRING},
								explanation: {type: Type.STRING},
							},
							required: [
								'word',
								'furigana',
								'romaji',
								'partOfSpeech',
								'partOfSpeechJa',
								'category',
								'baseForm',
								'translation',
								'explanation',
							],
						},
					},
				},
				required: [
					'sentence',
					'overallMeaning',
					'romanization',
					'literalGloss',
					'parts',
				],
			},
		},
	})

	return JSON.stringify(response.text)
}

export async function geminiTranslate(
	content: string,
): Promise<string | undefined> {
	try {
		const {output} = await _askGemini(
			`Traduis en francais et donne la romanisation entre parenthèses (séparés par une nouvelle ligne): "${content}"`,
			{
				apiKey: store.geminiApiKey,
				model: store.geminiModel,
				thinkingLevel: 'low',
				systemInstruction: 'Just give the answer, no talking.',
			},
		)
		return output
	} catch (err) {
		if (err instanceof RateLimitError) {
			toast('Rate Limit reached for this model!')
		} else {
			throw err
		}

		return undefined
	}
}
