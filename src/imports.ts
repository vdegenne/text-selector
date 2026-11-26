export async function getThemeStore() {
	const { themeStore } = await import('./styles/themeStore.js')
	return themeStore
}

export async function openSettingsDialog() {
	const { settingsDialog } = await import('./settings/settings-dialog.js')
	settingsDialog.show()
}
