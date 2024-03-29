---
sidebar_position: 1
---
# actions

## Everything starts with an action

The first thing you do in a logic is to define some actions:

```javascript
import { kea, actions } from 'kea'

const logic = kea([
  actions({
    addToCounter: (amount) => ({ amount }),
    keyPressed: (keyCode) => ({ keyCode }),
    setName: (name) => ({ name }),
    submitForm: (values, page) => ({ values, page }),
  }),
])
```

Actions are the entry points to **all operations** in your logic.
Every state manipulation, every side effect, every network request and every response starts with an action.

Yet despite all this power, actions themselves do practically nothing. They just _signal intent_.
Everything else happens as a _reaction_ to an action.

A helpful mental model to understand actions is the one
of [events](<https://en.wikipedia.org/wiki/Event_(computing)>) in computer programming.

For example, every key press on your keyboard dispatches a `keyPress` event with a `keyCode`. It's then up to
your operating system to listen to them and convert them to the 1970's steampunk sci-fi
novel you hope to finish one day.

## Payload converters

Actions themselves are simple and [pure functions](https://en.wikipedia.org/wiki/Pure_function). The _only
thing_ they are allowed to do is to convert their arguments into a `payload` object. See here:

```jsx
import { kea, actions } from 'kea'

const logic = kea([
  actions({
    // take in `amount`, give back `{ amount }`
    addToCounter: (amount) => ({ amount }),
  }),
])
```

## Using in React

To call `addToCounter` in a React component you use the `useActions` hook:

```jsx
import React from 'react'
import { kea, actions, useActions } from 'kea'

const logic = kea([]) // code from above

function BigButton() {
  const { addToCounter } = useActions(logic)

  return <button onClick={() => addToCounter(1000)}>Add one thousand! 🤩</button>
}
```

In the code above, clicking the button calls `addToCounter` with one argument, `1000`.

The action then converts it to a `payload` of `{ amount: 1000 }`, which will later be used in
reducers, listeners and other curious places.

## Action creators and types

Since kea's actions are [compatible with Redux](https://redux.js.org/basics/actions), calling
`addCounter(1000)` actually creates and dispatchs an object that also has a `type` key and looks
something like this:

```javascript
addToCounter(1000) === dispatch({ type: 'add to counter', payload: { amount: 1000 } })
```

Calling `logic.actions.addToCounter(1000)` dispatches the action directly. If you only want to _create_
the action object without dispatching it, use `logic.actionCreators.addToCounter(1000)`

To get the Redux type of an action, use `logic.actionTypes.addToCounter`

## Shorthand when no parameters

In case your actions take no arguments (e.g. `loadUsers`), just pass `true`.

```jsx
import { kea, actions } from 'kea'

const logic = kea([
  actions({
    addToCounter: (amount) => ({ amount }),
    addOneThousand: true,
    loadUsers: true,
    takeOutGarbage: true,
  }),
])
```

The `payload` then will be `{ value: true }`... but you'll just ignore it anyway, won't you? 🤔

## Always return a payload object

One more thing. It's **strongly** recommended to _always_ return an object
as a payload from your actions:

```tsx
import { kea, actions } from 'kea'

const logic = kea([
  actions({
    addToCounter: (amount: number) => ({ amount }), // ❤️ DO this!
    badBadAddToCounter: (amount: number) => amount, // 💔 DO NOT do this!
  }),
])
```

While it may not feel like such a big deal, knowing that the payload is _always_ an object
will save you a lot of worry later on. This is experience talking here. 😉

:::note
In truth, you don't really _have to_ convert the action arguments into objects for the payload.
However I've found that it really helps if every payload _is_ an object. Otherwise you'll
have about 50% of your payloads be objects like `{ id, name }` and the other 50% just scalars `id`.

It'll be especially confusing, if you have one reducer (e.g. `todos`) and for some actions (`removeTodo`)
the payload is just `id`, but for others (`editTodo`) it's `{ id, todo }`. I've found that keeping to a
convention where payloads are _always_ objects [removes one thing you need to think about](https://medium.com/marius-andra-blog/two-strategies-for-writing-better-code-1be0dc240698)
and makes for cleaner code. Repeating _"Was it an object or was it a just an id? I'd better check to make sure I don't
make a mistake here."_ many times a day can get tiring.

In addition to this, what starts out as an action with just one argument (`removeTodo: id => id`)
will sometimes get a few optional arguments (`removeTodo: (id, undo = false) => ({ id, undo })`).
Having to then refactor every reducer/listener to use `id = payload.id` instead of `id = payload` is
not going to be fun. Just stick to having all payloads as objects.  
:::
