declare namespace tselect {
	interface LineInfo {
		line: string
		/**
		 * Index of the first character of this line relative to the whole text
		 */
		firstCharIndex: number
		/**
		 * Length of the text
		 */
		length: number

		/**
		 * Cursor index relative to this line
		 * undefined if the cursor is not in the line
		 */
		cursorIndex?: number
	}

	interface TextInfo {
		/**
		 * Number of lines in the text
		 */
		numberOfLines: number
		/**
		 * Information about the lines
		 */
		lines: LineInfo[]
		/**
		 * The line of the cursor's current position
		 * @default 0
		 */
		currentLineIndex: number

		previousLineIndex: number
		nextLineIndex: number
	}

	interface TextInfoOptions {
		lineDelimiter?: string
		cursorPosition?: number
	}

	type CharType =
		| 'newLine'
		| 'hiragana'
		| 'katakana'
		| 'kanji'
		| 'roman'
		| 'number'
		| 'connector'
		| 'punctuation'
		| 'space'
		| 'symbol'
		| 'other'
}
