import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import {SELECT, SWITCH} from '@vdegenne/forms/FormBuilder.js'
import {availableVoices, KokoroClient, Language} from '@vdegenne/kokoro'
import {VoicevoxClient} from '@vdegenne/voicevox'
import {html} from 'lit'
import {voicevox} from './voicevox.js'

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

export const voicevoxSettings = (kokoro: VoicevoxClient, store: any) => {
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
					VOICEVOX server unreachable
					<md-filled-tonal-button
						form=""
						slot="end"
						@click="${() => voicevox.connect()}"
						>Try again</md-filled-tonal-button
					>
				</md-list-item>
				<!-- -->`
		case 'connected':
			const voices = voicevox.getVoiceTitles()
			console.log(voices)
			return html`<!-- -->
				${SELECT('Voice', store, 'voicevoxVoiceId', voices, {
					disabled: store['voicevoxRandom'],
					type: 'number',
				})}
				${SWITCH('Random voice', store, 'voicevoxRandom')}
				<!-- ${store.F.SLIDER('Voice speed', 'voicevoxVoiceSpeed', {min: 0.1, max: 1.9, step: 0.1})} -->
				<!-- -->`
	}
}
