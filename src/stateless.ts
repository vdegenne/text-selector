import {ReactiveController as Snar, state} from '@snar/lit'
import {TemplateResult} from 'lit'

export interface RemoteInfo {
	collections?: string
	hiragana?: string
}

class StatelessController extends Snar {
	@state() loading = false
	@state() audioPlaying = false
	@state() autorunWasBlocked = false
	// /**
	//  * @deprecated Use mainPage.special instead
	//  */
	// @state() special = false
	@state() feedback: string | TemplateResult = ''

	remoteInfoMap: {[query: string]: RemoteInfo} = {}

	@state() cleanLetters: string[] = []
	@state() finalLetters: string[] = []
}

export const stateless = new StatelessController()

// @ts-ignore
window.stateless = stateless
