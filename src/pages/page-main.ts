import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import {store} from '../store.js'
import {PageElement} from './PageElement.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

@customElement('page-main')
@withController(store)
@withStyles(css`
	:host {
	}
`)
export class PageMain extends PageElement {
	render() {
		return html`<!---->
			<div class="p-4">
				${store.input.split('\n').map((line) => {
					return html`<!-- -->
						<div>
							${line.split('').map((letter) => {
								return html`<!-- --><span class="letter">${letter}</span
									><!-- -->`
							})}
						</div>
						<!-- -->`
				})}
			</div>
			<!----> `
	}
}

// export const pageMain = new PageMain();
