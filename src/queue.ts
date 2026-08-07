export class Queue {
	private promise: Promise<void> = Promise.resolve()

	add<T>(fn: () => T | Promise<T>): Promise<T> {
		const result = this.promise.then(() => fn())

		this.promise = result.then(
			() => undefined,
			() => undefined,
		)

		return result
	}
}
