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

	.letter[highlight1] {
		background-color: var(--md-sys-color-primary-container);
		background-color: #caca00;
		color: var(--md-sys-color-on-primary-container);
		color: #ff0000;
	}
`)
export class PageMain extends PageElement {
	render() {
		return html`<!---->
			<div class="p-4 text-2xl">
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
