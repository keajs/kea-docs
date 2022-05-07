## Props

When you build a `logic`, you can pass it an object that will be stored as `props`:

```javascript
const props = { id: 10 }
const logic = kea([])

logic(props).props === props
logic.build(props).props === props
```

Calling [`logic(props)`](/docs/meta/logic#logic-1) or [`logic.build(props)`](/docs/meta/logic#logicbuildprops) is a fast operation.

In case the logic is already mounted, its `props` will be updated to the new passed props.

## Props are merged

When you build logic with multiple props, they get merged.

```ts
// logic keyed on id
type LogicProps = {
  id: number
  username?: string
  defaultRecord?: string
}

const logic = kea([
  props({} as LogicProps),
  key((props) => props.id),
  actions({ doSomething: true }),
])

// mount once with one set of props
logic({ id: 1, username: 'keajs', defaultRecord: 'something' }).mount()

// call with another set of props
logic({ id: 1, defaultRecord: 'new' }).actions.doSomething()

// props are always merged, never overridden
logic({ id: 1 }).props === { id: 1, username: 'keajs', defaultRecord: 'new' }
```

## Pass data from React

You can pass random data from React onto the logic via `props`. For example various defaults:

```jsx
function FancyPantsCounter() {
  const builtLogic = counterLogic({
    defaultCounter: 1000,
    onChange: (c) => console.log(c),
  })
  const { counter } = useValues(builtLogic)

  // ...
}

const counterLogic = kea([
  actions({
    increment: (amount) => ({ amount }),
    decrement: (amount) => ({ amount }),
  }),
  reducers(({ props }) => ({
    counter: [
      props.defaultCounter || 0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  })),
  listeners(({ props, values }) => ({
    increment: ({ amount }) => {
      console.log(`incrementing by ${amount}`)
      console.log(`default ${props.defaultCounter || 0}`)
      props.onChange?.(values.counter)
    },
  })),
])
```

## Typed Props

When using [kea-typegen](/docs/intro/typescript), you may pass a type to the `props` builder:

```ts
import { kea, props } from 'kea'
import { logicType } from './logicType'

interface LogicProps {
  id: number
}

const logic = kea<logicType<LogicProps>>([
  // specify the type here
  props({} as LogicProps),
])
```
