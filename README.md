# flyweight
Light templates for dom, gui, whatever you need

<!--

  TODO: fiddles

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

    document.body.appendChild(view.result)
    window.onclick = () => view.update()


### DOM
![image](https://pbs.twimg.com/media/DZEu7u3WAAEzr5N.jpg:large)
[Source](examples/dom)

    npm run dom

### GUI
![image](https://pbs.twimg.com/media/DY_rCCUX4AAqNCY.jpg:large)
[Source](examples/gui)

    npm run gui
