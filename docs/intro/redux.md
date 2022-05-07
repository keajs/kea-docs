---
sidebar_position: 7
---

# Redux Compatibility

Kea uses `redux` and `reselect` under the hood, and it's very easy to connect it to an existing Redux application.

## Accessing the Redux store

In [`listeners`](/docs/core/listeners) or elsewhere, use `getContext` to get Redux's `store` object:

```javascript
import { kea, listeners, getContext } from 'kea'

const railsContext = (state) => state.railsContext // selector

const logic = kea([
  listeners({
    someAction: () => {
      // get the store
      const { store } = getContext()
      // use a selector to get a state
      const { i18nLocale } = railsContext(store.getState())
      // dispatch an action in return
      store.dispatch({ type: 'REDUX_ACTION' })
    },
  }),
])
```

## Using Redux actions in reducers and listeners

You can use regular Redux actions in reducers and listeners. Just use their `type` as a key:

```javascript
import { kea, actions, reducers, listeners } from 'kea'

import { LOCATION_CHANGE } from 'connected-react-router'

const logic = kea([
  actions({
    doit: true,
  }),

  reducers(({ actionTypes }) => ({
    myValue: [
      false,
      {
        REDUX_ACTION: () => false, // use redux's action type
        [LOCATION_CHANGE]: () => false, // use a type through a variable
        doit: () => true, // local action
        [actionTypes.doit]: () => true, // local action through a redux type
      },
    ],
  })),

  listeners({
    REDUX_ACTION: (payload) => {
      // when the action with the type "REDUX_ACTION" is dispatched
    },
    [LOCATION_CHANGE]: (payload) => {
      // when the location change action is dispatched
    },
  }),
])
```

## Using non-kea selectors in selectors

You can use regular selectors in your [`selectors`](/docs/core/selectors) builders:

```javascript
const localeSelector = (state) => state.railsContext.i18nLocale

const logic = kea([
  selectors({
    someValue: [
      (selectors) => [localeSelector, selectors.name, () => '!'],
      (i18nLocale, name, point) => `${name} in ${i18nLocale} is "John"${point}`,
    ],
  }),
])
```

## Converting Redux actions and selectors into Kea actions and values

You may pull in data from any part of the Redux state tree with [`connect({ values })`](/docs/meta/connect#connect-values--).

Instead of passing a logic to fetch from, pass a selector:

```javascript
import { kea, connect } from 'kea'
import someLogic from './someLogic'

const logic = kea([
  connect({
    values: [
      // instead of logic like this
      someLogic,
      ['prop1', 'prop2'],

      // pass a selector
      (state) => state.rails,
      ['i18nLocale', 'currentUserId'],

      // get everything as 'myForm'
      (state) => state.form.myForm,
      ['* as myForm'],
    ],
  }),

  // then use `currentUserId` and others as they were local values
])
```

Similarly, use an object of action creators and select the ones you need:

```javascript
import { kea, connect } from 'kea'
import someLogic from './some-logic'

const actionsCreators = {
  doSomething: () => ({ type: 'DO_SOMETHING', payload: {} }),
  otherAction: ({ id }) => ({ type: 'OTHER_ACTION', payload: { id } }),
}

const logic = kea([
  connect({
    actions: [
      // instead of logic like this
      someLogic,
      ['action1', 'action2'],

      // pass an object of action creators
      actionsCreators,
      ['doSomething', 'otherAction'],
    ],
  }),

  // they will be automatically binded to dispatch
])
```

## Using Kea actions and selectors elsewhere

If the redux-only part of your app needs access to some values or actions from kea logic stores,
use `logic.actionCreators` and `logic.selectors` for interoperability. Don't forget to [`mount` the logic](/docs/meta/logic#lifecycles) first:

```javascript
const logic = kea([
  actions({ addOne: true }),
  reducers({ myNumber: [0, { addOne: (state) => state + 1 }] }),
  selectors({ myNumberDouble: [(s) => [s.myNumber], (n) => n * 2] }),
])

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

See the docs on [logic properties](/docs/meta/logic#properties) for more details.
