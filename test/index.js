const test = require(`tape`)
const fn = require(`../dist/regexparam`)

test(`regexparam`, t => {
	t.is(typeof fn, `function`, `exports a function`)

	const foo = fn(`/`)
	t.is(typeof foo, `object`, `output is an object`)
	t.ok(foo.pattern, `~> has "pattern" key`)
	t.ok(foo.pattern instanceof RegExp, `~~> is a RegExp`)
	t.ok(foo.keys, `~> has "keys" key`)
	t.ok(Array.isArray(foo.keys), `~~> is an Array`)

	t.end()
})

test(`ensure lead slash`, t => {
	t.same(fn(`/`), fn(``), `~> root`)
	t.same(fn(`/books`), fn(`books`), `~> static`)
	t.same(fn(`/books/:title`), fn(`books/:title`), `~> param`)
	t.same(fn(`/books/:title?`), fn(`books/:title?`), `~> optional`)
	t.same(fn(`/books/*`), fn(`books/*`), `~> wildcard`)
	t.end()
})

test(`static`, t => {
	const { keys, pattern } = fn(`/books`)
	t.same(keys, [], `~> empty keys`)
	t.true(pattern.test(`/books`), `~> matches route`)
	t.true(pattern.test(`/books/`), `~> matches trailing slash`)
	t.false(pattern.test(`/books/author`), `~> does not match extra bits`)
	t.false(pattern.test(`books`), `~> does not match path without lead slash`)
	t.end()
})

test(`static :: multiple`, t => {
	const { keys, pattern } = fn(`/foo/bar`)
	t.same(keys, [], `~> empty keys`)
	t.true(pattern.test(`/foo/bar`), `~> matches route`)
	t.true(pattern.test(`/foo/bar/`), `~> matches trailing slash`)
	t.false(pattern.test(`/foo/bar/baz`), `~> does not match extra bits`)
	t.false(pattern.test(`foo/bar`), `~> does not match path without lead slash`)
	t.end()
})

