import { NavigationStyle } from '@vdegenne/highlight-manager'
import { Mode } from '@vdegenne/mini-gamepad'
import { Repeater } from '@vdegenne/mini-gamepad/repeater.js'
import { app } from './app-shell/app-shell.js'
import { store } from './store.js'

// const profiler = new Profiler(1000)
// profiler.startReporting()

export const leftPrevRepeater = new Repeater({
	initialDelayMs: store.repeaterInitialDelayMs,
	intervalMs: store.repeaterIntervalMs,
	action(mode) {
		switch (mode) {
			case Mode.NORMAL:
				// profiler.start()
				app.mainPage.highlighter.previous({
					navigationStyle: NavigationStyle.INDEX_BASED,
				})
				// profiler.end()
				break
			case Mode.PRIMARY:
				app.mainPage.highlighter.extendLeftHighlight()
				break
			case Mode.TERTIARY:
				// app.mainPage.highlighter.reduceRightHighlight()
				app.mainPage.increaseLeftWordSelection()
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
				// profiler.start()
				app.mainPage.highlighter.next({
					navigationStyle: NavigationStyle.INDEX_BASED,
				})
				// profiler.end()
				break
			case Mode.PRIMARY:
				// app.mainPage.highlighter.extendRightHighlight()
				app.mainPage.highlighter.reduceLeftHighlight()
				break
			case Mode.TERTIARY:
				app.mainPage.decreaseLeftWordSelection()
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
				// app.mainPage.previousLine()
				// profiler.start()
				if (!app.mainPage.highlighter.up({ medianBreak: false })) {
					app.mainPage.previousLine()
					// app.mainPage.highlighter.relativeMotion({
					// 	anchor: Anchor.TOP_CENTER,
					// 	rectOverride: {
					// 		top: window.innerHeight - 10,
					// 		bottom: window.innerHeight,
					// 	},
					// })
				}
				// profiler.end()
				break
			case Mode.PRIMARY:
				// app.mainPage.previousLine(true)
				app.mainPage.moveSelectionStartToPreviousLine()
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
				// profiler.start()
				if (
					!app.mainPage.highlighter.down({
						medianBreak: false,
					})
				) {
					app.mainPage.nextLine()
					// app.mainPage.highlighter.relativeMotion({
					// 	anchor: Anchor.BOTTOM_CENTER,
					// 	rectOverride: {
					// 		top: 0,
					// 		bottom: 10,
					// 	},
					// })
				}
				// profiler.end()
				break
			case Mode.PRIMARY:
				// app.mainPage.nextLine(true)
				app.mainPage.moveSelectionStartToNextLine()
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
				// app.mainPage.highlighter.extendRightHighlight()
				app.mainPage.highlighter.reduceRightHighlight()
				break
			case Mode.TERTIARY:
				app.mainPage.decreaseRightWordSelection()
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
				app.mainPage.highlighter.extendRightHighlight()
				break

			case Mode.TERTIARY:
				// app.mainPage.highlighter.reduceRightHighlight()
				app.mainPage.increaseRightWordSelection()
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
				// app.mainPage.nextLine(true)
				app.mainPage.moveSelectionEndToPreviousLine()
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
				// app.mainPage.nextLine(true)
				app.mainPage.moveSelectionEndToNextLine()
				break
		}
	},
})
