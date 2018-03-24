export default parse

// TODO: rewrite once the syntax gets more stable
function parse(input) {
  let lastIndex = 0

  const tpl = template()
  skipSpace()

  if (lastIndex !== input.length) {
    raise('Unexpected content')
  }

  return tpl



  /////// Top-down

  function template() {
    const b = body()

    if (b.length !== 1) {
      raise(`Expected one root node, got ${b.length}`)
    }

    return { root: b[0] }
  }

  function body() {
    return many(anyOf(component, text))
  }

  function component() {
    const t = componentTag()

    if ( ! t) {
      return null
    }

    const props = t.props

    if (t.hasChildren) {
      props.push({ name: 'children', value: body() })
    }

    if (t.hasTemplate) {
      props.push({ name: 'template', value: template() })
    }

    if (t.hasChildren || t.hasTemplate) {
      expect(closingTag)
    }

    return { type: 'component', name: t.name, props }


    function closingTag() {
      return regex(new RegExp(`<\\/${t.name}>`, 'y'))
    }
  }

  function componentTag() {
    const [, name] = regex(/<(\w+)/y) || []

    if ( ! name) {
      return null
    }

    const props = many(prop)

    const [closed, gt, selfClose, templateVarName] = regex(/(>)|(\/>)|template(\w+)\/>/y) || []

    if ( ! closed) {
      raise('Unclosed tag')
    }

    return { name, props, hasChildren: ! selfClose }
  }

  function prop() {
    const [, name, assign] = regex(/(\w+)(=?)/y) || []

    if ( ! name) {
      return null
    }

    return { name, value: assign ?expect(propValue) :{ type: 'boolean', value: true } }
  }

  function propValue() {
    return anyOf(number, quotedString, binding)()
  }

  function number() {
    const [, value] = regex(/(\d+)/y) || []

    if ( ! value){
      return null
    }

    return { type: 'number', value: +value }
  }

  function quotedString() {
    const [, value] = regex(/"(.*?)"/y) || []

    if ( ! value) {
      return null
    }

    return { type: 'string', value: value }
  }

  function binding() {
    const [, curlyLeft] = regex(/(\{)/y) || []

    if ( ! curlyLeft) {
      return null
    }

    const expr = expect(expression)

    if ( ! regex(/(\})/y)) {
      raise('Unclosed binding')
    }

    return { type: 'binding', expression: expr }
  }

  function expression() {
    const [, varName] = regex(/(\w+)/y) || []

    if ( ! varName) {
      return null
    }

    return { varName }
  }

  function text() {
    const [, value] = regex(/([^<]+)/y) || []

    if ( ! value) {
      return null
    }

    return { type: 'string', value: value }
  }


  /////// Utils

  function many(parser) {
    const arr = []

    while (true) {
      const res = parser()

      if ( ! res) {
        return arr
      }

      arr.push(res)
    }
  }

  function anyOf(...parsers) {
    return () => {
      const start = lastIndex

      for (const p of parsers) {
        lastIndex = start
        const res = p()

        if (res) {
          return res
        }
      }

      return null
    }
  }

  function expect(parser) {
    const res = parser()

    if ( ! res) {
      raise(`Expected ${parser.name}`)
    }

    return res
  }

  function regex(r) {
    skipSpace()

    r.lastIndex = lastIndex

    const match = r.exec(input)

    if ( ! match) {
      return null
    }

    lastIndex = r.lastIndex

    return match
  }

  function skipSpace() {
    while (true) {
      switch (input[lastIndex]) {
        case ' ': case '\n': case '\r': case '\t':
          lastIndex++
          continue
        default:
          return
      }
    }
  }

  function raise(msg) {
    console.error(input.slice(lastIndex, 100))
    throw new Error(`${msg}`)
  }
}
