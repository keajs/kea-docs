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

Casual readers of other lightweight state management libraries might
protest that you need to write the name of the action (`increment`) twice to get the job done:
once in `actions` and once in `reducers`. _Think of the extra keystrokes_ I hear them say.

There's method to this madness as well. First, you should always optimise for [read-time convenience
over write-time convenience](https://medium.com/marius-andra-blog/two-strategies-for-writing-better-code-1be0dc240698).
Second, being explicit with the relationships between actions and reducers makes for very composable
code. This is best illustrated with an example.

Suppose we extend this logic and also store a `name`. We still want the page to have a global `reset`
button that clears both pieces of data. The code would look like this:

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

This example is contrived of course, but should illustrate the point about composability.
You can have any reducer depend on any action, even ones [defined in other logic files](/docs/meta/connect).

Most of the time you want your actions and reducers to mix together freely, like they're attending
a music festival in a ~~pre~~post-pandemic world.

If, however, you find yourself constantly writing code that has actions such as `setName`, `setPrice`,
`setLoading` and `setError` with corresponding reducers `name`, `price`, `loading` and `error`
and a 1:1 mapping between them, you're probably following an anti-pattern and doing something wrong.

You'll see a more complete example to illustrate this point in the doc about [listeners](/docs/core/listeners).

## Pure functions

One last thing, just like actions, reducers as well are [pure functions](https://en.wikipedia.org/wiki/Pure_function).
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
performance in React. If you really do want to write mutable code,
feel free to wrap your reducers with [immer](https://github.com/immerjs/immer).

## No side effects

The other thing you can't do in a reducer is to dispatch an action as a response to another action
or to call an API endpoint. For this you use [listeners](/docs/core/listeners).

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
