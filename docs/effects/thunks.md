---
id: thunks
title: Thunks
sidebar_label: Thunks
---

# Thunks

Thunks are simple ways to define side effects with Redux.

## Installation

First install the [`kea-thunk`](https://github.com/keajs/kea-thunk) and [`redux-thunk`](https://github.com/gaearon/redux-thunk) packages:

```shell
# if you're using yarn
yarn add kea-thunk redux-thunk

# if you're using npm
npm install --save kea-thunk redux-thunk
```

Then you have install the plugin:

```javascript
import thunkPlugin from 'kea-thunk'
import { resetContext } from 'kea'

resetContext({
    createStore: true,
    plugins: [thunkPlugin],
})
```

## Usage

You define thunks in a block called `thunks`. Here are some examples:

```javascript
const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const logic = kea({
    actions: ({ constants }) => ({
        updateName: (name) => ({ name }),
    }),

    thunks: ({ actions, dispatch, getState }) => ({
        updateNameAsync: async (name) => {
            await delay(1000) // standard promise
            await actions.anotherThunk() // another thunk action
            actions.updateName(name) // not a thunk, so no async needed
            dispatch({ type: 'RANDOM_REDUX_ACTION' }) // random redux action

            console.log(values.name) // 'chirpy'
            console.log(values.otherKey) // undefined
        },
        anotherThunk: async () => {
            // do something
        },
    }),

    reducers: ({ actions, constants }) => ({
        name: [
            'chirpy',
            {
                [actions.updateName]: (state, payload) => payload.name,
            },
        ],
    }),
})
```

As you can see, you have access to the standard Redux `dispatch` and `getState` methods. However you don't need to call `dispatch` before any action in the actions object. They are wrapped automatically.
