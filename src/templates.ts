import {type ReactiveController} from '@snar/lit'
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import {SELECT, SWITCH} from '@vdegenne/forms/FormBuilder.js'
import {KokoroClient, Language, availableVoices} from '@vdegenne/kokoro'
import {html} from 'lit'

export const nothingYet = () => html`
	<div class="flex items-center justify-center gap-3 m-6">
		<md-icon>folder_open</md-icon>
		<span>Nothing yet :-(</span>
	</div>
`

export const loading = () =>
	html`<!-- -->
		<div class="flex items-center justify-center m-12">
			<md-circular-progress indeterminate></md-circular-progress>
		</div>
		<!-- -->`

export const kokoroSettings = (
	kokoro: KokoroClient,
	store: any,
	lang: Language = 'En',
) => {
	switch (kokoro.state) {
		case 'disconnected':
			break
		case 'connecting':
			return html`<!-- -->
				<md-list-item>
					<md-circular-progress
						indeterminate
						slot="start"
					></md-circular-progress>
					Please wait
				</md-list-item>
				<!-- -->`
		case 'connection_error':
			return html`<!-- -->
				<md-list-item error>
					<md-icon slot="start">error</md-icon>
					Couldn't connect
					<md-filled-tonal-button
						form=""
						slot="end"
						@click="${() => kokoro.connect()}"
						>Try again</md-filled-tonal-button
					>
				</md-list-item>
				<!-- -->`
		case 'connected':
			// console.log(store[`kokoro${lang}VoiceId`])
			return html`<!-- -->
				${SELECT(
					'Voice',
					store,
					`kokoro${lang}VoiceId`,
					availableVoices[lang],
					{
						disabled: store[`kokoro${lang}Random`],
					},
				)}
				${SWITCH('Random voice', store, `kokoro${lang}Random`)}
				<!-- ${store.F.SLIDER('Voice speed', 'voicevoxVoiceSpeed', {min: 0.1, max: 1.9, step: 0.1})} -->
				<md-list-item ?hidden="${true || !store[`kokoro${lang}LastVoiceUsed`]}">
					<md-icon slot="start">history</md-icon>
					<div slot="headline">
						Last voice used: ${store[`kokoro${lang}LastVoiceUsed`]}
					</div>
				</md-list-item>
				<!-- -->`
	}
}
