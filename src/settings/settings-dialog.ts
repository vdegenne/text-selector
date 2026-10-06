import type {MdDialog, MdTabs} from '@material/web/all.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/list/list-item.js'
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import '@material/web/slider/slider.js'
import '@material/web/switch/switch.js'
import '@material/web/textfield/filled-text-field.js'
import {withController} from '@snar/lit'
import {customElement} from 'custom-element-decorator'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query, state} from 'lit/decorators.js'
import toast from 'toastit'
import '../card-element.js'
import {enTTSs, fontFamily, frTTSs, jaTTSs} from '../constants.js'
import {gamepadCtrl} from '../gamepad.js'
import '../material/dialog-patch.js'
import '../material/item-patch.js'
import {store} from '../store.js'
import {renderThemeElements} from '../styles/theme-elements.js'
import {themeStore} from '../styles/themeStore.js'
import {copyToClipboard} from '../utils.js'
import styles from './settings-dialog.css?inline'
import {voicevox} from '../voicevox.js'
import {kokoroSettings, voicevoxSettings} from '../templates.js'
import {kokoro} from '../kokoro.js'
// import '@material/web/textfield/outlined-text-field.js';

type TtsSelectedLabel = 'JA' | 'EN' | 'FR'

console.log(voicevox)

@customElement({name: 'settings-dialog', inject: true})
@withStyles(styles)
@withController(themeStore)
@withController(store)
@withController(kokoro)
@withController(voicevox)
export class SettingsDialog extends LitElement {
	@state() open = false

	@state() passwordHidden = true

	@state() ttsSelectedLabel: TtsSelectedLabel = 'JA'

	@query('md-dialog') dialog!: MdDialog

	render() {
		console.log('RENDER.........................')
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
				class="w-full h-full"
				style="max-width:min(100vw - 18px, 600px); max-height:min(100vh - 12px, 1000px);"
			>
				<header slot="headline" class="select-none">
					<md-icon>settings</md-icon>
					Settings
				</header>

				<form slot="content" method="dialog" id="form" class="">
					<card-element headline="global">
						${store.F.SWITCH('Break on punctuations', 'breakSentences', {supportingText: 'If enabled, will add new lines between sentence punctuations.'})}
						${store.F.SWITCH(
							'Open in same tab on most highlighted',
							'mostHighlightedOpenInSameTab',
						)}
						<md-divider></md-divider>
						${store.F.SWITCH(
							"Close fullscreen on window's focus",
							'closeFullScreenOnWindowFocus',
							{},
						)}
						${store.F.SWITCH(
							'Prevent closing on full selection',
							'fullscreenPreventClosingWhenFullSelection',
							{
								disabled: !store.closeFullScreenOnWindowFocus,
								style: {['padding-left']: '24px'},
							},
						)}
						${store.F.SLIDER('Audio volume', 'volume', {
							min: 0,
							max: 1,
							step: 0.1,
						})}
					</card-element>

					<card-element headline="display">
						<md-elevated-card
							hidden
							jp
							class="font-(--font-weight) text-(--font-size-px)"
							style="font-weight: var(--font-weight); font-size: var(--font-size-px);"
						>
							<span class="leading-normal"
								>武力を用いた対抗措置は基本的に禁止されるが</span
							>
						</md-elevated-card>
						${store.F.SELECT('Font family', 'font', fontFamily, {menuPositioning: 'popover'})}
						${store.F.SLIDER('Font size (px)', 'fontSizePx', {
							min: 8,
							max: 100,
							step: 1,
							// timeoutMs: 20,
						})}
						${store.F.SLIDER('Font weight', 'fontWeight', {
							min: 100,
							max: 900,
							step: 50,
							// timeoutMs: 20,
						})}
						${store.F.SLIDER(
							'Line vertical padding (px)',
							'lineVerticalPaddingPx',
							{
								min: 0,
								max: 50,
								step: 1,
							},
						)}
					</card-element>

					<card-element headline="TTS">
						<md-tabs
							@change="${(event: CustomEvent) => {
								const tabs = event.currentTarget as MdTabs
								const label = tabs.activeTab?.textContent?.trim()

								this.ttsSelectedLabel = label as TtsSelectedLabel
							}}"
						>
							<md-primary-tab>JA</md-primary-tab>
							<md-primary-tab>EN</md-primary-tab>
							<md-primary-tab>FR</md-primary-tab>
						</md-tabs>

						${
							this.ttsSelectedLabel === 'JA'
								? html`<!-- -->
										${store.F.SELECT('TTS', 'jaTTS', jaTTSs)}
										${store.jaTTS === 'voicevox' ? voicevoxSettings(voicevox, store) : null}
										${store.jaTTS === 'kokoro' ? kokoroSettings(kokoro, store, 'Ja') : null}
										<!-- -->`
								: null
						}
						<div
							?hidden=${this.ttsSelectedLabel !== 'EN'}
							class="flex flex-col gap-2"
						>
							${store.F.SELECT('TTS', 'enTTS', enTTSs)}
							${store.enTTS === 'kokoro' ? kokoroSettings(kokoro, store, 'En') : null}
						</div>
						<div
							?hidden=${this.ttsSelectedLabel !== 'FR'}
							class="flex flex-col gap-2"
						>
							${store.F.SELECT('TTS', 'frTTS', frTTSs)}
							${store.frTTS === 'kokoro' ? kokoroSettings(kokoro, store, 'Fr') : null}
						</div>
					</card-element>

					<card-element headline="Gamepad">
						${store.F.SLIDER(
							'Repeater initial delay (ms)',
							'repeaterInitialDelayMs',
							{
								min: 100,
								max: 500,
								step: 10,
								timeoutMs: 200,
								ticks: true,
							},
						)}
						${store.F.SLIDER('Repeater interval (ms)', 'repeaterIntervalMs', {
							min: 10,
							max: 500,
							timeoutMs: 200,
						})}
						${store.F.SWITCH('Loop', 'loop', {supportingText: 'Whether to loop highlight on edges or not.'})}
					</card-element>

					<card-element headline="Gemini API key">
						<md-filled-text-field
							value="${store.geminiApiKey}"
							type="${this.passwordHidden ? 'password' : 'text'}"
							@change="${(event: Event) => {
								store.geminiApiKey = (event.target as any).value
							}}"
						>
							<div slot="trailing-icon">
								<md-icon-button
									toggle
									form=""
									@click="${() => {
										this.passwordHidden = !this.passwordHidden
									}}"
									@change="${(event: Event) => {
										event.stopPropagation()
									}}"
								>
									<md-icon>visibility_off</md-icon>
									<md-icon slot="selected">visibility</md-icon>
								</md-icon-button>

								<md-icon-button
									form=""
									@click="${() => {
										copyToClipboard(store.geminiApiKey)
										toast('API key copied')
									}}"
									@change="${(event: Event) => {
										event.stopPropagation()
									}}"
								>
									<md-icon>content_copy</md-icon>
								</md-icon-button>
							</div>
						</md-filled-text-field>
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
