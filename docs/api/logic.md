---
id: logic
title: Logic
sidebar_label: Logic
---

Once you have initialised a logic with `const logic = kea({})`, there are a few things you can do with it:

## logic()

By calling just `logic(something)`, we call any of the following methods:

```javascript
const logic = kea({})

logic()          --> logic.build()
logic(props)     --> logic.build(props)
logic(Component) --> logic.wrap(Component)
```

## logic.wrap(Component)

Wrap the logic around a React Component (functional or Class) and give it access to all actions and values.

You can also use the shorthand `logic(Component)`, demonstrated below:

```javascript
const logic = kea({
  actions: () => ({
    doSomething: true,
    doSomethingElse: true,
  }),
  reduceres: () => ({
    firstOne: ['defaultValue'],
    secondOne: ['defaultValue']
  })
})

// with function components

function MyComponent ({ firstOne, secondOne, actions: { doSomething, doSomethingElse } }) {
  // ...
}

const ConnectedComponent = logic(MyComponent)


// with class components

class MyClassComponent extends Component {
  render () {
    const { firstOne, secondOne } = this.props

    // NB! this.actions is a shorthand for this.props.actions
    const { doSomething, doSomethingElse } = this.actions

    return <div />
  }
}

const ConnectedClassComponent = logic(MyClassComponent)
```

## logic.build(props)

Build the logic, but don't yet connect it to Redux

You may also use the shorthand `logic(props)`.

Builds are cached on the context, so calling it a on every render is very fast, assuming the key doesn't change.

```javascript
// create a logic
const logic = kea({
  key: props => props.id,

  constants: () => ['SOMETHING'],

  actions: () => ({
    doSomething: true,
  }),

  reducers: () => ({
    myValue: ['yes']
  })
})

// get a built copy
const builtLogic = logic.build({ id: 10 })

// you may now access all the properties
// ... keeping in mind it's not yet mounted

// action creator (returns object { type: 'do something', payload: {} })
builtLogic.actionCreators.doSomething()

// bound actions. dispatches the created action automatically
// probably not useful if the logic is not mounted
builtLogic.actions.doSomething()

// get the contants
buildLogic.constants == { SOMETHING: 'SOMETHING' }

// a disconnected selector, will probably throw when called
buildLogic.selectors.myValue(state)

// this will throw since the logic is not mounted
buildLogic.values.myValue
```

:::note
`logic.build` accepts a second parameter: `.build(props, autoConnectInListener)`

To read more on the `autoConnectInListener` parameter, check out
["Calling `mount()` inside listeners with `autoConnect: true`"](/docs/guide/standalone#calling-mount-inside-listeners-with-autoconnect-true)
under the "Usage without React" page.
:::

## logic.mount()

Mount the logic on Redux, return a function that unmounts

Shorthand for `logic.build().mount()`

```javascript
const logic = kea({})

// When you call logic.mount(), we actually send it through .build():
logic.mount() == logic.build().mount()

// With logic with keys, this is true:
logic(props).mount() == logic.build(props).mount()

// In any case, logic.mount() connects this logic to Redux
// and also mounts all other connected logic.
// It returns a function, which when called will unmount the logic from the store:
const unmount = logic.mount()

logic.actions.doSomething()
console.log(logic.values.myValue)

unmount()

// Alternatively, pass a callback to execute its contents and unmount automatically
logic.mount(builtLogic => {
  builtLogic.actions.doSomething()
  console.log(builtLogic.values.myValue)
})

// The callback can also be async
logic.mount(async builtLogic => {
  const response = await window.fetch('/api/give-me-all-your-data')
  builtLogic.actions.doSomething(await response.json())
  console.log(builtLogic.values.myValue)
})
```

## logic.extend(input)

Add more features to the logic

```javascript
// create a logic
const logic = kea({
  actions: () => ({
    doSomething: true,
  }),

  reducers: () => ({
    myValue: ['yes']
  })
})

logic.extend({
  actions: () => ({
    doSomethingElse: true,
  }),

  reducers: () => ({
    anotherValue: ['no']
  })
})

// Now you can use both:
Object.keys(logic.build().actions) == ['doSomething', 'doSomethingElse']
Object.keys(logic.build().selectors) == ['myValue', 'anotherValue']
```