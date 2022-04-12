---
sidebar_position: 0
---

# kea

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`?

Well, we had to call it something and everything else was already taken. 😅

More seriously, the name `logic` implies that calling `kea()` return complex objects,
which not only contain a piece of your state, but also all the _logic_ that manipulates it.

It's a useful convention and we suggest sticking to it. Feel free to call your logic with
names that make sense, such as `accountLogic`, `dashboardLogic`, etc.

## Input objects vs functions

Whenever you're using any of kea's built-in primitives (`actions`, `reducers`, `listeners`, etc),
you have two options.

You can pass objects to them:

```javascript
kea({
  actions: {
    increment: true,
  },
  listeners: {
    increment: () => {
      console.log('incrementing!')
    },
  },
})
```

... or you can pass functions to them:

```javascript
kea({
  actions: () => ({
    // added "() => ("
    increment: true,
  }), // added ")"
  listeners: () => ({
    // added "() => ("
    increment: () => {
      console.log('++!')
    },
  }), // added ")"
})
```

What's the difference?

First, if you pass a function, it gets evaluated lazily when the logic is built.

If you're using values that are not guaranteed to be there (e.g. a reducer that uses
`otherLogic.actionTypes.something`), pass a function:

```javascript
kea({
  reducers: () => ({
    // evaluate later
    counter: [
      0,
      {
        increment: (state) => state + 1,
        // controlLogic.actions is undefined when loading this code
        // so we must wrap a function around it
        [controlLogic.actionTypes.setCounter]: (_, { counter }) => counter,
      },
    ],
  }),
})
```

Second, the function you pass gets one argument, `logic`, which you
can destructure to get `actions`, `values` and other goodies on the logic that you're building:

```javascript
kea({
  listeners: ({ actions, values }) => ({
    increment: () => {
      if (values.iHaveHadEnough) {
        actions.doSomethingElse()
      }
    },
  }),
})
```

The recommendation is to write the simplest code you can (start with an `reducers: {}`)
and when you need to access `actions`, `values` or perform lazy evaluation, convert it into
a function.

## Lifecycles

Kea's `logic` has three different states:

1. **Initialized**. When your JavaScript interpreter encounters a `const logic = kea(input)` call, not
   much happens. It just stores the `input` variable on the logic and goes on. No processing takes place.
2. **Built**. When a logic is needed, it must first be built. This means converting
   an `input` such as `{ actions: { ... } }` into actual functions on `logic.actions`
   that can be called. Same for all the `reducers`, `selectors`, etc.
3. **Mounted**. Once a logic is built, it can be mounted. This means attaching the `reducers` to
   Redux, registering all the `listeners`, etc.

If you use Kea outside of React, you have to mount and unmount your `logic` manually.
Read the next section for instructions on how to do so.

If you use Kea [with React](/docs/guide/react), every time you render a component that access a `logic`
via `useValues`, `useActions` or some other method, the logic is built and mounted automatically. When all components
that use a `logic` are removed from React's tree, that `logic` will be unmounted automatically.

Only `logic` which is actively in use will be mounted and attached to Redux.

## Mounting and Unmounting

When you use [Kea with React](/docs/guide/react), there's a lot that is handled for you behind the scenes.
For example logic is mounted automatically with your `<Component />` and unmounted when it's no longer needed.

Sometimes however, you wish to manually mount logic. For example to already start loading data in
your router before transitioning to a component... or in `getInitialProps` in next.js... or when writing
tests with Jest.

Perhaps you even want to use Kea with a framework other than React.

In any case, just call `mount()` on your logic and get as a reply a function that will `unmount` it:

```javascript
// create the counter logic from some of the previous examples
const logic = kea({ ... })

// connect its reducers to redux
const unmount = logic.mount()

logic.values.counter
// => 0

logic.actions.increment()
// => { type: 'increment ...', payload: { amount: 1 } }

logic.values.counter
// => 1

// remove reducers from redux
unmount()

logic.values.counter
// => throw new Error()!
```

In case you need to pass props to your logic, for example if it is [keyed](/docs/guide/additional#keyed-logic),
you should [build the logic](/docs/api/logic#logicbuild) explicitly before calling `mount()` on it:

```javascript
// create the counter logic from the examples above, but with a key!
const logic = kea({ key: props => props.id, ... })

// build the logic with props (`logic(props)` is short for `logic.build(props)`)
const logicWithProps = logic({ id: 123, otherProp: true })

const unmount = logicWithProps.mount()

// do what needs to be done
logicWithProps.actions.increment()

// call `logic()` again with the same key if you want to update the other props
logic({ id: 123, otherProp: false })

unmount()
```

There are a few other options you can use. See the [logic API](/docs/api/logic) for more details.

## Calling `logic.mount()` inside listeners

In Kea 2.0 logic automatically connects when used inside another logic.

Assuming `counterLogic` is not used anywhere else, when called in the listener here,
it will be automatically built and mounted:

```javascript
// Works in Kea 2.1+
const logic = kea({
  actions: {
    showCount: true,
  },
  listeners: {
    showCount: () => {
      console.log('Increment called!')
      console.log(`Counter: ${counterLogic.values.counter}`)
    },
  },
})
```

It will also remain mounted for as long as `logic` is mounted.

What if you don't want that and instead prefer to mount and unmount `counerLogic` manually within
the listener?

A practical example of this is to mount a logic to preload data on a route change 150ms before
transitioning the scene... and then to unmount it manually once the page loaded. It's enough to
prevent the "flash of loading" in most cases.

Instead of directly calling `logic.mount()`, you just need to build the logic fist, even if it
doesn't need any props. You must then pass `false` as the second argument to `.build`:

```javascript
// Works in Kea 2.0+
const logic = kea({
  actions: {
    showCount: true,
  },
  listeners: {
    showCount: () => {
      // counterLogic.build(props, autoConnectInListener)
      const builtCounterLogic = counterLogic.build({}, false)
      const unmount = builtCounterLogic.mount()

      console.log('Incrementing!')
      builtCounterLogic.actions.increment()

      console.log(`Counter: ${builtCounterLogic.values.counter}`)

      unmount() // and it's gone!
    },
  },
})
```

Instead of using `logic(props)` to build the logic, use `logic.build(props, false)`.

Without explicitly setting this second argument (`autoConnectInListener`) to false,
`counterLogic` would have been automatically built and mounted on `counterLogic.values`.

Calling `.mount()` on a built and mounted logic won't mount it twice, but it will stay mounted
until the returned `unmount` is called, even if no other logic is connected to it.

## Extending logic

Up until a logic has been built and mounted, you can extend it:

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

logic.extend({
  reducers: {
    negativeCounter: [
      0,
      {
        increment: (state, { amount }) => state - amount,
        decrement: (state, { amount }) => state + amount,
      },
    ],
  },
})

// later in React
const { counter, negativeCounter } = useValues(logic)
```

Extending logic is especially powerful when [writing plugins](/docs/guide/writing-plugins). For
example to dynamically add actions, reducers or listeners to a logic, based on some key.
