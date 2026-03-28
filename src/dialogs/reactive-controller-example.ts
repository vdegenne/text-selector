// @ts-nocheck

import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {html} from 'lit'
import {Comment, commentsManager} from '../comments/index.js'
import {Dialog} from './dialogs.js'
import {removeObjectKeys} from '../utils.js'

export function writeComment(comment?: Comment) {
	return new Promise((resolve, _reject) => {
		let type: 'Create' | 'Edit'
		let objectId: string | undefined
		if (comment) {
			type = 'Edit'
			objectId = comment.id
			comment = new Comment(
				undefined,
				removeObjectKeys(comment.toJSON(), ['id'])
			)
		} else {
			type = 'Create'
			comment = new Comment()
		}

		const ctrl = comment
		const F = new FormBuilder(ctrl)

		async function submit() {
			if (ctrl.content) {
				resolve(ctrl.content)
				ctrl.timestamp = Date.now()
				if (type === 'Create') {
					await commentsManager.addObject(ctrl)
				} else if (type === 'Edit' && objectId) {
					await commentsManager.updateObject(objectId, ctrl)
				}
				dialog.close()
			}
		}

		const dialog = new Dialog(
			'Comment',
			() =>
				html`<!-- -->
					<div class="flex flex-col">
						${F.TEXTAREA('content', 'content', {
							autofocus: true,
							rows: 10,
						})}
					</div>
					<!-- -->`,
			{
				ctrl,
				actions: () =>
					html`<!-- -->
						<md-filled-tonal-button
							?disabled="${!ctrl.content}"
							@click="${submit}"
							>Create</md-filled-tonal-button
						>
						<!-- -->`,
			}
		)
	})
}
