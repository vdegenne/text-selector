import { withController } from '@snar/lit'
import { html } from 'lit'
import { withStyles } from 'lit-with-styles'
import { customElement, query } from 'lit/decorators.js'
import { MaterialShellChild } from 'material-shell/MaterialShellChild'
import { PageMain } from '../pages/page-main.js'
import { store } from '../store.js'
import styles from './app-shell.css?inline'

declare global {
	interface Window {
		app: AppShell
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends MaterialShellChild {
	@query('page-main') mainPage!: PageMain

	render() {
		return html`<!-- -->
			<page-main ?active=${store.page === 'main'}></page-main>
			<!-- -->`
	}

	// @confirm({headline: 'Logout', content: 'Are you sure you want to logout?'})
	// private _logout() {
	// 	authManager.logout()
	// }
}

export const app = (window.app = new AppShell())
