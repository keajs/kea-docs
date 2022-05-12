---
sidebar_position: 2
---
# reducers

## Reducers store values

Reducers store your data and change it in response to actions.
They are based on the [reducer](https://redux.js.org/basics/reducers) concept from Redux.

Here's an example of a basic counter:

```javascript
import { kea, reducers } from 'kea'

const logic = kea([
  actions({
    increment: (amount) => ({ amount }),
    setCounter: (counter) => ({ counter }),
    reset: true,
  }),
  reducers({
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        setCounter: (_, { counter }) => counter,
        reset: () => 0,
      },
    ],
  }),
])
```

When defining reducers in kea you write [pure functions](https://en.wikipedia.org/wiki/Pure_function)
that take two arguments: the current `state` of the reducer and the `payload` of the action that was
just dispatched. You then combine the two and return a new state.

In the example above we have three actions: `increment`, `setCounter` and `reset`. We also have a
reducer called `counter` that will update its value in response to those actions.
It will be `0` by default.

## No direct access

Please note that the _only way_ to change the value of `counter` is by dispatching actions and reacting
to them. You can't just jump in there and call `reducers.counter += 1` somewhere. All data manipulation
_must_ always go through an action.

While this may _feel_ limiting at first, there is method to madness here. Pushing all state changes
through actions makes for stable and predictable apps that run better, crash less often and
even do your laundry. We all want that, don't we?

Being explicit with the relationships between actions and reducers makes for very composable code. 

Suppose our logic also stores a `name`. Can we make the `reset` action clear both pieces of data? Naturally:

```javascript
import { kea, actions, reducers } from 'kea'

const logic = kea([
  actions({
    setName: (name) => ({ name }),
    increment: (amount) => ({ amount }),
    setCounter: (counter) => ({ counter }),
    reset: true,
  }),
  reducers({
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        setCounter: (_, { counter }) => counter,
        reset: () => 0,
      },
    ],
    name: [
      '',
      {
        setName: (_, { name }) => name,
        reset: () => '',
      },
    ],
  }),
])
```

It's starting to look like a neatly defined state graph of sorts... :thinking_face:

You can have any reducer depend on any action, even ones [defined in other logic files](/docs/meta/connect).

:::note Anti-pattern warning
Kea's actions and reducers are intended to mix together freely within a logic.

If you find yourself constantly writing code that has actions such as `setName`, `setPrice`,
`setLoading` and `setError` with corresponding reducers `name`, `price`, `loading` and `error`
and a singular 1:1 mapping between them, you're probably following an anti-pattern and doing something wrong.

You'll see an example of this anti-pattern in the section about [listeners](/docs/core/listeners#tracking-loading).
:::

## Pure functions

Just like actions, reducers are also [pure functions](https://en.wikipedia.org/wiki/Pure_function).
That means no matter how many times you call a reducer with the same input (same `state` and `payload`),
it should always give the same output.

More importantly, **reducers must never modify their inputs**. In practice this means that
instead of adding an element to an array via `state.push(newThing)`, you instead create and return a new
array that contains this new element with `[...state, newThing]`.

For example, here's todo list that stores strings in an array:

```javascript
import { kea, actions, reducers } from 'kea'

const todosLogic = kea([
  actions({
    addTodo: (todo) => ({ todo }),
    removeTodo: (index) => ({ index }),
    updateTodo: (index, todo) => ({ index, todo }),
  }),
  reducers({
    // defaults to [], an empty array
    todos: [
      [],
      {
        addTodo: (state, { todo }) => {
          // make a new array and add `todo` at the end
          return [...state, todo]
        },
        removeTodo: (state, { index }) => {
          // filter out the `todo` at the given `index`
          return state.filter((todo, i) => i !== index)
        },
        updateTodo: (state, { index, todo }) => {
          // swap out the `todo` in the array at the given `index`
          return state.map((t, i) => (i === index ? todo : t))
        },
      },
    ],
  }),
])
```

This may seem weird and slow at first, but writing _immutable_ code like this greatly improves
performance in React, by making it obvious what has changed and what hasn't. 
If you really do want to write mutable code, feel free to wrap your reducers with [immer](https://github.com/immerjs/immer).

## No side effects

In a reducer you can not dispatch actions, nor run any asynchronous code. For this you use [listeners](/docs/core/listeners).

## Using in React

To use the values stored in reducers in React, use the `useValues` hook:

```jsx
import React from 'react'
import { useValues } from 'kea'

function Todos() {
  const { todos } = useValues(todosLogic)

  return (
    <ul>
      {todos.map((todo) => (
        <li>{todo}</li>
      ))}
    </ul>
  )
}
```
