import { type TemplateResult } from 'lit'
import { type StyleInfo } from 'lit/directives/style-map.js'
import { CHIPSELECT, type ChipSelectOptions } from './components/chip-select.js'
import { FILTER, type FilterOptions } from './components/filter.js'
import { SELECT, type SelectOptions } from './components/select.js'
import { SLIDER, type SliderOptions } from './components/slider.js'
import {
	CHECKBOX,
	type CheckboxOptions,
	SWITCH,
	type SwitchOptions,
} from './components/switch.js'
import {
	TEXTAREA,
	TEXTFIELD,
	type TextFieldOptions,
} from './components/text-field.js'
import {
	TOGGLEBUTTON,
	type ToggleButtonOptions,
} from './components/toggle-button.js'

export interface SharedOptions<T extends HTMLElement = HTMLElement> {
	/** @default false */
	autofocus: boolean
	/** @default undefined */
	init: ((element: T) => void) | undefined
	/** @default false */
	disabled: boolean
	/**
	 * @default undefined
	 * @deprecated Use "style" instead.
	 */
	styles: string | undefined
	/** @default undefined */
	style: Readonly<StyleInfo> | undefined
	/** @default false */
	required: boolean
}

export const DEFAULT_SHARED_OPTIONS: SharedOptions = {
	autofocus: false,
	disabled: false,
	init: undefined,
	required: false,
	style: undefined,
	styles: undefined,
}

type InputOptions = {
	availableValues: string[]
}

export class FormBuilder<T> {
	constructor(protected host: T) {}

	TEXTFIELD(label: string, key: keyof T, options?: Partial<TextFieldOptions>) {
		return TEXTFIELD(label, this.host, key, options)
	}

	TEXTAREA(label: string, key: keyof T, options?: Partial<TextFieldOptions>) {
		return TEXTAREA(label, this.host, key, options)
	}

	TOGGLEBUTTON(key: keyof T, options?: Partial<ToggleButtonOptions>) {
		return TOGGLEBUTTON(this.host, key, options)
	}

	SWITCH(
		headline: string | TemplateResult,
		key: keyof T,
		options?: Partial<SwitchOptions>,
	) {
		return SWITCH(headline, this.host, key, options)
	}

	CHECKBOX(
		headline: string | TemplateResult,
		key: keyof T,
		options?: Partial<CheckboxOptions>,
	) {
		return CHECKBOX(headline, this.host, key, options)
	}

	SLIDER(
		label: string | TemplateResult,
		key: keyof T,
		options?: Partial<SliderOptions>,
	) {
		return SLIDER(label, this.host, key, options)
	}

	SELECT(
		label: string,
		key: keyof T,
		choices: readonly string[],
		options?: Partial<SelectOptions>,
	) {
		return SELECT(label, this.host, key, choices, options)
	}

	CHIPSELECT(
		label: string,
		key: keyof T,
		choices: readonly string[],
		options?: Partial<ChipSelectOptions>,
	) {
		return CHIPSELECT(label, this.host, key, choices, options)
	}

	FILTER(
		label: string,
		key: keyof T,
		choices: string[],
		options?: Partial<FilterOptions>,
	) {
		return FILTER(label, this.host, key, choices, options)
	}
}
