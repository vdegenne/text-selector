import {Mode} from '@vdegenne/mini-gamepad'
import {Repeater} from '@vdegenne/mini-gamepad/repeater.js'
import {mainPage} from './pages/page-main.js'

const repeatTimeoutMs = 300

export const prevRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 30,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.highlighter.previous()
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendLeftHighlight()
				break

			case Mode.TERTIARY:
				// mainPage.highlighter.reduceRightHighlight()
				break
		}
	},
})

export const nextRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 30,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.highlighter.next()
				break
			case Mode.PRIMARY:
				// mainPage.highlighter.extendRightHighlight()
				mainPage.highlighter.reduceLeftHighlight()
				break
			case Mode.TERTIARY:
				break
		}
	},
})

export const upRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 60,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.previousLine()
				break
			case Mode.PRIMARY:
				// mainPage.previousLine(true)
				mainPage.moveSelectionStartToPreviousLine()
				break
		}
	},
})

export const downRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 60,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.nextLine()
				break
			case Mode.PRIMARY:
				// mainPage.nextLine(true)
				mainPage.moveSelectionStartToNextLine()
				break
		}
	},
})

/**
 * RIGHT JOYSTICK
 */

export const rightPrevRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 30,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendRightHighlight()
				break

			case Mode.TERTIARY:
				// mainPage.highlighter.reduceRightHighlight()
				break
		}
	},
})

export const rightNextRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 30,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				// mainPage.highlighter.extendRightHighlight()
				mainPage.highlighter.reduceRightHighlight()
				break
			case Mode.TERTIARY:
				break
		}
	},
})

export const rightUpRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 60,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				// mainPage.nextLine(true)
				mainPage.moveSelectionEndToPreviousLine()
				break
		}
	},
})

export const rightDownRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 60,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				// mainPage.nextLine(true)
				mainPage.moveSelectionEndToNextLine()
				break
		}
	},
})
