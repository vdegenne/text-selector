import {Mode} from '@vdegenne/mini-gamepad'
import {Repeater} from '@vdegenne/mini-gamepad/repeater.js'
import {mainPage} from './pages/page-main.js'

const repeatTimeoutMs = 300

export const prevRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 38,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.highlighter.previous()
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendLeftHighlight()
				break

			case Mode.TERTIARY:
				mainPage.highlighter.reduceRightHighlight()
				break
		}
	},
})

export const nextRepeater = new Repeater({
	repeatTimeoutMs,
	speedMs: 38,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				mainPage.highlighter.next()
				break
			case Mode.PRIMARY:
				mainPage.highlighter.extendRightHighlight()
				break
			case Mode.TERTIARY:
				mainPage.highlighter.reduceLeftHighlight()
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
		}
	},
})
