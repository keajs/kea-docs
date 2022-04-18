---
sidebar_position: 0
---

# kea

## Logic builders

To create a  [`logic`](/docs/meta/logic), call `kea(input: LogicBuilder[])` with an array of logic builders.

```ts
import { kea, actions, reducers } from 'kea'
import { loginLogicType } from './loginLogicType'

export const loginLogic = kea<loginLogicType>([
  actions({
    setUsername: (username: string) => ({ username }),
  }),

  reducers({
    username: { setUsername: (_, { username }) => username },
  }),

  // do something custom
  (logic: BuiltLogic) => {
    logic.cache.foobar = logic.actions.setUsername
  },

  // a logic builder that calls another logic builder inside it
  (logic: BuiltLogic) => {
    actions({
      setPassword: (password) => ({ password }),
    })(logic)
  },
])
```

A `LogicBuilder` has the format `(logic: BuiltLogic) => { /* anything */ }`, and its job is to modify [any of the fields](/docs/meta/logic#properties) on a `logic`.

Normally you don't manipulate properties of your logic directly, but you use, uhm, _logic-builder-builders?_, like `actions` and `reducers` instead.

```ts
// part of `actions` from kea core
function actions<L extends Logic = Logic>(input: any): LogicBuilder<L> {
  return (logic) => {
    for (const [key, payload] of input) {
      logic.actionsCreators[key] = createAction(key, payload)
      logic.actions[key] = (...args: any[]) => dispatch(logic.actionsCreators[key](...args))
      // etc...
    }
  }
}
```

Your final `logic` is just a combination of all applied logic builders.

## Input objects vs functions

Whenever you're using any of kea's built-in primitives (`actions`, `reducers`, `listeners`, etc),
you have two options.

You can pass objects to them:

```javascript
kea([
  actions({
    increment: true,
  }),
  listeners({
    increment: () => {
      console.log('incrementing!')
    },
  }),
])
```

... or you can pass functions to them:

```javascript
kea([
  actions((logic) => ({
    // added "() => ("
    increment: true,
  })), // added ")"
  listeners((logic) => ({
    // added "() => ("
    increment: () => {
      console.log('++!')
    },
  })), // added ")"
])
```

What's the difference?

If you pass a function, it gets evaluated lazily when the logic is built.

If you're using values that are not guaranteed to be there, or not guaranteed to be available when your logic is evaluated,
wrap the input in a function. 

An example I've run into is an imported `otherLogic` being `undefined` due to the order in which your browser loads modules. 

```javascript
import { kea, reducers } from 'kea'
kea([
  reducers(() => ({
    // evaluate later
    counter: [
      0,
      {
        increment: (state) => state + 1,
        // otherLogic is undefined when loading this code
        // so we must wrap a function around it
        [otherLogic.actionTypes.setCounter]: (_, { counter }) => counter,
      },
    ],
  })),
])
```

The function you pass gets one argument, `logic`, which you can destructure to get `actions`, `values` and other goodies on the logic that you're building:

```javascript
kea([
  listeners(({ actions, values }) => ({
    increment: () => {
      if (values.iHaveHadEnough) {
        actions.doSomethingElse()
      }
    },
  })),
])
```

The recommendation is to write the simplest code you can (start with `reducers({})`)
and when you need to access `actions`, `values` or perform lazy evaluation, convert it into
a function that destructures the logic.

## Extending logic

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

## Kea 2.0 input object syntax

Up until Kea 2.0, instead of logic builders, you could pass an object to `kea({})`:

```javascript
const logic = kea({
  actions: {
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount }),
  },
  reducers: {
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  },
})
```

This object would then be evaluated in a predefined order. 

That syntax still works, and most Kea 2.0 code should function as is in 3.0.
