import { type SliderElement } from '@material/web/labs/gb/components/slider/slider-element.js'
import { type TabsElement } from '@material/web/labs/gb/components/tabs/tabs-element.js'
import { withController } from '@snar/lit'
import { geminiModels } from '@vdegenne/gemini/core'
import { customElement } from 'custom-element-decorator'
import { html, LitElement } from 'lit'
import { withStyles } from 'lit-with-styles'
import { query, state } from 'lit/decorators.js'
import '../card-element.js'
import { fontFamily } from '../constants.js'
import { SELECT } from '../forms/components/select.js'
import { SLIDER } from '../forms/components/slider.js'
import { SWITCH } from '../forms/components/switch.js'
import { gamepadCtrl } from '../gamepad.js'
import { store } from '../store.js'
import { themeStore } from '../styles/themeStore.js'
import { enTTSs, frTTSs, jaTTSs } from '../tts2.js'
import { copyToClipboard } from '../utils.js'
import styles from './settings-dialog.css?inline'

// TODO: remove when expressive elements are officially released
import { type DialogElement } from '@mahmoodkhalil/material-web-3-demo/labs/gb/components/dialog/dialog-element.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/dialog/md-gb-dialog.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/textfield/md-gb-text-field.js'
import { TextFieldElement } from '@mahmoodkhalil/material-web-3-demo/labs/gb/components/textfield/text-field-element.js'
import { toast } from '../snackbar.js'

type TtsSelectedLabel = 'JA' | 'EN' | 'FR'

@customElement({ name: 'settings-dialog', inject: true })
@withStyles(styles)
@withController(themeStore)
@withController(store)
export class SettingsDialog extends LitElement {
	@state() passwordHidden = true

	@state() ttsSelectedLabel: TtsSelectedLabel = 'JA'

	@query('md-gb-dialog') dialog!: DialogElement

	render() {
		return html`
			<md-gb-dialog
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
			>
				<span slot="headline" class="flex gap-3"
					><md-gb-icon>settings</md-gb-icon>Settings</span
				>

				<div class="flex flex-col gap-5">
					<card-element headline="Global">
						${SWITCH('Break on punctuations', store, 'breakSentences', { supportingText: 'If enabled, will add new lines between sentence punctuations.' })}
						${SWITCH(
							'Open in same tab on most highlighted',
							store,
							'mostHighlightedOpenInSameTab',
						)}
						<md-gb-divider></md-gb-divider>
						${SWITCH(
							"Close fullscreen on window's focus",
							store,
							'closeFullScreenOnWindowFocus',
							{},
						)}
						${SWITCH(
							'Prevent closing on full selection',
							store,
							'fullscreenPreventClosingWhenFullSelection',
							{
								disabled: !store.closeFullScreenOnWindowFocus,
								style: { ['padding-left']: '24px' },
							},
						)}
						<md-gb-slider
							size="md"
							labeled
							step="0.1"
							min="0"
							max="3"
							value="${store.volume}"
							class="w-full"
							@change="${(e: Event) => {
								store.volume = (e.currentTarget as SliderElement).value
							}}"
						>
							<md-gb-icon slot="icon">volume_up</md-gb-icon>
						</md-gb-slider>
					</card-element>

					<card-element headline="Display">
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
						${SELECT('Font family', store, 'font', fontFamily, { menuPositioning: 'popover' })}
						${SLIDER(
							{ label: 'Font size (px)', host: store, key: 'fontSizePx' },
							{
								min: 8,
								max: 100,
								step: 1,
								iconName: 'format_size',
								// timeoutMs: 20,
							},
						)}
						${SLIDER(
							{ label: 'Font weight', host: store, key: 'fontWeight' },
							{
								min: 100,
								max: 900,
								step: 50,
								iconName: 'format_bold',
								// timeoutMs: 20,
							},
						)}
						${SLIDER(
							{
								label: 'Line vertical padding (px)',
								host: store,
								key: 'lineVerticalPaddingPx',
							},
							{
								min: 0,
								max: 50,
								step: 1,
								iconName: 'height',
							},
						)}
					</card-element>

					<card-element headline="TTS">
						<md-gb-tabs
							@change="${(event: CustomEvent) => {
								const tabs = event.currentTarget as TabsElement
								const label = tabs.selectedTab.textContent?.trim()
								this.ttsSelectedLabel = label as TtsSelectedLabel
							}}"
						>
							<md-gb-tab>JA</md-gb-tab>
							<md-gb-tab>EN</md-gb-tab>
							<md-gb-tab>FR</md-gb-tab>
						</md-gb-tabs>

						${
							this.ttsSelectedLabel === 'JA'
								? html`<!---->
										${SELECT('TTS', store, 'jaTTS', jaTTSs)}
										<!---->`
								: null
						}
						<div
							?hidden=${this.ttsSelectedLabel !== 'EN'}
							class="flex flex-col gap-2"
						>
							${SELECT('TTS', store, 'enTTS', enTTSs)}
						</div>
						<div
							?hidden=${this.ttsSelectedLabel !== 'FR'}
							class="flex flex-col gap-2"
						>
							${SELECT('TTS', store, 'frTTS', frTTSs)}
						</div>
					</card-element>

					<card-element headline="Gamepad">
						${SLIDER(
							{
								label: 'Repeater initial delay (ms)',
								host: store,
								key: 'repeaterInitialDelayMs',
							},
							{
								min: 100,
								max: 500,
								step: 10,
								timeoutMs: 200,
								ticks: true,
							},
						)}
						${SLIDER(
							{
								label: 'Repeater interval (ms)',
								host: store,
								key: 'repeaterIntervalMs',
							},
							{
								min: 10,
								max: 500,
								timeoutMs: 200,
							},
						)}
						${SWITCH('Loop', store, 'loop', { supportingText: 'Whether to loop highlight on edges or not.' })}
					</card-element>

					<card-element headline="Gemini">
						<div class="flex items-center justify-between">
							You can use Gemini to quickly create new sets.
							<md-gb-button
								color="outlined"
								form=""
								href="https://aistudio.google.com/apikey"
								target="_blank"
								>Create key</md-gb-button
							>
						</div>
						<md-gb-text-field
							color="filled"
							label="API key"
							value="${store.geminiApiKey}"
							type="${this.passwordHidden ? 'password' : 'text'}"
							autocomplete="off"
							@input="${(event: Event) => {
								const target = event.target
								if (target instanceof TextFieldElement) {
									store.geminiApiKey = (event.target as any).value
								}
							}}"
						>
							<div slot="trailing-icon">
								<md-gb-icon-button
									toggle
									form=""
									@click="${() => (this.passwordHidden = !this.passwordHidden)}"
								>
									<md-gb-icon>visibility_off</md-gb-icon>
									<md-gb-icon slot="selected">visibility</md-gb-icon>
								</md-gb-icon-button>

								<md-gb-icon-button
									form=""
									@click="${() => {
										if (store.geminiApiKey) {
											copyToClipboard(store.geminiApiKey)
											toast('API key copied')
										}
									}}"
								>
									<md-gb-icon>content_copy</md-gb-icon>
								</md-gb-icon-button>
							</div>
						</md-gb-text-field>
						${SELECT('Model', store, 'geminiModel', geminiModels)}
					</card-element>
				</div>
				<form method="dialog" id="form"></form>

				<md-gb-button slot="actions" form="form" autofocus>Close</md-gb-button>
			</md-gb-dialog>
		`
	}

	show() {
		this.dialog.show()
	}

	close(returnValue?: string) {
		// return this.dialog.close(returnValue)
		this.dialog.close()
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
