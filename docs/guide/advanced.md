---
id: advanced
title: Advanced Topics
sidebar_label: Advanced Topics
---

:::note
Here are some more things you can do with Kea. You probably won't need use most of them, 
yet the information is here in case you do.
:::

## Extending logic

Up until a logic has been built and mounted, you can extend it:

```javascript
const logic = kea({
    actions: () => ({
        increment: (amount = 1) => ({ amount }),
        decrement: (amount = 1) => ({ amount })
    }),
    
    reducers: () => ({
        counter: [0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }),
})

logic.extend({
    reducers: () => ({
        negativeCounter: [0, {
            increment: (state, { amount }) => state - amount,
            decrement: (state, { amount }) => state + amount
        }]
    }),
})

// later in React
const { counter, negativeCounter } = useValues(logic)
```

Extending logic is especially powerful when [writing plugins](/docs/guide/writing-plugins). For 
example to dynamically add actions, reducers or listeners to a logic, based on some key.

## Lifecycles

Kea's `logic` has three different states: 

1. **Initialized**. When your JavaScript interpreter encounters a `const logic = kea(input)` call, not
   much happens. It just stores the `input` variable on the logic and goes on. No processing takes place.
2. **Built**. When a logic is needed, it must first be built. This means converting
   an `input` such as `{ actions: () => ({ ... }) }` into actual functions on `logic.actions`
   that can be called. Same for all the `reducers`, `selectors`, etc.
3. **Mounted**. Once a logic is built, it can be mounted. This means attaching the `reducers` to
   Redux, registering all the `listeners`, etc.  

If you use Kea outside of React, you have to mount and unmount your `logic` manually. 
[See here](/docs/guide/standalone) for instructions on how to do so. 

If you use Kea [with React](/docs/guide/react), every time you render a component that access a `logic`
via `useValues`, `useActions` or some other method, the logic is built and mounted automatically. When all components 
that use a `logic` are removed from React's tree, that `logic` will be unmounted automatically.

Only `logic` which is actively in use will be mounted and attached to Redux.


## Props in Selectors

Since `selectors` need to be recalculated when their inputs change, there's a twist when 
using `props` with them.

Take the following buggy code:
 
```javascript
const counterLogic = kea({
    // ...
    selectors: ({ selectors, props }) => ({
        diffFromDefault: [
            () => [selectors.counter],
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
    selectors: ({ selectors }) => ({
        diffFromDefault: [
            () => [
                selectors.counter, 
                (_, props) => props.defaultCounter
            ],
            (counter, defaultCounter) => counter - defaultCounter
        ]
    })

})
```

## Shared listeners

If multiple `listeners` need to run the same code, you can:

1. Have all of them call a common action, which you then handle with another listener:

```javascript
const logic = kea({
    actions: () => ({
        firstAction: true,
        secondAction: true,
        commonAction: true
        // ...
    }),

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
    actions: () => ({
        anotherAction: true,
        debouncedFetchResults: username => ({ username }),
        oneActionMultipleListeners: true,
        // ...
    }),

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
