---
id: standalone
title: Using without React
sidebar_label: Using without React
---

## Mounting and Unmounting

When you use [Kea with React](/docs/guide/react), there's a lot that is handled for you behind the scenes.
For example logic is mounted automatically with your `<Component />` and unmounted when it's no longer needed.

Sometimes however, you wish to manually mount logic. For example to already start loading data in
your router before transitioning to a component... or in `getStaticProps` in next.js.

Perhaps you even want to use Kea without React.

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

In case you need to pass props to your logic, for example if it [keyed](/docs/guide/advanced#keyed-logic), 
build the logic explicitly before calling `mount()` on it:

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

## Calling `mount()` inside listeners with `autoConnect: true`.

In Kea 2.0 logic automatically connects when used inside another logic.

Assuming `counterLogic` is not used anywhere else, when called in the listener here,
it will be automatically built and mounted:

```javascript
// Works in Kea 2.0+
const logic = kea({
    actions: () => ({
        showCount: true
    }),
    listeners: () => ({
        showCount: () => {
            console.log('Increment called!')
            console.log(`Counter: ${counterLogic.values.counter}`)
        }
    })
})
```

It will also remain mounted for as long as `logic` is mounted.

What if you don't want that and instead prefer to mount and unmount `counerLogic` manually within
the listener?

A practical example of this is to mount a logic to preload data on a route change 150ms before 
transitioning the scene. It's enough to prevent the "flash of loading" in most cases.

Instead of directly calling `logic.mount()`, you just need to build the logic fist, even if it
doesn't need any props. You must then pass `false` as the second argument to `.build`:

```javascript
// Works in Kea 2.0+
const logic = kea({
    actions: () => ({
        showCount: true
    }),
    listeners: () => ({
        showCount: () => {
            // counterLogic.build(props, autoConnectInListener)
            const builtCounterLogic = counterLogic.build({}, false)
            const unmount = builtCounterLogic.mount()

            console.log('Incrementing!')
            builtCounterLogic.actions.increment()

            console.log(`Counter: ${builtCounterLogic.values.counter}`)

            unmount() // and it's gone!
        }
    })
})
```

Instead of using `logic(props)` to build the logic, use `logic.build(props, false)`.

Without explicitly setting this second argument (`autoConnectInListener`) to false, 
`counterLogic` would have been automatically built and mounted on `counterLogic.values`.

Calling `.mount()` on a built and mounted logic won't mount it twice, but it will stay mounted
until the returned `unmount` is called, even if no other logic is connected to it.