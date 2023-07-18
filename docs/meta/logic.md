---
sidebar_position: 1
---

:::note
The docs below describe what to do with a `logic` after you have built it. If this is your first time here, start by learning about [how to create logic with `kea()`](/docs/meta/kea).
:::

# logic

All Kea code lives inside a `logic`, which is created by passing logic builders to [`kea([])`](/docs/meta/kea)

```ts
import { kea } from 'kea'

const logic = kea([
  // various logic builders here
])
```

## Why do we call it `logic`?

Well, we had to call it something and everything else was already taken. 😅

More seriously, the name `logic` implies that calling `kea()` return complex objects,
which not only contain a piece of your state, but also all the _logic_ that manipulates it.

It's a useful convention, and I suggest sticking to it. It's useful to call your logic with
names that end with `Logic`, such as `accountLogic`, `dashboardLogic`, etc.

## Lifecycles

A `logic` can be in three different states:

```ts
// 1. Initialized
const loginLogic = kea([...builders])

// 2. Built
const builtLoginLogic = loginLogic.build()

// 3. Mounted
const unmount = builtLoginLogic.mount()
```

1. **Initialized**. When your JS interpreter encounters a `kea([...builders])` call, it stores a reference to `builders` inside `logic`. It doesn't run anything yet.
2. **Built**. To build a logic, apply all [logic builders](/docs/meta/kea) in order. The result is a complete `builtLogic` object with various properties, but
   which doesn't do much on its own.
3. **Mounted**. Once a logic is built, it can be mounted. This means attaching its the `reducers` to
   Redux, making its `selectors` actually point to a `value` in the store, registering all `listeners`, firing all `afterMount` events, and so on.

## Mounting and Unmounting

When you use [Kea with React](/docs/meta/key), there's a lot that is handled for you behind the scenes.
For example logic is mounted automatically with your `<Component />` and unmounted when it's no longer needed.

Sometimes you may want to mount logic outside React. For example to already start loading data in
your router before transitioning to a component... or in `getInitialProps` in next.js... or when writing
tests with Jest.

Perhaps you even want to use Kea without React.

In any case, just call `mount()` and `unmount()` on your logic:

```javascript
// create the counter logic from some of the previous examples
const logic = kea([])

// connect the reducers, init the state in the store, run afterMount effects
logic.mount()

logic.values.counter
// => 0

logic.actions.increment()
// => { type: 'increment ...', payload: { amount: 1 } }

logic.values.counter
// => 1

// remove reducers from the store
logic.unmount()

logic.values.counter
// => throw new Error()!
```

