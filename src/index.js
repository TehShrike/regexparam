export default function(str) {
	const keys = [], chunks = str.split(`/`)
	chunks[0] || chunks.shift()

	const pattern = chunks.map(chunk => {
		const firstCharacter = chunk[0]

		if (firstCharacter === `*`) {
			keys.push(`wild`)
			return `/(.*)`
		} else if (firstCharacter === `:`) {
			const optional = chunk[chunk.length - 1] === `?`
			keys.push(chunk.substring(1, optional ? chunk.length - 1 : chunk.length))
			return optional
				? `(?:/([^/]+?))?`
				: `/([^/]+?)`
		} else {
			return `/` + chunk
		}
	}).join(``)

	return {
		keys,
		pattern: new RegExp(`^` + pattern + (keys.length ? `(?:/)?` : ``) + `/?$`, `i`),
	}
}
