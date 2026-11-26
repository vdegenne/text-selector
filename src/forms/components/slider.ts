import { type MdSlider } from '@material/web/all.js'
import { Debouncer } from '@vdegenne/debouncer'
import { html, type TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

export interface SliderOptions extends SharedOptions<MdSlider> {
	min: number
	max: number
	step: number
	/*
	 * @default false
	 */
	range: boolean
	/**
	 * @default 'input'
	 */
	eventType: 'input' | 'change'
	/**
	 * For 'input' type event, you can set a debouncer timeout,
	 * to avoid changing the value too much.
	 *
	 * @default 0
	 */
	timeoutMs: number

	/**
	 * @default true
	 */
	ticks: boolean

	/**
	 * @default true
	 */
	labeled: boolean

	/**
	 * Should persist the label or not.
	 *
	 * @default false
	 */
	persistLabel: boolean
}

export function SLIDER<T>(
	label: string | TemplateResult,
	host: T,
	key: keyof T,
	options?: Partial<SliderOptions>,
) {
	const _options: SliderOptions = {
		...DEFAULT_SHARED_OPTIONS,
		min: 0,
		max: 10,
		step: 1,
		range: false,
		eventType: 'input',
		timeoutMs: 0,
		ticks: true,
		persistLabel: false,
		labeled: true,
		...options,
	}

	const sliderRef = createRef<MdSlider>()
	function assignValues() {
		const slider = sliderRef.value!
		if (slider.range) {
			;(host[key] as [number, number]) = [slider.valueStart, slider.valueEnd]
		} else {
			;(host[key] as number) = slider.value
		}
	}
	const assignValuesDebouncer = new Debouncer(
		assignValues,
		_options.timeoutMs,
		{ throwOnCancel: false },
	)
	function eventCallBack(event: Event) {
		if (event.type === _options.eventType) {
			if (event.type === 'input') {
				assignValuesDebouncer.debounce()
			} else {
				assignValues()
			}
		}
	}

	return html`
		<div class="flex items-center gap-3 flex-1">
			${label ? html`<span>${label}</span>` : null}
			<md-slider
				?disabled=${_options.disabled}
				${ref(sliderRef)}
				?persist-label=${_options.persistLabel}
				class="flex-1"
				?ticks=${_options.ticks}
				?labeled=${_options.labeled}
				min=${_options.min}
				max=${_options.max}
				?range=${_options.range}
				value-start=${ifDefined(_options.range ? host[key][0] : undefined)}
				value-end=${ifDefined(_options.range ? host[key][1] : undefined)}
				value=${ifDefined(!_options.range ? host[key] : undefined)}
				step=${_options.step}
				@input=${eventCallBack}
				@change=${eventCallBack}
				style=${ifDefined(
					_options.style ? styleMap(_options.style) : undefined,
				)}
			>
			</md-slider>
		</div>
	`
}
