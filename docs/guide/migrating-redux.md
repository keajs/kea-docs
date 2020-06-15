---
id: migrating-redux
title: Migrating from Redux
---

Since Kea is built on Redux, it is very easy to connect it to an existing Redux application.

## Using Redux actions

You can use regular Redux actions in reducers and listeners. Just use their `type` as a key:
    
```javascript
import { kea } from 'kea'

import { LOCATION_CHANGE } from 'connected-react-router'

const logic = kea({
    actions: {
        doit: true
    },
    
    reducers: ({ actions }) => ({
        myValue: [false, {
            'REDUX_ACTION': () => false,    // use redux's action type
            [LOCATION_CHANGE]: () => false, // use it through a variable
            doit: () => true,               // local action
            [actions.doit]: () => true      // longer way to write
        }]
    }),
    
    listeners: {
        'REDUX_ACTION': (payload) => {
            // when the location change event is triggered
        },
        [LOCATION_CHANGE]: (payload) => {
            // when the location change event is triggered
        }
    }
})
```

## Reading non-Kea state

You can use regular selectors in your `selectors` blocks:

```javascript
const logic = kea({
    selectors: {
        someValue: [
            (selectors) => [state => state.rails.i18nLocale, selectors.name],
            (i18nLocale, name) => `${name} in ${i18nLocale} is "John"`
        ]
    }
})
```

In listeners you have access to the `store` object:

```javascript
const railsContext = state => state.rails // selector

const logic = kea({
    listeners: ({ store }) => ({
        someAction: () => {
            const { i18nLocale } = railsContext(store.getState())
            store.dispatch({ type: 'REDUX_ACTION' })
        }
    })
})
```

## Converting Redux actions and selectors into Kea actions and values

You may pull in data from any part of the Redux state tree with `connect`. 
Instead of passing a logic to fetch from, pass a selector:

```javascript
import { kea } from 'kea'
import someLogic from './some-logic'

const logic = kea({
    connect: {
        values: [
            someLogic, [ // instead of logic like this
                'prop1',
                'prop2'
            ],
            (state) => state.rails, [ // pass a selector
                'i18nLocale',
                'currentUserId'
            ],
            state => state.form.myForm, [
                '* as myForm' // get everything as 'myForm'
            ]
        ]
    }

    // then use `currentUserId` and others as they were local values
})
```

Similarly, use an object of action creators and select the ones you need:

```javascript
import { kea } from 'kea'
import someLogic from './some-logic'

const actionsCreators = {
    doSomething: () => ({ type: 'DO_SOMETHING', payload: { } }),
    otherAction: ({ id }) => ({ type: 'OTHER_ACTION', payload: { id } }),
}

const logic = kea({
    connect: {
        actions: [
            someLogic, [ // instead of logic like this
                'action1',
                'action2'
            ],
            actionsCreators, [ // pass an object of action creators
                'doSomething', // and select what is needed
                'otherAction'
            ]
        ]
    }

    // they will be automatically binded to dispatch
})
```    
:::note
See the 
[Kea API docs](/docs/api/kea) for all options for connect.
:::


## Using Kea actions and selectors elsewhere

If the redux-only part of your app needs access to some values or actions from kea logic stores, 
you can import them like so:

```javascript
const logic = kea({
    actions: {
        addOne: true
    },
    reducers: {
        myNumber: [0, {
            addOne: (state) => state + 1
        }]
    },
    selectors: {
        myNumberDouble: [
            (selectors) => [selectors.myNumber],
            (myNumber) => myNumber * 2
        ]
    }
})

// The logic must be mounted before you can access its fields
// This is done automatically when a React component is using it.

// If you're using Kea outside React, call logic.mount() manually to have
// access to all the fields below.
const unmount = logic.mount()

// Dispatch an action to add something
logic.actions.addOne()

// Create an action (returns the object { type: 'add one ...', payload: {} })
// and then dispatch it
store.dispatch(logic.actionCreators.addOne())

// Selectors for querying redux (state defaults to getState())
logic.selectors.myNumber(store.getState())
logic.selectors.myNumberDouble(store.getState())

// Shorthand for selectors (implemented as getters)
logic.values.myNumber
logic.values.myNumberDouble

// call unmount when you're done
unmount()
```    

See the [logic API docs](/docs/api/logic) for more details.

<br />

:::note Next steps
* Check out how to [Write Plugins](/docs/guide/writing-plugins) for Kea.
:::