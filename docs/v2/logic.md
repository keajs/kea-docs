---
id: logic
title: Logic
sidebar_label: Logic
---

Once you have initialised a logic with `const logic = kea({})`, there are a few things you can do with it:

## Properties

There are several properties you may access on a logic.

```javascript
const logic = kea({
  // each function gets `logic` as its argument
  listeners: (logic) => ({
    // logic.actions.doSomething()
    // logic.values.myValue
    // ...
  }),

  // it's common to destructure the logic directly:
  listeners: ({ actions, values }) => ({
    // actions.doSomething()
    // values.myValue
    // ...
  }),
})

// logic.mount() // and then:
// logic.actions.doSomething()
// logic.values.myValue
```

### logic.actionCreators

An array of functions that create a [Redux action](https://redux.js.org/basics/actions).

Defaults to `{}`

```javascript
const logic = kea({
  actions: {
    doSomething: (value) => ({ value }),
  },
})

logic.mount()
logic.actionCreators ==
  {
    doSomething: (value) => ({ type: 'do something (logic)', payload: { value } }),
  }
logic.actionCreators.doSomething.toString() === 'do something (logic)'
```

### logic.actionKeys

An object that returns the local short form for a Redux action's `type` if present:

Defaults to `{}`

```javascript
const logic = kea({
  actions: {
    doSomething: (value) => ({ value }),
  },
})

logic.mount()
logic.actionKeys ==
  {
    'do something (logic)': 'doSomething',
  }
```

### logic.actions

Action creators that are wrapped with Redux's `dispatch`.

Defaults to `{}`

```javascript
const logic = kea({
  actions: {
    doSomething: (value) => ({ value }),
  },
})

logic.mount()
logic.actions ==
  {
    doSomething: (value) => store.dispatch(logic.actionCreators.doSomething(value)),
  }
logic.actions.doSomething.toString() === 'do something (logic)'
```

### logic.cache

An object you can use to store random data on that's accessible from all parts of the logic.

This is not meant to pass data around, but to help plugins manage their work.

Defaults to `{}`

### logic.connections

All the other logic this `logic` depends on, which is mounted with this logic. Includes itself.

Defaults to `{}`

```javascript
const otherLogic = kea({
  path: () => ['scenes', 'other'],
})

const logic = kea({
  connect: [otherLogic],
  path: () => ['scenes', 'myself'],
})

logic.connections ==
  {
    'scenes.other': otherLogic,
    'scenes.myself': logic,
  }
```

### logic.constants

Constants object that is created from an array.

Defaults to `{}`

```javascript
const logic = kea({
  constants: ['SHOW_ALL', 'SHOW_NONE'],
})

logic.mount()
logic.contants ==
  {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_NONE: 'SHOW_NONE',
  }
```

### logic.defaults

Default values as they were when the logic was created.

Defaults to `{}`

```javascript
const logic = kea({
    defaults: { key: 'value' },
    reducers: {
        reducerKey: ['reducerDefault', { ... }]
    }
})

logic.mount()
logic.defaults == {
    key: 'value',
    reducerKey: 'reducerDefault',
}
```

### logic.events

Various lifecycle events for the logic. You should not access this directly.

Defaults to `{}`

```javascript
const logic = kea({
  events: {
    afterMount: () => {
      console.log('kea is awesome!')
    },
  },
})

logic.mount()
logic.events ==
  {
    afterMount: () => {
      console.log('kea is awesome!')
    },
  }
```

### logic.listeners

Array of functions listening for certain events. You should not access `logic.listeners` directly,
but dispatch `actions` that the listeners then listen to!

Defaults to `undefined`

```javascript
const logic = kea({
  path: () => ['scenes', 'bird'],
  actions: {
    someAction: true,
  },
  listeners: {
    someAction: () => {
      console.log('kea is awesome!')
    },
  },
})

logic.mount()
logic.listeners ==
  {
    'some action (scenes.bird)': [
      () => {
        console.log('kea is awesome!')
      },
    ],
  }
```

### logic.propTypes

Optional PropTypes given to the logic.

Defaults to `{}`

```javascript
const logic = kea({
    propTypes: { key: PropTypes.object },
    reducers: {
        reducerKey: ['reducerDefault', PropTypes.string, { ... }]
    }
})

logic.mount()
logic.propTypes == {
    key: PropTypes.object,
    reducerKey: PropTypes.string,
}
```

### logic.reducer

The combined [redux-style reducer](https://redux.js.org/basics/reducers) for this logic:

Defaults to `undefined`

```javascript
const logic = kea({
    reducers: {
        reducerKey: ['reducerDefault', { ... }]
        otherReducerKey: ['reducerDefault', { ... }]
    }
})

logic.mount()
logic.reducer == (localState, action, fullState) => ({
    reducerKey: logic.reducers.reducerKey(localState.reducerKey, action, fullState),
    otherReducerKey: logic.reducers.reducerKey(localState.otherReducerKey, action, fullState),
})
```

### logic.reducerOptions

Options that were used when creating this logic's reducers

Defaults to `{}`

```javascript
const logic = kea({
    reducers: {
        reducerKey: ['reducerDefault', { persist: true, propType: PropTypes.string }, { ... }]
        otherReducerKey: ['reducerDefault', { ... }]
    }
})

logic.mount()
logic.reducerOptions ==  {
    reducerKey: { persist: true, propType: PropTypes.string },
    otherReducerKey: {}
}
```

### logic.reducers

Redux-style [reducers](https://redux.js.org/basics/reducers) for this logic:

Defaults to `{}`

```javascript
const logic = kea({
    reducers: {
        reducerKey: ['reducerDefault1', { ... }]
        otherReducerKey: ['reducerDefault2', { ... }]
    }
})

logic.mount()
logic.reducers == {
    reducerKey: (localState, action, fullState) => 'reducerDefault1',
    otherReducerKey: (localState, action, fullState) => 'reducerDefault2',
}
```

### logic.selector

Selector to find the logic's reducer in the store

Defaults to `undefined`

```javascript
const logic = kea({
    path: ['scenes', 'logic'],
    reducers: {
        reducerKey: ['reducerDefault1', { ... }]
        otherReducerKey: ['reducerDefault2', { ... }]
    }
})

logic.mount()
logic.selector == state => state.scenes.logic
```

### logic.selectors

Selectors to find each individual reducer or other selector in the store

Defaults to `{}`

```javascript
const logic = kea({
    path: () => ['scenes', 'logic'],
    reducers: {
        reducerKey: ['reducerDefault1', { ... }]
        otherReducerKey: ['reducerDefault2', { ... }]
    },
    selectors: {
        selectedValues: [
            (selectors) => [selectors.reducerKey, selectors.otherReducerKey],
            (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`
        ]
    }
})

