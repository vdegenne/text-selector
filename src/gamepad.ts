import {ReactiveController} from '@snar/lit'
import {
	googleImagesOpen,
	googleImagesUrl,
	googleTranslateOpen,
	lazyMapOpen,
	lazyMapUrl,
	siteDexOpen,
	weblioOpen,
} from '@vdegenne/links'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {hasSomeJapanese} from 'asian-regexps'
import {state} from 'lit/decorators.js'
import {
	downRepeater,
	leftNextRepeater,
	leftPrevRepeater,
	rightDownRepeater,
	rightNextRepeater,
	rightPrevRepeater,
	rightUpRepeater,
	upRepeater,
} from './gamepad-repeaters.js'
import {getMainPage} from './pages/index.js'
import {mainPage} from './pages/page-main.js'
import {store} from './store.js'
import {copyToClipboard, isValidUrl, japsyndexOpen} from './utils.js'
import toast from 'toastit'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 100,
			axesThreshold: 0.5,
			debug: true,
		})
		minigp.onConnect(async (gamepad) => {
			const initDate = Date.now()
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
			// Make sure we stop all repeaters when we leave the page.
			window.addEventListener('blur', () => {
				leftPrevRepeater.stop()
				leftNextRepeater.stop()
				rightPrevRepeater.stop()
				rightNextRepeater.stop()
				rightUpRepeater.stop()
				rightDownRepeater.stop()
			})

			gamepad.for(lpress).before(({mode}) => {
				switch (mode) {
					case Mode.PRIMARY:
						getMainPage()?.addCurrentSelectionToJpSynDex()
						break
					case Mode.SECONDARY:
						getMainPage()?.copySelectionToClipBoard()
						break
					case Mode.TERTIARY:
						const content = mainPage.getContent()
						if (content) {
							const input = `[${content}]`
							copyToClipboard(input)
							toast(input)
						}
						break
				}
			})

			gamepad
				.for(lleft)
				.before(({mode}) => {
					leftPrevRepeater.start(mode)
				})
				.after(() => {
					leftPrevRepeater.stop()
				})

			gamepad
				.for(lright)
				.before(({mode}) => {
					leftNextRepeater.start(mode)
				})
				.after(() => {
					leftNextRepeater.stop()
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
				// To avoid running this on page call
				if (Date.now() - initDate < 100) {
					return
				}

				switch (mode) {
					case Mode.NORMAL:
						leftNextRepeater.stop()
						leftPrevRepeater.stop()
						// rightNextRepeater.stop()
						// rightPrevRepeater.stop()
						mainPage.highlightWordUnderCursor()
						break
					case Mode.PRIMARY:
						mainPage.selectAll()
				}
			})

			gamepad
				.for(rleft)
				.before(({mode}) => {
					rightPrevRepeater.start(mode)
				})
				.after(() => {
					rightPrevRepeater.stop()
				})
			gamepad
				.for(rright)
				.before(({mode}) => {
					rightNextRepeater.start(mode)
				})
				.after(() => {
					rightNextRepeater.stop()
				})
			gamepad
				.for(map.RIGHT_STICK_UP)
				.before(({mode}) => {
					rightUpRepeater.start(mode)
				})
				.after(() => {
					rightUpRepeater.stop()
				})
			gamepad
				.for(map.RIGHT_STICK_DOWN)
				.before(({mode}) => {
					rightDownRepeater.start(mode)
				})
				.after(() => {
					rightDownRepeater.stop()
				})

			gamepad.for(map.RIGHT_BUTTONS_BOTTOM).before(async ({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
					case Mode.TERTIARY:
						break
				}
			})
			gamepad.for(b).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						const content = mainPage.getContent()
						if (content) {
							if (isValidUrl(content)) {
								window.open(content, '_blank')
							} else if (content.startsWith('@')) {
								window.open(
									`https://x.com/${encodeURIComponent(content.slice(1))}`,
									'_blank',
								)
							} else if (content.startsWith('#')) {
								window.open(
									`https://x.com/hashtag/${encodeURIComponent(content.slice(1))}`,
									'_blank',
								)
							} else if (content.startsWith('$')) {
								window.open(`https://x.com/hashtag/${content}`, '_blank')
							}
						}
						break
				}
			})

			gamepad.for(map.R1).before(({mode}) => {
				if (mode === Mode.NORMAL) {
				}
			})

			gamepad.for(dpadleft).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						const content = mainPage.getContent()
						if (content) {
							if (hasSomeJapanese(content)) {
								weblioOpen(content)
							}
						}
						break
					case Mode.PRIMARY:
						// Trick to avoid trigger this event on page open
						if (Date.now() - loadTime > 70) {
							mainPage.openChatGPTSelector()
						}
						break
					case Mode.TERTIARY:
						break
				}
			})
			gamepad.for(dpadright).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						mainPage.openCNRTLOrJisho()
						break
				}
			})

			gamepad.for(dpadup).before(({mode}) => {
				const {highlightContent} = mainPage.highlighter.getInfo()
				if (!highlightContent) return

				switch (mode) {
					case Mode.NORMAL:
						googleTranslateOpen(highlightContent, 'french')
						break
					case Mode.PRIMARY:
						japsyndexOpen(highlightContent)
						break
				}
			})

			gamepad.for(dpaddown).before(({mode}) => {
				const {highlightContent} = mainPage.highlighter.getInfo()
				if (highlightContent) {
					switch (mode) {
						case Mode.NORMAL:
							if (
								store.mostHighlightedOpenInSameTab &&
								mainPage.isMostHighlighted()
							) {
								window.location.href = googleImagesUrl(highlightContent)
							} else {
								googleImagesOpen(highlightContent)
							}
							break
						case Mode.PRIMARY:
							if (
								store.mostHighlightedOpenInSameTab &&
								mainPage.isMostHighlighted()
							) {
								window.location.href = lazyMapUrl(highlightContent)
							} else {
								lazyMapOpen(highlightContent)
							}
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

			gamepad.for(l1).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						mainPage.speakSelection()
						break

					case Mode.PRIMARY:
						const {highlightContent} = mainPage.highlighter.getInfo()
						if (highlightContent) {
							// youtubeSearchOpen(`${highlightContent} prononciation`)
							siteDexOpen(highlightContent)
						}
						break
					case Mode.SECONDARY:
					case Mode.TERTIARY:
				}
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
