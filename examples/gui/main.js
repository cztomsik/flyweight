import fly from '../../src'
import '../../src/incubator/gui'

const view = fly(
  `
    <Window width=300 height=200>
      <Container style={ctStyle}>
        <Label title="Hello" />

        <Container style={rowStyle}>
          <Button title="Hello" style={btnStyle} />
          <Button title="Hello" style={btnStyle} />
        </Container>
      </Container>
    </Window>
  `,
  {
    ctStyle: { padding: 10 },
    rowStyle: { flexDirection: 'row', justifyContent: 'space-between' },
    btnStyle: { width: 100 }
  }
)

console.log('stopped?')
console.log(view.constructor.toString())
