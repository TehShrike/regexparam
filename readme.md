# @tehshrike/regexparam

[regexparam](https://github.com/lukeed/regexparam) with longer variable names and support for custom regex patterns.

> A tiny (332B) utility that converts route patterns into RegExp. Limited alternative to [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) 🙇

With `@tehshrike/regexparam`, you may turn a pathing string (eg, `/users/:id`) into a regular expression.

An object with shape of `{ keys, pattern }` is returned, where `pattern` is the `RegExp` and `keys` is an array of your parameter name(s) in the order that they appeared.

Unlike [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp), this module does not create a `keys` dictionary, nor mutate an existing variable. Also, this only ships a parser, which only accept strings. Similarly, and most importantly, `@tehshrike/regexparam` **only** handles basic pathing operators:

* Static (`/foo`, `/foo/bar`)
* Parameter (`/:title`, `/books/:title`, `/books/:genre/:title`)
* Optional Parameters (`/:title?`, `/books/:title?`, `/books/:genre/:title?`)
* Wildcards (`*`, `/books/*`, `/books/:genre/*`)
* Regex Parameters (`/user/:userId(\\d+)`)

Lastly, please note that while this route-parser is not slow, you should use [`matchit`](https://github.com/lukeed/matchit#benchmarks) or [`trouter`](https://github.com/lukeed/trouter) if performance is of critical importance. This is especially true for backend/server scenarios!

This module exposes two module definitions:

* **ES Module**: `dist/regexparam.mjs`
* **CommonJS**: `dist/regexparam.js`

## Install

```
$ npm install --save @tehshrike/regexparam
```


## Usage

```
const regexparam = require('@tehshrike/regexparam');
```

<!--js
const regexparam = require('./dist/regexparam.js')
-->

```js

let foo = regexparam('users/*')
foo.keys // => ['wild']
foo.pattern // => /^\/users\/(.*)(?:\/)?\/?$/i

let bar = regexparam('/books/:genre/:title?')
bar.keys // => ['genre', 'title']
bar.pattern // => /^\/books\/([^\/]+?)(?:\/([^\/]+?))?(?:\/)?\/?$/i

bar.pattern.test('/books/horror') //=> true
bar.pattern.test('/books/horror/goosebumps') //=> true

// Example param-assignment
function exec(path, { keys, pattern }) {
	const matches = pattern.exec(path)
	const out = {}
	keys.forEach((key, i) => {
		out[key] = matches[i + 1] || null
	})

	return out
}

exec('/books/horror', bar) //=> { genre:'horror', title:null }

exec('/books/horror/goosebumps', bar) //=> { genre:'horror', title:'goosebumps' }
```

> **Important:** When matching/testing against a generated RegExp, your path **must** begin with a leading slash (`"/"`)!

## API

### regexparam(str)

Returns: `Object`

#### str

Type: `String`

The route/pathing string to convert.

> **Note:** It does not matter if your `str` begins with a `/` &mdash; it will be added if missing.

## License

MIT © [Luke Edwards](https://lukeed.com)
