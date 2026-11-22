export const languagesInfo = {
	en: {
		fullName: 'English',
		englishName: 'English',
		flag: '🇬🇧',
		languageCode: 'en-US',
		instruction: 'Always respond in English.',
		nativeInstruction: 'Always respond in English.',
	},
	// Zh: {
	// 	fullName: '中文',
	// 	englishName: 'Chinese',
	// 	flag: '🇨🇳',
	// 	languageCode: 'zh-CN',
	// 	instruction: 'Always respond in Chinese.',
	// 	nativeInstruction: '始终使用中文回答。',
	// },
	// Hi: {
	// 	fullName: 'हिन्दी',
	// 	englishName: 'Hindi',
	// 	flag: '🇮🇳',
	// 	languageCode: 'hi-IN',
	// 	instruction: 'Always respond in Hindi.',
	// 	nativeInstruction: 'हमेशा हिंदी में जवाब दें।',
	// },
	// Es: {
	// 	fullName: 'Español',
	// 	englishName: 'Spanish',
	// 	flag: '🇪🇸',
	// 	languageCode: 'es-ES',
	// 	instruction: 'Always respond in Spanish.',
	// 	nativeInstruction: 'Responde siempre en español.',
	// },
	// Ar: {
	// 	fullName: 'العربية',
	// 	englishName: 'Arabic',
	// 	flag: '🇸🇦',
	// 	languageCode: 'ar-SA',
	// 	instruction: 'Always respond in Modern Standard Arabic.',
	// 	nativeInstruction: 'أجب دائمًا باللغة العربية الفصحى.',
	// },
	fr: {
		fullName: 'Français',
		englishName: 'French',
		flag: '🇫🇷',
		languageCode: 'fr-FR',
		instruction: 'Always respond in French.',
		nativeInstruction: 'Répondez toujours en français.',
	},
	// Bn: {
	// 	fullName: 'বাংলা',
	// 	englishName: 'Bengali',
	// 	flag: '🇧🇩',
	// 	languageCode: 'bn-BD',
	// 	instruction: 'Always respond in Bengali.',
	// 	nativeInstruction: 'সবসময় বাংলায় উত্তর দিন।',
	// },
	// Pt: {
	// 	fullName: 'Português',
	// 	englishName: 'Portuguese',
	// 	flag: '🇵🇹',
	// 	languageCode: 'pt-BR',
	// 	instruction: 'Always respond in Portuguese.',
	// 	nativeInstruction: 'Responda sempre em português.',
	// },
	// Id: {
	// 	fullName: 'Bahasa Indonesia',
	// 	englishName: 'Indonesian',
	// 	flag: '🇮🇩',
	// 	languageCode: 'id-ID',
	// 	instruction: 'Always respond in Indonesian.',
	// 	nativeInstruction: 'Selalu jawab dalam bahasa Indonesia.',
	// },
	// Ur: {
	// 	fullName: 'اردو',
	// 	englishName: 'Urdu',
	// 	flag: '🇵🇰',
	// 	languageCode: 'ur-PK',
	// 	instruction: 'Always respond in Urdu.',
	// 	nativeInstruction: 'ہمیشہ اردو میں جواب دیں۔',
	// },
	ja: {
		fullName: '日本語',
		englishName: 'Japanese',
		flag: '🇯🇵',
		languageCode: 'ja-JP',
		instruction: 'Always respond in Japanese.',
		nativeInstruction: '常に日本語で回答してください。',
	},
	// It: {
	// 	fullName: 'Italiano',
	// 	englishName: 'Italian',
	// 	flag: '🇮🇹',
	// 	languageCode: 'it-IT',
	// 	instruction: 'Always respond in Italian.',
	// 	nativeInstruction: 'Rispondi sempre in italiano.',
	// },
	// Ko: {
	// 	fullName: '한국어',
	// 	englishName: 'Korean',
	// 	flag: '🇰🇷',
	// 	languageCode: 'ko',
	// 	instruction: 'Always respond in Korean.',
	// 	nativeInstruction: '항상 한국어로 답변하세요.',
	// },
} as const

export const availableLanguages = Object.keys(
	languagesInfo,
) as (keyof typeof languagesInfo)[]

export type Language = (typeof availableLanguages)[number]

export const languagesNames = Object.values(languagesInfo).map(
	(lang) => lang.englishName,
)

export type LanguageName = (typeof languagesNames)[number]

export function getLanguageCode(language: Language) {
	return languagesInfo[language].languageCode
}