In case you need to pass props to your logic, for example if it is [keyed](/docs/meta/key),
you should [build the logic](/docs/meta/logic#logicbuildprops) explicitly before calling `mount()` on it:

```javascript
// create the counter logic from the examples above, but with a key!
const logic = kea([key((props) => props.id), ...otherBuilders])

// build the logic with props (`logic(props)` is short for `logic.build(props)`)
const logicWithProps = logic({ id: 123, otherProp: true })

// mount and unmount
logicWithProps.mount()
logicWithProps.unmount()
```

## Unmounting too many times

All mounts and unmounts are counted. If you call `mount` twice, you need to call `unmount` twice to fully unmount.

If you're not careful and call `logic.unmount()` more times than `logic.mount()`, you may unmount a logic that should
still remain mounted. Some other logic probably depends on it.

To better control the flow, `logic.mount` returns a function that can be used to unmount exactly once:

```javascript
// create a logic
const logic = kea([])
// increment the mount count by one
const unmount = logic.mount()
// unmount the logic. Will run just once, even if called many times
unmount()
```

## Methods

### logic()

By calling just `logic(something)`, we call any of the following methods:

```javascript
const logic = kea([])

logic()          --> logic.build()
logic(props)     --> logic.build(props)
logic(Component) --> logic.wrap(Component)
```

### logic.build(props)

Build the logic, but don't yet connect it to the store.

You may also use the shorthand `logic(props)`.

Builds are cached on the context, so calling it a on every render is very fast, assuming the key doesn't change.

```javascript
// create a logic
const logic = kea([
  key((props) => props.id),

  actions({
    doSomething: true,
  }),

  reducers({
    myValue: ['yes'],
  }),
])

// get a built copy
const builtLogic = logic.build({ id: 10 })

// you may now access all the properties
// ... keeping in mind it's not yet mounted

// probably not useful if the logic is not mounted
builtLogic.actions.doSomething()

// a disconnected selector, will probably throw when called
builtLogic.selectors.myValue(state)

// this will throw since the logic is not mounted
builtLogic.values.myValue
```

### logic.mount()

Mount the logic. Return a function that unmounts.

Shorthand for `logic.build().mount()`

```javascript
const logic = kea([])

// When you call logic.mount(), we actually send it through .build():
logic.mount() == logic.build().mount()

// With logic with keys, this is true:
logic(props).mount() == logic.build(props).mount()

// In any case, logic.mount() connects this logic to the store
// and also mounts all other connected logic.
// It returns a function, which when called will unmount the logic from the store:
const unmount = logic.mount()

logic.actions.doSomething()
console.log(logic.values.myValue)

unmount()
```

### logic.unmount()

Unmount the logic from the store. Be careful with calling this more times than necessary. Use the returned function of `logic.mount()`
to better control this.

Shorthand for `logic.build().unmount()`

```javascript
const logic = kea([])

logic.mount()
logic.unmount()
```

### logic.extend(input)

Up until a logic has been built and mounted, you can extend it:

```javascript
const logic = kea([
  actions({
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount }),
  }),

  reducers({
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  }),
])

logic.extend([
  reducers({
    negativeCounter: [
      0,
      {
        increment: (state, { amount }) => state - amount,
        decrement: (state, { amount }) => state + amount,
      },
    ],
  }),
])

// later in React
const { counter, negativeCounter } = useValues(logic)
```

### logic.find(keyOrProps): BuiltLogic 

Find if a logic is mounted. Throw an error if not.

```typescript
import { reportingLogic } from './reportingLogic'

const logic = kea([
  listeners({
    something: () => {
      // only run if reportingLogic is mounted
      reportingLogic.find(2).actions.reportEvent({
        event: 'something',
        foobar: 'heck yeah',
      })
    },
  }),
])
```
### logic.findMounted(keyOrProps): BuiltLogic | null

Return a mounted logic or null.

```typescript
import { reportingLogic } from './reportingLogic'

const logic = kea([
  listeners({
    something: () => {
      // only run if reportingLogic is mounted
      reportingLogic.findMounted({ id: 2 })?.actions.reportEvent({
        event: 'something',
        foobar: 'heck yeah',
      })
    },
  }),
])
```

### logic.isMounted(keyOrProps): boolean

Is a logic matching the given props mounted?

```typescript
import { reportingLogic } from './reportingLogic'

const logic = kea([
  listeners({
    something: () => {
      // only run if the logic for id: 2 is mounted
      if (reportingLogic.isMounted({ id: 2 })) {
        console.log(reportingLogic({ id: 2 }).values.count)
      }
      // will throw if the logic for id: 123 is not mounted
      console.log(reportingLogic({ id: 123 }).values.count)
    },
  }),
])
```

### logic.wrap(Component)

Wrap the logic around a React Component (functional or Class) and give it access to all actions and values.

You can also use the shorthand `logic(Component)`, demonstrated below:

```javascript
const logic = kea([
  actions({
    doSomething: true,
    doSomethingElse: true,
  }),
  reducers({
    firstOne: ['defaultValue'],
    secondOne: ['defaultValue'],
  }),
])

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

## Properties

Outwardly, you usually only care about `logic.actions` and `logic.values`. The properties below are useful
when you're building your own logic builders.

Read the docs on [`kea([])`](/docs/meta/kea) and about the [core logic builders](/docs/core/) to learn how to
build a logic itself.

### logic.actionCreators

An array of functions that create a [Redux action](https://redux.js.org/basics/actions).

Defaults to `{}`

```javascript
const logic = kea([
  actions({
    doSomething: (value) => ({ value }),
  }),
])

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
const logic = kea([
  actions({
    doSomething: (value) => ({ value }),
  }),
])

logic.mount()
logic.actionKeys ==
  {
    'do something (logic)': 'doSomething',
  }
```

### logic.actionTypes

An object that returns the Redux action's `type` for an action's local key:

Defaults to `{}`

```javascript
const logic = kea([
  actions({
    doSomething: (value) => ({ value }),
  }),
])

logic.mount()
logic.actionTypes ==
  {
    doSomething: 'do something (logic)',
  }
```

### logic.actions

Action creators that are wrapped with Redux's `dispatch`.

Defaults to `{}`

```javascript
const logic = kea([
  actions({
    doSomething: (value) => ({ value }),
  }),
])

logic.mount()
logic.actions ==
  {
    doSomething: (value) => store.dispatch(logic.actionCreators.doSomething(value)),
  }
logic.actions.doSomething.toString() === 'do something (logic)'
```

### logic.cache

An object you can use to store random data on that's accessible from all parts of the logic.

Defaults to `{}`

This is not meant to pass around application data (use reducers for that), but to help the logic's internals manage their work.

This is also often used to store event listeners:

```ts
import { kea, afterMount, beforeUnmount } from 'kea'

const logic = kea([
  afterMount(({ actions, cache }) => {
    cache.onMouseMove = (e) => {
      console.log('mouse moved', e.offsetX, e.offsetY)
    }
    window.addEventListener('mousemove', cache.onMouseMove)
  }),
  beforeUnmount(({ actions }) => {
    window.removeEventListener('mousemove', cache.onMouseMove)
  }),
])
```

### logic.connections

All the other logic this `logic` depends on, which is mounted with this logic. Includes itself.

Defaults to `{}`

```javascript
const otherLogic = kea([
  path(['scenes', 'other']),
  //
])

const logic = kea([
  path(['scenes', 'myself']),
  connect([otherLogic]),
  //
])

logic.connections ==
  {
    'scenes.other': otherLogic,
    'scenes.myself': logic,
  }
```

### logic.defaults

Default values as they were when the logic was created.

Defaults to `{}`

```javascript
const logic = kea([
  defaults({ key: 'value' }),
  reducers({
    reducerKey: ['reducerDefault', { skip }],
  }),
])

logic.mount()
logic.defaults ==
  {
    key: 'value',
    reducerKey: 'reducerDefault',
  }
```

### logic.events

Various lifecycle events for the logic. You should not access this directly.

Defaults to `{}`

```javascript
const logic = kea([
  events({
    afterMount: () => {
      console.log('kea is awesome!')
    },
  }),
])

logic.mount()
logic.events ==
  {
    afterMount: () => {
      console.log('kea is awesome!')
    },
  }
```

### logic.inputs

All the gathered inputs for building this logic

```javascript
inputs = [
  events({
    afterMount: () => {
      console.log('kea is awesome!')
    },
  }),
]
const logic = kea(inputs)
logic.inputs === inputs

logic.extend([actions({})])

logic.inputs === [...inputs, actions({})]
```

You can use `inputs` to inherit building blocks from other logic:

```js
const newLogic = kea([
  ...otherLogic.inputs,
  actions({
    addMyStuff: true,
  }),
])
```

### logic.listeners

Array of functions listening for certain events. You should not access `logic.listeners` directly,
but dispatch `actions` that the listeners then listen to!

Defaults to `undefined`

```javascript
const logic = kea([
  path(['scenes', 'bird']),
  actions({
    someAction: true,
  }),
  listeners({
    someAction: () => {
      console.log('kea is awesome!')
    },
  }),
])

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

### logic.reducer

The combined [redux-style reducer](https://redux.js.org/basics/reducers) for this logic:

Defaults to `undefined`

```javascript
const logic = kea([
  reducers({
    reducerKey: ['reducerDefault', { skip }],
    otherReducerKey: ['reducerDefault', { skip }],
  }),
])

logic.mount()
logic.reducer ==
  ((localState, action, fullState) => ({
    reducerKey: logic.reducers.reducerKey(localState.reducerKey, action, fullState),
    otherReducerKey: logic.reducers.otherReducerKey(localState.otherReducerKey, action, fullState),
  }))
```

### logic.reducerOptions

Options that were used when creating this logic's reducers

Defaults to `{}`

```javascript
const logic = kea([
  reducers({
    reducerKey: ['reducerDefault', { persist: true }, { skip }],
    otherReducerKey: ['reducerDefault', { skip }],
  }),
])

logic.mount()
logic.reducerOptions ==
  {
    reducerKey: { persist: true, propType: PropTypes.string },
    otherReducerKey: {},
  }
```

### logic.reducers

Redux-style [reducers](https://redux.js.org/basics/reducers) for this logic:

Defaults to `{}`

```javascript
const logic = kea([
  reducers({
    reducerKey: ['reducerDefault1', { skip }],
    otherReducerKey: ['reducerDefault2', { skip }],
  }),
])

logic.mount()
logic.reducers ==
  {
    reducerKey: (localState, action, fullState) => 'reducerDefault1',
    otherReducerKey: (localState, action, fullState) => 'reducerDefault2',
  }
```

### logic.selector

Selector to find the logic's reducer in the store

Defaults to `undefined`

```javascript
const logic = kea([
  path(['scenes', 'logic']),
  reducers({
    reducerKey: ['reducerDefault1', { skip }],
    otherReducerKey: ['reducerDefault2', { skip }],
  }),
])

logic.mount()
logic.selector == ((state) => state.scenes.logic)
```

### logic.selectors

Selectors to find each individual reducer or other selector in the store

Defaults to `{}`

```javascript
const logic = kea([
  path(['scenes', 'logic']),
  reducers({
    reducerKey: ['reducerDefault1', { skip }],
    otherReducerKey: ['reducerDefault2', { skip }],
  }),
  selectors({
    selectedValues: [
      (selectors) => [selectors.reducerKey, selectors.otherReducerKey],
      (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`,
    ],
  }),
])

