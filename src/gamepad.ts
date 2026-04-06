import {ReactiveController} from '@snar/lit'
import {googleImagesOpen, lazyMapOpen} from '@vdegenne/links'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {
	downRepeater,
	nextRepeater,
	prevRepeater,
	upRepeater,
} from './gamepad-repeaters.js'
import {getMainPage} from './pages/index.js'
import {mainPage} from './pages/page-main.js'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 100,
			axesThreshold: 0.2,
			debug: true,
		})
		minigp.onConnect(async (gamepad) => {
			this.gamepad = gamepad
			const map = gamepad.mapping
			const loadTime = Date.now()
			const {
				LEFT_STICK_UP: lup,
				LEFT_STICK_DOWN: ldown,
				LEFT_STICK_LEFT: lleft,
				LEFT_STICK_RIGHT: lright,
				LEFT_STICK_PRESS: lpress,
				RIGHT_STICK_UP: rup,
				RIGHT_STICK_DOWN: rdown,
				RIGHT_STICK_LEFT: rleft,
				RIGHT_STICK_RIGHT: rright,
				RIGHT_STICK_PRESS: rpress,
				LEFT_BUTTONS_TOP: dpadup,
				LEFT_BUTTONS_BOTTOM: dpaddown,
				LEFT_BUTTONS_LEFT: dpadleft,
				LEFT_BUTTONS_RIGHT: dpadright,
				RIGHT_BUTTONS_BOTTOM: a,
				RIGHT_BUTTONS_RIGHT: b,
				RIGHT_BUTTONS_LEFT: x,
				RIGHT_BUTTONS_TOP: y,
				L1: l1,
				L2: l2,
				R1: r1,
				R2: r2,
				MIDDLE_LEFT: back,
				MIDDLE_RIGHT: start,
				MIDDLE_BOTTOM: screenshot,
				MIDDLE_TOP: guide,
			} = map

			let execute = true

			window.addEventListener(
				'voice-recorder-open',
				() => (gamepad.enabled = false),
			)
			window.addEventListener(
				'voice-recorder-close',
				() => (gamepad.enabled = true),
			)

			gamepad.for(map.LEFT_STICK_PRESS).before(({mode}) => {
				switch (mode) {
					case Mode.PRIMARY:
						getMainPage()?.addCurrentSelectionToJpSynDex()
						break
					case Mode.SECONDARY:
						getMainPage()?.copySelectionToClipBoard()
						break
				}
			})

			gamepad
				.for(map.LEFT_STICK_LEFT)
				.before(({mode}) => {
					prevRepeater.start(mode)
				})
				.after(() => {
					prevRepeater.stop()
				})

			gamepad
				.for(map.LEFT_STICK_RIGHT)
				.before(({mode}) => {
					nextRepeater.start(mode)
				})
				.after(() => {
					nextRepeater.stop()
				})

			gamepad
				.for(map.LEFT_STICK_UP)
				.before(({mode}) => {
					upRepeater.start(mode)
				})
				.after(() => {
					upRepeater.stop()
				})
			gamepad
				.for(map.LEFT_STICK_DOWN)
				.before(({mode}) => {
					downRepeater.start(mode)
				})
				.after(() => {
					downRepeater.stop()
				})
			gamepad.for(x).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						mainPage.highlightWordUnderCursor()
						break
					case Mode.PRIMARY:
						mainPage.selectAll()
				}
			})

			gamepad.for(map.RIGHT_STICK_LEFT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
				}
			})
			gamepad.for(map.RIGHT_STICK_RIGHT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
				}
			})

			gamepad.for(map.RIGHT_BUTTONS_BOTTOM).before(async ({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.TERTIARY:
						break
				}
			})
			gamepad.for(map.RIGHT_BUTTONS_RIGHT).before(({mode}) => {
				if (mode === Mode.NORMAL) {
				}
			})

			gamepad.for(map.L1).before(({mode}) => {
				if (mode === Mode.NORMAL) {
				}
			})
			gamepad.for(map.R1).before(({mode}) => {
				if (mode === Mode.NORMAL) {
				}
			})

			gamepad.for(map.LEFT_BUTTONS_LEFT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.PRIMARY:
						// Trick to avoid trigger this event on page open
						if (Date.now() - loadTime > 100) {
							mainPage.openChatGPTSelector()
						}
						break
					case Mode.TERTIARY:
						break
				}
			})
			gamepad.for(map.LEFT_BUTTONS_RIGHT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						getMainPage()?.openCNRTL()
						break
				}
			})

			gamepad.for(map.LEFT_BUTTONS_TOP).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.PRIMARY:
						break
				}
			})

			gamepad.for(map.LEFT_BUTTONS_BOTTOM).before(({mode}) => {
				const {highlightContent} = mainPage.highlighter.getInfo()
				if (highlightContent) {
					switch (mode) {
						case Mode.NORMAL:
							googleImagesOpen(highlightContent)
							break
						case Mode.PRIMARY:
							lazyMapOpen(highlightContent)
							break
					}
				}
			})

			gamepad.for(map.RIGHT_BUTTONS_TOP).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.PRIMARY:
						break
					case Mode.SECONDARY:
					case Mode.TERTIARY:
				}
			})

			gamepad.for(map.MIDDLE_LEFT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						mainPage.openFullScreener()
						break
				}
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
