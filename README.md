# flyweight
Light templates for dom, gui, whatever you need

<!--

  TODO: fiddles
  TODO: screenshots + links + links to source

-->


## Example

    import fly from 'flyweight'
    import 'flyweight/incubator/dom'

    const data = {
      count: 0,
      inc: () => data.count++
    }

    const view = fly(`
      <div class="container-fluid mt-4">
        Count: <span innerText={count} />
        <button onclick={inc}>++</button>
      </div>
    `, data)

    document.querySelector('#root').replaceWith(view.result)
    window.onclick = () => view.update()
