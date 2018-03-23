import { definitions, runtime } from './lib'
import parse from './parse'

export default function compile(str) {
  return compileTemplate(parse(str))
}

function compileTemplate({ root }) {
  let compNum = 1
  let valNum = 1
  const components = []

  // walk the ast and prepare whatever is needed in template
  walk(root)

  return new Function(['runtime'], `
    return class View {
      constructor(data) {
        console.log('cons')

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
  `)(runtime)

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
        const def = definitions.get(c.name)

        if ( ! def) {
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

        if ( ! runtime[c.name]) {
          if (def.template) {
            // TODO: refactor
            def.result = 'result'
            def.update = 'update'
            def.destroy = 'destroy'

            const ViewModel = def.Comp
            const View = compile(def.template)

            function factory() {
              return new View(new ViewModel())
            }

            runtime[c.name] = factory
          } else {
            runtime[c.name] = def.Comp
          }
        }

        c.args = def.args.map(k => c.props[k].result)
        c.instance = `${def.construct ?'new' :''} runtime.${c.name}(${c.args})`
        c.propsToInit = c.props.filter(p => ! def.args.includes(p.name))

        c.destroy = def.destroy ?`${c.var}.${def.destroy}()` :''

        c.update = def.update ?`${c.var}.${def.update}()` :''

        c.setProp = (k, v) => {
          if (def.override[k]) {
            return `runtime.${c.name}_${k}(${c.var}, ${v})`
          }

          return (def.setProp === 'setter') ?`${c.var}.${setter(k)}(${v})` :`${c.var}.${k} = ${v}`
        }

        // result has to be stable
        c.result = [c.var, def.result].filter(Boolean).join('.')

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

function setter(propName) {
  return `set${propName[0].toUpperCase() + propName.slice(1)}`
}
