import gui from 'gui'
import { component } from '../..'

function Window(width = 800, height = 600, children = []) {
  const w = gui.Window.create({})

  if (children.length !== 1) {
    throw new Error('expected one child')
  }

  w.setContentSize({ width, height })
  w.setContentView(children[0])

  w.center()
  w.activate()

  gui.MessageLoop.run();

  return w
}
component(Window, {
  args: ['width', 'height', 'children'],
  setProperty: 'setter'
})

component(gui.Container.create, {
  name: 'Container',
  setProperty: 'setter',
  override: {
    children: setChildren
  }
})

component(gui.Label.create, {
  name: 'Label',
  args: ['title'],
  setProperty: 'setter'
})

component(gui.Button.create, {
  name: 'Button',
  args: ['title'],
  setProperty: 'setter'
})


function setChildren(ct, children) {
  for (const c of children) {
    ct.addChildView(c)
  }
}





/*

  - Button.create({ type, title })
  - Group.create(title)


  - Image.createFromPath(path)
  - Window.create({ frame, transparent, showTrafficLights })

  - Container.create()
  - Scroll.create()
  - ProgressBar.create()
  - TextEdit.create()
  - Entry.create()
  - FileOpenDialog.create()
  - FileSaveDialog.create()

  hasContentView
    - Window
    - Group




*/
