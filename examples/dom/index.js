import fly, { component } from 'flyweight'
import 'flyweight/incubator/dom'

@component({
  template: `
    <div>
      <div class="navbar bg-light">
        <span class="navbar-brand">Example</span>
      </div>

      <div class="container-fluid pt-4">
        <Counter />
      </div>
    </div>
  `
})
class App {}

@component({
  template: `
    <div>
      Count:
      <span innerText={count} />
      <button class="ml-3 btn btn-outline-dark" onclick={inc}>Click me</button>
    </div>
  `
})
class Counter {
  count = 0

  inc = () => this.count++
}

const view = fly(`
  <App />
`)

console.log(view)

window.onload = () => document.body.appendChild(view.result)
window.onclick = () => view.update()
