---
id: advanced
title: Advanced Topics
sidebar_label: Advanced Topics
---

:::note
Here are some more things you can do with Kea. You probably won't need use them, 
yet the information is here in case you do.
:::

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
        showCount: true
    },
    listeners: {
        showCount: () => {
            console.log('Increment called!')
            console.log(`Counter: ${counterLogic.values.counter}`)
        }
    }
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
        showCount: true
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
        }
    }
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
        decrement: (amount = 1) => ({ amount })
    },
    
    reducers: {
        counter: [0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    },
})

logic.extend({
    reducers: {
        negativeCounter: [0, {
            increment: (state, { amount }) => state - amount,
            decrement: (state, { amount }) => state + amount
        }]
    },
})

// later in React
const { counter, negativeCounter } = useValues(logic)
```

Extending logic is especially powerful when [writing plugins](/docs/guide/writing-plugins). For 
example to dynamically add actions, reducers or listeners to a logic, based on some key.


## Props in Selectors

Since `selectors` need to be recalculated when their inputs change, there's a twist when 
using `props` with them.

Take the following buggy code:
 
```javascript
const counterLogic = kea({
    // ...
    selectors: ({ props }) => ({
        diffFromDefault: [
            (selectors) => [selectors.counter],
            (counter) => counter - props.defaultCounter // DO NOT do this!
        ]
    })
})
``` 

The code will work, but only partially.
The problem is that the value of `diffFromDefault` will only be updated when `counter` changes,
but not when `props.defaultCounter` changes.

What if we would also like to update the selector when the props change? 
 
Previously [we defined](/docs/guide/concepts#selectors) a selector as a function like this:

```javascript
const selector = (state) => state.path.to.something.counter
```

That's an incomplete definition. All selectors have a second argument called `props`.

```javascript
const selector = (state, props) => state.path.to.something.counter + props.defaultCounter
```

To make your new selector update itself when props change, use an inline
selector that picks the right value from `props`:

```javascript
const counterLogic = kea({
    // ...
    selectors: {
        diffFromDefault: [
            (selectors) => [
                selectors.counter, 
                (_, props) => props.defaultCounter
            ],
            (counter, defaultCounter) => counter - defaultCounter
        ]
    }
})
```

## Shared listeners

If multiple `listeners` need to run the same code, you can:

1. Have all of them call a common action, which you then handle with another listener:

```javascript
const logic = kea({
    actions: {
        firstAction: true,
        secondAction: true,
        commonAction: true
        // ...
    },

    listeners: ({ actions, values }) => ({
        // two listeners with one shared action
        firstAction: actions.commonAction,
        secondAction: () => {
          actions.commonAction()
        },

        // you can also pass an array of functions
        commonAction: () => {
            // do something common
        }
    }),
})
```

This however dispatches a separate action, which is then listened to. 

2. If you want to share code between listeners without dispatching another action, use `sharedListeners`:

```javascript
const logic = kea({
    actions: {
        anotherAction: true,
        debouncedFetchResults: username => ({ username }),
        oneActionMultipleListeners: true,
        // ...
    },

    listeners: ({ actions, values, store, sharedListeners }) => ({
        // two listeners with one shared action
        anotherAction: sharedListeners.doSomething,

        // you can also pass an array of functions
        oneActionMultipleListeners: [
            (payload, breakpoint, action) => {
                /* ... */
            },
            sharedListeners.doSomething,
            sharedListeners.logAction,
        ],
    }),

    // if multiple actions must trigger similar code, use sharedListeners
    sharedListeners: ({ actions }) => ({
        // all listeners and sharedListeners also get a third parameter:
        // - action = the full dispatched action
        doSomething: (payload, breakpoint, action) => {
            if (action.type === actions.anotherAction.toString()) {
                console.log(action)
            }
        },
        logAction: (_, __, action) => {
            console.log('action dispatched', action)
        }  
    }),
})
```

That function will be called directly, without an action being dispatched in the middle.

You might still prefer to explicitly dispatch an action, as that level of abstraction may
be better suited for the task at hand. You can use the shared action in a reducer for example.

<br />

:::note Next steps
* For even more advanced topics, read [Migrating from Redux](/docs/guide/migrating-redux) to learn
how Kea and Redux interact under the hood.
:::