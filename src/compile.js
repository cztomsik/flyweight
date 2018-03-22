export default function compile(lib, { root }) {
  let compNum = 1
  let valNum = 1
  const components = []

  // walk the ast and prepare whatever is needed in template
  walk(root)

  return `
    class View {
      constructor(data) {
        this.data = data

        ${each(components, c => `
          ${c.var} = ${c.instance}
          ${each(c.propsToInit, p => `
            ${c.setProp(p.name, p.result)}
          `)}

        `)}

        this.result = ${root.result}
      }

      update() {
        ${each(components, c => `
          ${each(c.boundProps, p => `
            if (${p.holder} !== (${p.holder} = ${p.value.result})) {
              ${c.setProp(p.name, p.holder)}
            }
          `)}
          ${c.update}

        `)}
      }

      destroy() {
        ${each(components.slice().reverse(), c => `
          ${c.destroy}
        `)}
      }
    }
  `

  function walk(node) {
    // TODO: type children?
    if (node instanceof Array) {
      const children = node
      children.forEach(walk)
      children.result = `[
              ${each(children, c => `
                ${c.result},
              `)}
            ]`

      return
    }

    switch (node.type) {
      case 'number':
      case 'string':
        node.result = JSON.stringify(node.value)
        break

      case 'component':
        const c = node
        const gen = lib[c.name]

        if ( ! gen) {
          throw new Error(`Unknown component ${c.name}`)
        }

        c.var = `this.c${compNum++}`
        c.boundProps = []

        for (const p of c.props) {
          if (p.value.type === 'binding') {
            p.value.result = `this.data.${p.value.expression.varName}`
            p.holder = `this.v${valNum++}`
            p.result = `${p.holder} = ${p.value.result}`
            c.boundProps.push(p)
            continue
          }

          walk(p.value)
          p.result = p.value.result
        }

        c.instance = gen.instance()
        c.propsToInit = c.props
        c.destroy = gen.destroy(c.var)
        c.update = gen.update(c.var)
        c.setProp = (propName, value) => gen.setProp(c.var, propName, value)
        c.result = gen.result(c.var)

        components.push(c)

        break

      default:
        throw new Error(`unknown node ${node}`)
    }
  }
}

function each(arr, cb) {
  // map, extract content, join, unindent, trimLeft whole
  return arr.map(cb).map(str => str.replace(/^\n(.*?)\n  *?$/s, '$1')).join('\n').replace(/^  /gm, '').replace(/^\s*/, '')
}
