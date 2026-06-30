import type {MdDialog} from '@material/web/all.js'
import '@material/web/slider/slider.js'
import {withController} from '@snar/lit'
import {customElement} from 'custom-element-decorator'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query, state} from 'lit/decorators.js'
import '../card-element.js'
import {gamepadCtrl} from '../gamepad.js'
import '../material/dialog-patch.js'
import '../material/item-patch.js'
import {store} from '../store.js'
import {renderThemeElements} from '../styles/theme-elements.js'
import {themeStore} from '../styles/themeStore.js'
import styles from './settings-dialog.css?inline'

@customElement({name: 'settings-dialog', inject: true})
@withStyles(styles)
@withController(themeStore)
@withController(store)
export class SettingsDialog extends LitElement {
	@state() open = false

	@query('md-dialog') dialog!: MdDialog

	render() {
		return html`
			<md-dialog
				?open="${this.open}"
				@open="${() => {
					try {
						gamepadCtrl.gamepad.enabled = false
					} catch {}
				}}"
				@close="${() => {
					try {
						gamepadCtrl.gamepad.enabled = true
					} catch {}
				}}"
				@closed="${() => (this.open = false)}"
				style="max-width:min(100vw - 18px, 500px);width:100%"
			>
				<header slot="headline" class="select-none">
					<md-icon>settings</md-icon>
					Settings
				</header>

				<form slot="content" method="dialog" id="form" class="">
					<card-element headline="display">
						${store.F.SLIDER('Font size (px)', 'fontSizePx', {
							min: 8,
							max: 100,
							step: 1,
						})}
						${store.F.SLIDER('Font weight', 'fontWeight', {
							min: 100,
							max: 900,
							step: 50,
						})}
					</card-element>

					<card-element headline="behavior">
						${store.F.SWITCH(
							'Open in same tab on most highlighted',
							'mostHighlightedOpenInSameTab',
						)}
					</card-element>

					<card-element headline="audio">
						${store.F.SLIDER('Audio volume', 'audioVolume', {
							min: 0,
							max: 1,
							step: 0.1,
						})}
					</card-element>

					<card-element headline="theme">
						${renderThemeElements()}
					</card-element>
				</form>

				<div slot="actions">
					<md-text-button form="form" autofocus>Close</md-text-button>
				</div>
			</md-dialog>
		`
	}

	async show() {
		if (this.dialog.open) {
			const dialogClose = new Promise((resolve) => {
				const resolveCB = () => {
					resolve(null)
					this.dialog.removeEventListener('closed', resolveCB)
				}
				this.dialog.addEventListener('closed', resolveCB)
			})
			this.dialog.close()
			await dialogClose
		}
		this.open = true
	}

	close(returnValue?: string) {
		return this.dialog.close(returnValue)
	}
}

declare global {
	interface Window {
		settingsDialog: SettingsDialog
	}
	interface HTMLElementTagNameMap {
		'settings-dialog': SettingsDialog
	}
}

export const settingsDialog = (window.settingsDialog = new SettingsDialog())
