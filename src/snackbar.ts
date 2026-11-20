import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/snackbar/md-gb-snackbar-host.js'
import type {
	ShowSnackbarOptions,
	SnackbarHostElement,
} from '@mahmoodkhalil/material-web-3-demo/labs/gb/components/snackbar/snackbar-host-element.js'

let snackbarHost: SnackbarHostElement | null = null

function getSnackbarHost() {
	if (!snackbarHost) {
		snackbarHost = document.createElement(
			'md-gb-snackbar-host',
		) as SnackbarHostElement

		snackbarHost.fixed = true
		document.body.append(snackbarHost)
	}

	return snackbarHost
}

export function toast(options: string | ShowSnackbarOptions) {
	return getSnackbarHost().showSnackbar(options)
}
