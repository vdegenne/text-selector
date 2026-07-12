import {GoogleGenAI, ThinkingLevel, Type} from '@google/genai'

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

	return JSON.parse(response.text)
}
