---
id: concepts
title: The Concepts of Kea
sidebar_label: Concepts
---

**WIP!** This doc aims to go in more detail what are the different parts of kea
and how to they all fit together.

Would be cool to add some images that better illustrate all these concepts.

# Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`? 

Well, we had to call it something and everything else was already taken 😅. 

More seriously, this name implies that what `kea()` returns is a complex object, 
which contains a piece of your state along with logic to manipulate it.  

It's a useful convention and we suggest sticking to it. Feel free to call your logic with
names that make sense, such as `accountLogic`, `dashboardLogic`, etc.


# Actions

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

Actions themselves are just plain functions. The one legit responsibility that they actually have is to convert their arguments into a `payload`
object. See here:

```jsx
const logic = kea({
    actions: () => ({
        // take in `amount`, give back `{ amount }`
        addToCounter: (amount) => ({ amount }),
    })
})
```

Eventually you want to call `addToCounter` in your React component:

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

As you can see, you call `addToCounter` with one argument, `1000`. 

The action then converts it to a `payload` of `{ amount: 1000 }`.

Since kea actions are [compatible with Redux](https://redux.js.org/basics/actions), calling
`addCounter(1000)` actually creates and dispatchs an object that also has the `type` key and looks 
something like this:

```javascript
addToCounter(1000) === { type: 'add to counter', payload: { amount: 1000 } }
```

There's one shorthand that can be useful. In case your actions take no arguments, just pass `true`
(or anything that's not a function) instead of a function that creates the payload from the arguments:

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


# Reducers
- reducers change state in response to actions
- they are not just to have 1:1 relationship a'la `stuff` & `setStuff`
- reducers can react to many differet actions and set stuff accordingly, `isLoading` example
- defaults for reducers are either inline `[default, {reducer}]` or in `defaults: {}`

# Listeners
- this is where side-effects happen
- listeners wait for an event to be dispatched and do what needs to happen after
- it's an anti-pattern to just use a listener and only call `setThis` actions

# Selectors
- are basically computed properties
- every reducer gets a selector automatically

# Values
- shorthand for calling selectors on the current store state
- used in listeners

