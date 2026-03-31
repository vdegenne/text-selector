import {ReactiveController} from '@snar/lit'
import {googleImagesOpen} from '@vdegenne/links'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {
	downRepeater,
	nextRepeater,
	prevRepeater,
	upRepeater,
} from './gamepad-repeaters.js'
import {mainPage} from './pages/page-main.js'
import {getMainPage} from './pages/index.js'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 200,
			axesThreshold: 0.2,
		})
		minigp.onConnect((gamepad) => {
			this.gamepad = gamepad
			const map = gamepad.mapping

			let execute = true
			window.addEventListener('chatgpt-selector-open', () => {
				execute = false
			})
			window.addEventListener('chatgpt-selector-close', () => {
				execute = true
			})

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
			gamepad.for(map.RIGHT_BUTTONS_LEFT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						mainPage.highlightWordUnderCursor()
						break
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
				switch (mode) {
					case Mode.NORMAL:
						const {highlightContent} = mainPage.highlighter.getInfo()
						if (highlightContent) {
							googleImagesOpen(highlightContent)
						}
						break
					case Mode.PRIMARY:
						break
				}
			})

			gamepad.for(map.LEFT_BUTTONS_LEFT).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.PRIMARY:
						mainPage.openChatGPTSelector()
						break
					case Mode.TERTIARY:
						break
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
