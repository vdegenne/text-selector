import {Profiler} from '@vdegenne/debug/profiler.js'
import {Anchor, NavigationStyle} from '@vdegenne/highlight-manager'
import {Mode} from '@vdegenne/mini-gamepad'
import {Repeater} from '@vdegenne/mini-gamepad/repeater.js'
import {mainPage} from './pages/page-main.js'
import {store} from './store.js'

const profiler = new Profiler(1000)
profiler.startReporting()

export const leftPrevRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				profiler.start()
				mainPage.highlighter.previous({
					navigationStyle: NavigationStyle.INDEX_BASED,
				})
				profiler.end()
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
				profiler.start()
				mainPage.highlighter.next({
					navigationStyle: NavigationStyle.INDEX_BASED,
				})
				profiler.end()
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
				// mainPage.previousLine()
				profiler.start()
				if (!mainPage.highlighter.up()) {
					// mainPage.highlighter.relativeMotion({
					// 	anchor: Anchor.TOP_CENTER,
					// 	rectOverride: {
					// 		top: window.innerHeight - 10,
					// 		bottom: window.innerHeight,
					// 	},
					// })
				}
				profiler.end()
				break
			case Mode.PRIMARY:
				// mainPage.previousLine(true)
				mainPage.moveSelectionStartToPreviousLine()
				break
		}
	},
})

export const downRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs / 0.5, // was 60
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				profiler.start()
				if (!mainPage.highlighter.down()) {
					// mainPage.highlighter.relativeMotion({
					// 	anchor: Anchor.BOTTOM_CENTER,
					// 	rectOverride: {
					// 		top: 0,
					// 		bottom: 10,
					// 	},
					// })
				}
				profiler.end()
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
