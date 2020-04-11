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

There's nothing on this page that's not covered in [Core Concepts](/docs/concepts), so feel free 
to skip this and go straight for the [juicy bits](/docs/concepts).
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
Reducers and listeners (explained below) wait for actions and react accordingly.

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

Clicking this button dispatches an action with the payload `{ amount: 1000 }`

## Reducers

Reducers hold your state and modify it in response to actions:

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

To create a reducer, you provide it with a list of actions that modify its state (the keys of the object above) and how
(the values of the same object).

Each change is described by a function that gets two arguments: the current `state` of the reducer and the `payload` of 
the action that was dispatched. 

Reducers must **never** mutate values. When dealing with complex objects, 
always create and return a new object that incorporates the required changes.

```javascript
{
  addTodo: (state, { todo }) => [...state, todo], // ❤️❤️❤️ Always do this!
  addTodo: (state, { todo }) => state.push(todo), // ☠️☠️☠️ NEVER do this!
}
```

You are also not allowed to make API calls or dispatch actions inside a reducer.

To access the data stored in reducers from React, use the `useValues` hook:

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

Listeners and reducers can and should reuse actions whenever possible. That's why actions are defined separately.
For example you can add a `isLoading` reducer that sets its state to `true` when the `loadUsers` action is dispatched
and to `false` when `setUsers` is dispatched after.

## Selectors

Selectors combine reducers and other selectors into new pre-calculated values.

Each reducer has a selector made for it automatically, which you can use as input in new selectors:

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

Get the output of a selector in React with `useValues`, just like with reducers:

```javascript
const { recordsForSelectedMonth } = useValues(logic)
```

Selectors are recalculated only when their input changes. They are perfect for memoizing complex operations.

Selectors are actually functions that take the redux store's current state as an argument and return
whatever value you're looking for:
 
```javascript
logic.selectors.month = state => state.path.to.logic.in.redux.month
logic.selectors.month(store.getState()) == '2020-04'
```  

## Values

Values are a shorthand to access the current state of selectors. 

```javascript
logic.values.month === logic.selectors.month(store.getState())
```

You mostly use them in listeners to fetch some value:

```javascript
const logic = kea({
    // actions, reducers, ...

    listeners: ({ actions, values }) => ({
        fetchDetails: async () => {
            const { username } = values // 👈 get the latest username
            const details = await api.fetchDetails({ username })
            actions.setDetails(details)
        }
    })
})
```

This is where the hook `useValues` gets its name.

```jsx
import { useValues } from 'kea'

function Counter() {
    const { counter } = useValues(logic)

    return <div>Current counter: {counter}</div>
}
```

## Next Steps

I strongly recommend you read [Core Concepts](/docs/concepts) next to get a better
understanding of why everything works how it does.
