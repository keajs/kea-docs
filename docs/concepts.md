---
id: concepts
title: The Concepts of Kea
sidebar_label: Concepts
---

**WIP!** This doc aims to go in more detail what are the different parts of kea
and how to they all fit together.

Would be cool to add some images that better illustrate all these concepts.

## Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`? 

Well, we had to call it something and everything else was already taken 😅.

More seriously, the name `logic` implies that calling `kea()` return complex objects, 
which not only contain a piece of your state, but also all the logic that will manipulate it.  

It's a useful convention and we suggest sticking to it. Feel free to call your logic with
names that make sense, such as `accountLogic`, `dashboardLogic`, etc.


## Actions

The first thing you do in a logic is to define some actions:

```javascript
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }),
        keyPressed: (keyCode) => ({ keyCode }),
        setName: (name) => ({ name }),
        submitForm: (values, page) => ({ values, page }),
    })
})
```

Actions are the entry points to **all operations** in your logic.
Every state manipulation, every side effect, every drunk dial at four in the morning starts 
with an action.

Yet despite all this power, actions themselves do practically nothing. They just *signal intent*.
Everything else happens as a *reaction* to an action.

A helpful mental model to understand actions is the one 
of [events](https://en.wikipedia.org/wiki/Event_(computing)) in computer programming.

For example, every key press on your keyboard dispatches a `keyPress` event with a `keyCode`. It's then up to 
your operating system to listen to them and convert them to the 1970's steampunk sci-fi
novel you hope to finish one day.

Actions themselves are simple and [pure functions](https://en.wikipedia.org/wiki/Pure_function). The only 
thing they must do is to convert their arguments into a `payload` object. See here:

```jsx
const logic = kea({
    actions: () => ({
        // take in `amount`, give back `{ amount }`
        addToCounter: (amount) => ({ amount })
    })
})
```

Eventually you want to call `addToCounter` in your React component. 
Use the `useActions` hook to yank it out of the logic:

```jsx
function BigButton () {
    const { addToCounter } = useActions(logic)

    return (
        <button onClick={() => addToCounter(1000)}>
            Add one thousand! 🤩
        </button>
    )
}
```

In the code above, clicking the button calls `addToCounter` with one argument, `1000`. 

The action then converts it to a `payload` of `{ amount: 1000 }`. This payload will later be used in
reducers, listeners and other friendly plugins.

Since kea actions are [compatible with Redux](https://redux.js.org/basics/actions), calling
`addCounter(1000)` actually creates and dispatchs an object that also has a `type` key and looks 
something like this:

```javascript
addToCounter(1000) === { type: 'add to counter', payload: { amount: 1000 } }
```

There's one shorthand that can be useful. In case your actions take no arguments, just pass `true`
(or anything that's not a function) instead of an arguments-to-payload serializer:

```jsx
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }),
        addOneThousand: true,
        loadUsers: true,
        takeOutGarbage: false
    })
})
```

The `payload` will then be `{ value: true }`... but you'll just ignore it anyway, won't you? 🤔


## Reducers

Reducers store your data and change it in response to actions. 
They are based on the [reducer](https://redux.js.org/basics/reducers) concept from Redux.

Here's an example of a funky counter:

```javascript
const logic = kea({
    actions: () => ({
        increment: (amount) => ({ amount }),
        setCounter: (counter) => ({ counter }),
        reset: true
    }),
    reducers: () => ({
        counter: [0, { 
            increment: (state, { amount }) => state + amount,
            setCounter: (_, { counter }) => counter,
            reset: () => 0
        }]
    })
})
```

In this example we create three actions: `increment`, `setCounter` and `reset`. We also create a 
reducer `counter`, which reacts to these three actions in a predictable way.

Please note that the *only way* to change the counter is through actions. You can't just
run in there and call `reducers.counter += 1` somewhere. You **must** always go through an action.

While this may *feel* limiting at first, there is method to madness here. Pushing all state changes
through actions makes for stable and predictable apps that run better, crash less often and
even do your laundry. We all want that, don't we?

Casual readers of other [easy](https://easy-peasy.now.sh/) state management libraries might
protest that you need to write the name of the action twice to get the job done. *Think of the extra
keystrokes* I hear them say.

There's method to this madness as well. 

TODO: continue writing here...

...

Back in React-land, you fetch the `counter` with `useValues` like so:

```jsx
function SuperCounter () {
    const { increment } = useActions(logic)
    const { counter } = useValues(logic)

    return (
        <div>
            Counter: {counter}<br/>
            <button onClick={() => increment(100)}>Add 100 😕</button>
            <button onClick={() => increment(999)}>Add 999 🤩</button>
        </div>
    )
}
```



- reducers change state in response to actions
- they are not just to have 1:1 relationship a'la `stuff` & `setStuff`
- reducers can react to many differet actions and set stuff accordingly, `isLoading` example
- defaults for reducers are either inline `[default, {reducer}]` or in `defaults: {}`

## Listeners
- this is where side-effects happen
- listeners wait for an event to be dispatched and do what needs to happen after
- it's an anti-pattern to just use a listener and only call `setThis` actions

## Selectors
- are basically computed properties
- every reducer gets a selector automatically

## Values
- shorthand for calling selectors on the current store state
- used in listeners