logic.mount()
logic.selectors ==
  {
    reducerKey: (state) => logic.selector(state).reducerKey,
    otherReducerKey: (state) => logic.selector(state).otherReducerKey,
    selectedValues: (state) => {
      // This is simplified. There's memoization with reselect happening as well
      const func = (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`
      return func(logic.selectors.reducerKey(state), logic.selectors.otherReducerKey(state))
    },
  }
```

### logic.sharedListeners

Object to help share code between listeners

Defaults to `undefined`

```javascript
const logic = kea([
  path(['scenes', 'bird']),
  actions({
    someAction: true,
  }),
  listeners(({ sharedListeners }) => ({
    someAction: sharedListeners.processStuff,
  })),
  sharedListeners({
    processStuff: () => {
      console.log('kea is awesome!')
    },
  }),
])

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
const logic = kea([
  path(['scenes', 'logic']),
  reducers({
    reducerKey: ['reducerDefault1', { skip }],
    otherReducerKey: ['reducerDefault2', { skip }],
  }),
  selectors({
    selectedValues: [
      (selectors) => [selectors.reducerKey, selectors.otherReducerKey],
      (reducerKey, otherReducerKey) => `${reducerKey} + ${otherReducerKey}`,
    ],
  }),
])

logic.mount()
logic.values.reducerKey == logic.selectors.reducerKey(store.getState())
logic.values.otherReducerKey == logic.selectors.otherReducerKey(store.getState())
logic.values.selectedValues == logic.selectors.selectedValues(store.getState())
```
