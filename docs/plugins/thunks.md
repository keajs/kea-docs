---
id: thunks
title: Thunks
sidebar_label: Thunks
---

:::note Use listeners instead
While thunks definitely work, it's recommended to use the newer [listeners](/docs/guide/concepts#listeners) plugin instead. 
Listeners support everything thunks do and more. Plus they are integrated directly into kea.
:::

Thunks are simple ways to define side effects in Kea. They use [`redux-thunk`](https://github.com/gaearon/redux-thunk)
under the hood.

## Installation

First install the [`kea-thunk`](https://github.com/keajs/kea-thunk) and [`redux-thunk`](https://github.com/gaearon/redux-thunk) packages:

```shell
# if you're using yarn
yarn add kea-thunk redux-thunk

# if you're using npm
npm install --save kea-thunk redux-thunk
```

Then install the plugin:

```javascript
import thunkPlugin from 'kea-thunk'
import { resetContext } from 'kea'

resetContext({
    plugins: [thunkPlugin]
})
```

## Usage

You define thunks in a block called `thunks`. Whatever you define there can be called through `logic.actions`, 
for example in the `useActions` hook or directly inside the logic:

Here is an example of thunks in action:

```javascript
const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const logic = kea({
    actions: () => ({
        updateName: (name) => ({ name }),
    }),

    thunks: ({ actions, dispatch, getState }) => ({
        // can be called with actions.updateNameAsync(name)
        updateNameAsync: async (name) => {
            await delay(1000) // standard promise
            await actions.anotherThunk() // another thunk action
            actions.updateName(name) // not a thunk, so no async needed
            dispatch({ type: 'RANDOM_REDUX_ACTION' }) // random redux action

            console.log(values.name) // 'chirpy'
            console.log(values.otherKey) // undefined
        },
        // can be called with actions.anotherThunk()
        anotherThunk: async () => {
            // do something
        },
    }),

    reducers: () => ({
        name: ['chirpy', {
            updateName: (state, payload) => payload.name,
        }],
    }),
})
```

As you can see, you have access to the standard Redux `dispatch` and `getState` methods. 
However you don't need to call `dispatch` before any action in the actions object. 
They are wrapped automatically.

## Note about `autoConnect`

The current thunk plugin (v1.0.0) does not support `autoConnect`. That means if you want to call `otherLogic.actions.something()`
inside a thunk, you must first make sure `otherLogic` is connected to your logic:

```javascript
import { otherLogic } from './otherLogic'

const logic = kea({
    connect: [otherLogic],

    thunks: ({ actions, dispatch, getState }) => ({
        updateNameAsync: async (name) => {
            otherLogic.actions.doSomething()
        },
    })
})
```