logic.mount()
logic.selectors == {
    reducerKey: state => logic.selector(state).reducerKey,
    otherReducerKey: state => logic.selector(state).otherReducerKey,
    selectedValues: state => {
        // This is simplified. There's memoization with reselect happening as well
        const func = (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`
        return func(logic.selectors.reducerKey(state), logic.selectors.otherReducerKey(state))
    }
}
```

### logic.sharedListeners

Object to help share code between listeners

Defaults to `undefined`

```javascript
const logic = kea({
  path: ['scenes', 'bird'],
  actions: {
    someAction: true,
  },
  listeners: ({ sharedListeners }) => ({
    someAction: sharedListeners.processStuff,
  }),
  sharedListeners: {
    processStuff: () => {
      console.log('kea is awesome!')
    },
  },
})

logic.mount()
logic.sharedListeners ==
  {
    processStuff: () => {
      console.log('kea is awesome!')
    },
  }
```

### logic.values

Convenient shorthand for accessing selectors. Uses
[getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) under the hood.

Defaults to `{}`

```javascript
const logic = kea({
    path: ['scenes', 'logic'],
    reducers: {
        reducerKey: ['reducerDefault1', { ... }]
        otherReducerKey: ['reducerDefault2', { ... }]
    },
    selectors: {
        selectedValues: [
            (selectors) => [selectors.reducerKey, selectors.otherReducerKey],
            (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`
        ]
    }
})

logic.mount()
logic.values.reducerKey == logic.selectors.reducerKey(store.getState())
logic.values.otherReducerKey == logic.selectors.otherReducerKey(store.getState())
logic.values.selectedValues == logic.selectors.selectedValues(store.getState())
```

## Methods

### logic()

By calling just `logic(something)`, we call any of the following methods:

```javascript
const logic = kea({})

logic()          --> logic.build()
logic(props)     --> logic.build(props)
logic(Component) --> logic.wrap(Component)
```

### logic.wrap(Component)

Wrap the logic around a React Component (functional or Class) and give it access to all actions and values.

You can also use the shorthand `logic(Component)`, demonstrated below:

```javascript
const logic = kea({
  actions: {
    doSomething: true,
    doSomethingElse: true,
  },
  reducers: {
    firstOne: ['defaultValue'],
    secondOne: ['defaultValue'],
  },
})

// with function components

function MyComponent({ firstOne, secondOne, actions: { doSomething, doSomethingElse } }) {
  // ...
}

const ConnectedComponent = logic(MyComponent)

// with class components

class MyClassComponent extends Component {
  render() {
    const { firstOne, secondOne } = this.props

    // NB! this.actions is a shorthand for this.props.actions
    const { doSomething, doSomethingElse } = this.actions

    return <div />
  }
}

const ConnectedClassComponent = logic(MyClassComponent)
```

### logic.build(props)

Build the logic, but don't yet connect it to Redux

You may also use the shorthand `logic(props)`.

Builds are cached on the context, so calling it a on every render is very fast, assuming the key doesn't change.

```javascript
// create a logic
const logic = kea({
  key: (props) => props.id,

  constants: ['SOMETHING'],

  actions: {
    doSomething: true,
  },

  reducers: {
    myValue: ['yes'],
  },
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
builtLogic.constants == { SOMETHING: 'SOMETHING' }

// a disconnected selector, will probably throw when called
builtLogic.selectors.myValue(state)

// this will throw since the logic is not mounted
builtLogic.values.myValue
```

:::note
`logic.build` accepts a second parameter: `.build(props, autoConnectInListener)`

To read more on the `autoConnectInListener` parameter, check out
["Calling `mount()` inside listeners with `autoConnect: true`"](/docs/guide/advanced#calling-logicmount-inside-listeners)
under the "Usage without React" page.
:::

### logic.mount()

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
logic.mount((builtLogic) => {
  builtLogic.actions.doSomething()
  console.log(builtLogic.values.myValue)
})

// The callback can also be async
logic.mount(async (builtLogic) => {
  const response = await window.fetch('/api/give-me-all-your-data')
  builtLogic.actions.doSomething(await response.json())
  console.log(builtLogic.values.myValue)
})
```

### logic.extend(input)

Add more features to the logic

```javascript
// create a logic
const logic = kea({
  actions: {
    doSomething: true,
  },

  reducers: {
    myValue: ['yes'],
  },
})

logic.extend({
  actions: {
    doSomethingElse: true,
  },

  reducers: {
    anotherValue: ['no'],
  },
})

// Now you can use both:
Object.keys(logic.build().actions) == ['doSomething', 'doSomethingElse']
Object.keys(logic.build().selectors) == ['myValue', 'anotherValue']
```