test(`param`, t => {
	const { keys, pattern } = fn(`/books/:title`)
	t.same(keys, [ `title` ], `~> keys has "title" value`)
	t.false(pattern.test(`/books`), `~> does not match naked base`)
	t.false(pattern.test(`/books/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/books/narnia`), `~> matches definition`)
	t.true(pattern.test(`/books/narnia/`), `~> matches definition w/ trailing slash`)
	t.false(pattern.test(`/books/narnia/hello`), `~> does not match extra bits`)
	t.false(pattern.test(`books/narnia`), `~> does not match path without lead slash`)
	const [ , value ] = pattern.exec(`/books/narnia`)
	t.is(value, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: static :: none`, t => {
	const { keys, pattern } = fn(`/:title`)
	t.same(keys, [ `title` ], `~> keys has "title" value`)
	t.false(pattern.test(`/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/narnia`), `~> matches definition`)
	t.true(pattern.test(`/narnia/`), `~> matches definition w/ trailing slash`)
	t.false(pattern.test(`/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`narnia`), `~> does not match path without lead slash`)
	const [ , value ] = pattern.exec(`/narnia`)
	t.is(value, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: static :: multiple`, t => {
	const { keys, pattern } = fn(`/foo/bar/:title`)
	t.same(keys, [ `title` ], `~> keys has "title" value`)
	t.false(pattern.test(`/foo/bar`), `~> does not match naked base`)
	t.false(pattern.test(`/foo/bar/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/foo/bar/narnia`), `~> matches definition`)
	t.true(pattern.test(`/foo/bar/narnia/`), `~> matches definition w/ trailing slash`)
	t.false(pattern.test(`/foo/bar/narnia/hello`), `~> does not match extra bits`)
	t.false(pattern.test(`foo/bar/narnia`), `~> does not match path without lead slash`)
	t.false(pattern.test(`/foo/narnia`), `~> does not match if statics are different`)
	t.false(pattern.test(`/bar/narnia`), `~> does not match if statics are different`)
	const [ , value ] = pattern.exec(`/foo/bar/narnia`)
	t.is(value, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: multiple`, t => {
	const { keys, pattern } = fn(`/books/:author/:title`)
	t.same(keys, [ `author`, `title` ], `~> keys has "author" & "title" values`)
	t.false(pattern.test(`/books`), `~> does not match naked base`)
	t.false(pattern.test(`/books/`), `~> does not match naked base w/ trailing slash`)
	t.false(pattern.test(`/books/smith`), `~> does not match insufficient parameter counts`)
	t.false(pattern.test(`/books/smith/`), `~> does not match insufficient paramters w/ trailing slash`)
	t.true(pattern.test(`/books/smith/narnia`), `~> matches definition`)
	t.true(pattern.test(`/books/smith/narnia/`), `~> matches definition w/ trailing slash`)
	t.false(pattern.test(`/books/smith/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`books/smith/narnia`), `~> does not match path without lead slash`)
	const [ , author, title ] = pattern.exec(`/books/smith/narnia`)
	t.is(author, `smith`, `~> executing pattern gives correct value`)
	t.is(title, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: optional`, t => {
	const { keys, pattern } = fn(`/books/:author/:title?`)
	t.same(keys, [ `author`, `title` ], `~> keys has "author" & "title" values`)
	t.false(pattern.test(`/books`), `~> does not match naked base`)
	t.false(pattern.test(`/books/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/books/smith`), `~> matches when optional parameter is missing counts`)
	t.true(pattern.test(`/books/smith/`), `~> matches when optional paramter is missing w/ trailing slash`)
	t.true(pattern.test(`/books/smith/narnia`), `~> matches when fully populated`)
	t.true(pattern.test(`/books/smith/narnia/`), `~> matches when fully populated w/ trailing slash`)
	t.false(pattern.test(`/books/smith/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`books/smith/narnia`), `~> does not match path without lead slash`)
	const [ , author, title ] = pattern.exec(`/books/smith/narnia`)
	t.is(author, `smith`, `~> executing pattern gives correct value`)
	t.is(title, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: optional :: static :: none`, t => {
	const { keys, pattern } = fn(`/:title?`)
	t.same(keys, [ `title` ], `~> keys has "title" value`)
	t.true(pattern.test(`/`), `~> matches root w/ trailing slash`)
	t.true(pattern.test(`/narnia`), `~> matches definition`)
	t.true(pattern.test(`/narnia/`), `~> matches definition w/ trailing slash`)
	t.false(pattern.test(`/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`narnia`), `~> does not match path without lead slash`)
	const [ , value ] = pattern.exec(`/narnia`)
	t.is(value, `narnia`, `~> executing pattern gives correct value`)
	t.end()
})

test(`param :: optional :: multiple`, t => {
	const { keys, pattern } = fn(`/books/:genre/:author?/:title?`)
	t.same(keys, [ `genre`, `author`, `title` ], `~> keys has "genre", "author" & "title" values`)
	t.false(pattern.test(`/books`), `~> does not match naked base`)
	t.false(pattern.test(`/books/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/books/horror`), `~> matches when optional parameter is missing counts`)
	t.true(pattern.test(`/books/horror/`), `~> matches when optional paramter is missing w/ trailing slash`)
	t.true(pattern.test(`/books/horror/smith`), `~> matches when optional parameter is missing counts`)
	t.true(pattern.test(`/books/horror/smith/`), `~> matches when optional paramter is missing w/ trailing slash`)
	t.true(pattern.test(`/books/horror/smith/narnia`), `~> matches when fully populated`)
	t.true(pattern.test(`/books/horror/smith/narnia/`), `~> matches when fully populated w/ trailing slash`)
	t.false(pattern.test(`/books/horror/smith/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`books/horror/smith/narnia`), `~> does not match path without lead slash`)
	const [ , genre, author, title ] = pattern.exec(`/books/horror/smith/narnia`)
	t.is(genre, `horror`, `~> executing pattern gives correct value`)
	t.is(author, `smith`, `~> executing pattern gives correct value`)
	t.is(title, `narnia`, `~> executing pattern gives correct value`)

	const [ , genre2, author2, title2 ] = pattern.exec(`/books/horror/smith`)
	t.is(genre2, `horror`, `~> executing pattern gives correct value`)
	t.is(author2, `smith`, `~> executing pattern gives correct value`)
	t.is(title2, undefined)

	t.end()
})

test(`wildcard`, t => {
	const { keys, pattern } = fn(`/books/*`)
	t.same(keys, [ `wild` ], `~> keys has "wild" value`)
	t.false(pattern.test(`/books`), `~> does not match naked base`)
	t.true(pattern.test(`/books/`), `~> does not match naked base w/ trailing slash`)
	t.true(pattern.test(`/books/narnia`), `~> matches definition`)
	t.true(pattern.test(`/books/narnia/`), `~> matches definition w/ trailing slash`)
	t.true(pattern.test(`/books/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`books/narnia`), `~> does not match path without lead slash`)
	const [ , value ] = pattern.exec(`/books/narnia/reviews`)
	t.is(value, `narnia/reviews`, `~> executing pattern gives ALL values after base`)
	t.end()
})

test(`wildcard :: root`, t => {
	const { keys, pattern } = fn(`*`)
	t.same(keys, [ `wild` ], `~> keys has "wild" value`)
	t.true(pattern.test(`/`), `~> matches root path`)
	t.true(pattern.test(`/narnia`), `~> matches definition`)
	t.true(pattern.test(`/narnia/`), `~> matches definition w/ trailing slash`)
	t.true(pattern.test(`/narnia/reviews`), `~> does not match extra bits`)
	t.false(pattern.test(`narnia`), `~> does not match path without lead slash`)
	const [ , value ] = pattern.exec(`/foo/bar/baz`)
	t.is(value, `foo/bar/baz`, `~> executing pattern gives ALL values together`)
	t.end()
})

test(`Arbitrary regex patterns in routes`, t => {
	const { keys, pattern } = fn(`wat/:id(\\d+)`)

	t.same(keys, [ `id` ])
	t.true(pattern.test(`/wat/14`))
	t.false(pattern.test(`/wat/`))

	const [ , id ] = pattern.exec(`/wat/22`)

	t.is(id, `22`)

	t.end()
})

test(`Optional arbitrary regex patterns in routes`, t => {
	const { keys, pattern } = fn(`wat/:id(\\d+)?`)

	t.same(keys, [ `id` ])
	t.true(pattern.test(`/wat/14`))
	t.true(pattern.test(`/wat/`))

	const [ , id ] = pattern.exec(`/wat/`)

	t.is(id, undefined)

	t.end()
})

test(`A regular pattern name that ends in an end-parenthese`, t => {
	const { keys, pattern } = fn(`foo/:bad-idea)`)

	t.same(keys, [ `bad-idea)` ])

	const [ , badIdea ] = pattern.exec(`/foo/anything`)

	t.is(badIdea, `anything`)

	t.end()
})
