---
id: quickstart
title: Quickstart
sidebar_label: Quickstart
---

:::note

This document gives a **very brief** overview of how Kea works. 
Please read [Core Concepts](/docs/concepts) to go in depth.
That page describes not only *what* you can do in Kea, but also *why*. It's required
reading if you are starting to use Kea in an actual app.

There's nothing below that's not covered in [Core Concepts](/docs/concepts), so feel free 
to skip this and go straight for the juicy bits.
:::


## Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

## Actions

Every operation in Kea start with an action:

```javascript
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }),
        setName: (name) => ({ name }),
        submitForm: (values, page) => ({ values, page }),
        actionWithoutArguments: true        
    })
})
```

Think of actions as events that are dispatched onto a queue. On their own they do nothing.
Reducer and listeners (explained below) wait for actions and react accordingly.

Actions are functions that take whatever arguments you choose and return a `payload`. 
This payload should always be an object: `(amount) => ({ amount })`.

You call actions in React through the `useActions` hook:

```jsx
import { useActions } from 'kea'

function BigButton () {
    const { addToCounter } = useActions(logic)

    return (
        <button onClick={() => addToCounter(1000)}>
            Add one thousand! 🤩
        </button>
    )
}
```

## Reducers

Reducers store state and modify it in response to actions:

```javascript
const logic = kea({
    actions: () => ({
        increment: (amount) => ({ amount }),
        decrement: (amount) => ({ amount })
    }),
    reducers: () => ({
        counter: [0, { 
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount,
        }]
    })
})
```

In a reducer you describe what actions modify its state along with functions that describe
the updates. Those functions get as arguments the current `state` of the reducer 
and the `payload` of the action.

Inside a reducer you must never mutate values. When dealing with complex objects, 
always create and return a new object that incorporates the required changes.

```javascript
const addTodo = (state, todo) => [...state, todo] // ❤️❤️❤️ Always do this!
const addTodo = (state, todo) => state.push(todo) // ☠️☠️☠️ NEVER do this!
```

You are also not allowed to make API calls or dispatch actions inside a reducer.

To access the stored values in React, use the `useValues` hook:

```jsx
import { useValues } from 'kea'

function Counter() {
    const { counter } = useValues(logic)

    return <div>Current counter: {counter}</div>
}
```

## Listeners

All API calls and other side effects must happen inside `listeners`.

```javascript
const logic = kea({
    actions: () => ({
        loadUsers: true,
        setUsers: users => ({ users })
    }),

    listeners: () => ({
        loadUsers: async () => {
            const users = await api.get('users')
            actions.setUsers(users)
        } 
    }),

    reducers: () => ({
        users: [[], {
            setUsers: (_, { users }) => users
        }]  
    })
})
```

## Selectors

Selectors combine reducers and other selectors into new precalculated values.

```javascript
const logic = kea({
    actions: () => ({
        setMonth: (month) => ({ month }),
        setRecords: (records) => ({ records })
    }),
    reducers: () => ({
        month: ['2020-04', {
            setMonth: (_, { month }) => month
        }],
        records: [[], {
            setRecords: (_, { records }) => records
        }]  
    }),
    selectors: ({ selectors }) => ({
        recordsForSelectedMonth: [
            () => [selectors.month, selectors.records],
            (month, records) => {
                return records.filter(r => r.month === month)
            }
        ]
    })
})
```

Selectors are recalculated only when their input changes. Use them to memoize complex
operations.

Each reducer automatically has a selector made for it.

Selectors are functions that take the redux store's current state as an argument and return
whatever value you're looking for:
 
```javascript
logic.selectors.month(store.getState()) == '2020-04'
```  

## Values

Values are a shorthand to access the current state of selectors. They're useful in listeners:

```javascript
const logic = kea({
    // actions, reducers, ...

    listeners: ({ actions, values }) => ({
        fetchDetails: async () => {
            const { username } = values // get the username
            const details = await api.fetchDetails({ username })
            actions.setDetails(details)
        }
    })
})
```

Use `useValues` to access values in React.

```jsx
import { useValues } from 'kea'

function Counter() {
    const { counter } = useValues(logic)

    return <div>Current counter: {counter}</div>
}
```

## Next Steps

We strongly recommend you read [Core Concepts](/docs/concepts) next to get a better
understanding of why everything works how it does.
