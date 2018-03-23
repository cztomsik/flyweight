import { definitions, runtime } from './lib'
import compile from './compile.js'

export default function fly(tpl, data) {
  const View = compile(tpl)

  return new View(data)
}

export function component(Comp, meta) {
  // decorator
  if ( ! meta) {
    return (Comp) => component(Comp, arguments[0])
  }

  const name = meta.name || Comp.name

  if ( ! name) {
    throw new Error('no name')
  }

  const def = definitions.get(name)

  if (def) {
    throw new Error('already defined')
  }

  meta = Object.assign({
    // call with new?
    construct: isES6Class(Comp),

    // what props to pass
    args: [],

    // which property use as a result
    result: '',

    // how to set properties ("property" | "setter")
    setProperty: "property",

    override: {},

    // method name to call
    update: '',

    // method name to call
    destroy: '',

    setProp: () => '',

    // internal
    Comp,
  }, meta)

  for (const k in meta.override) {
    runtime[`${name}_${k}`] = meta.override[k]
  }

  definitions.set(name, meta)
}

function isES6Class(fn) {
  // arrows dont have prototype
  const proto = fn.prototype
  const protoDesc = Object.getOwnPropertyDescriptor(fn, 'prototype')

  return proto && ! (protoDesc && protoDesc.writable)
}
