import {Mode} from '@vdegenne/mini-gamepad'
import {Repeater} from '@vdegenne/mini-gamepad/repeater.js'
import {mainPage} from './pages/page-main.js'
import {store} from './store.js'

export const leftPrevRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				// mainPage.highlighter.previous()
				mainPage.previous()
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendLeftHighlight()
				break
			case Mode.TERTIARY:
				// mainPage.highlighter.reduceRightHighlight()
				mainPage.increaseLeftWordSelection()
				break
		}
	},
})

export const leftNextRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				// mainPage.highlighter.next()
				mainPage.next()
				break
			case Mode.PRIMARY:
				// mainPage.highlighter.extendRightHighlight()
				mainPage.highlighter.reduceLeftHighlight()
				break
			case Mode.TERTIARY:
				mainPage.decreaseLeftWordSelection()
				break
		}
	},
})

export const upRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs / 0.5, // was 60
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

console.log(store.repeaterIntervalMs)
export const downRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs / 0.5, // was 60
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
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		console.log(mode)
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				// mainPage.highlighter.extendRightHighlight()
				mainPage.highlighter.reduceRightHighlight()
				break
			case Mode.TERTIARY:
				mainPage.decreaseRightWordSelection()
				break
		}
	},
})

export const rightNextRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendRightHighlight()
				break

			case Mode.TERTIARY:
				// mainPage.highlighter.reduceRightHighlight()
				mainPage.increaseRightWordSelection()
				break
		}
	},
})

export const rightUpRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs, // was 60
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
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs, // was 60
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
