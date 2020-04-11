---
id: advanced
title: Advanced Concepts
sidebar_label: Advanced Concepts
---

Here are some more things you can do with Kea. Learn these to fully master the framework!

## Connecting logic together

Kea is said to be a *really scalable* state management library. This power comes from its ability
to link together actions and values from different logics.

### The new way of connecting logic (2.0+)

Wiring logic together is easier than you think. Suppose we have these two logics:

```javascript
// stores a list of users, referenced everywhere in the app
const usersLogic = kea({
    actions: () => ({
        loadUsers: true,
        loadUsersSuccess: (users) => ({ users })
    }),
    reducers: () => ({
        users: [[], {
            loadUsersSuccess: (_, { users }) => users
        }]
    })
    // ... listeners, etc
})

// handles data shown on our dashboard scene
const dashboardLogic = kea({
    actions: () => ({
        refreshDashboard: true    
    }),

    listeners: () => ({
        refreshDashboard: async () => {
            // pull data from the API, update values shown on the dashboard 
        }
    })
})
```

Our pointy-haired-boss now tasked us with reloading the dashboard every time the users are 
successfully loaded. How do we do that?

Just use the action on `usersLogic` as a key in the `listeners` object:

```javascript
const dashboardLogic = kea({
    actions: () => ({
        refreshDashboard: true    
    }),

    listeners: () => ({
        refreshDashboard: async () => {
            // pull data from the API, update values shown on the dashboard 
        },
        [usersLogic.actions.loadUsersSuccess]: ({ users }) => {
            actions.refreshDashboard()
            // we also get `users` in the payload, 
            // but we socially distance ourselves from them
        } 
    })
})
```

This syntax also works in reducers:

```javascript
const usersLogic = kea({ ... })

const shadowUsersLogic = kea({
    actions: () => ({
        reset: true
    }),
    reducers: ({ actions }) => ({
        users: [[], {
            reset: () => [], // action that's defined in this logic
            [actions.reset]: () => [], // another way to call a local action
            [usersLogic.actions.loadUsersSuccess]: (_, { users }) => users
        }]
    })
})
```

and selectors:

```javascript
const usersLogic = kea({ ... })

const sortedUsersLogic = kea({
    selectors: () => ({
        sortedUsers: [
            () => [usersLogic.selectors.users],
            (users) => [...users].sort((a, b) => a.name.localeCompare(b.name))
        ]
    })
})
```

... and probably everywhere else you might expect.

What if we need the list of users when refreshing the dashboard? 

Just get the value directly from `usersLogic.values`:

```javascript
const dashboardLogic = kea({
    // ...
    listeners: () => ({
        refreshDashboard: async () => {
            const { users } = usersLogic.values
            // do something with `users` 
        },
        [usersLogic.actions.loadUsersSuccess]: () => {
            actions.refreshDashboard()
        } 
    })
})
```

Feel free to even call `usersLogic.actions.loadUsers()` if it makes sense!

### The old way of connecting logic (1.0 and before)

While the "new way" of connecting logic might now seem self-evident, there's actually a lot that's
happening under the hood. 

Kea's logic is always "lazy", meaning it's not built nor mounted before it's needed. In the examples
above, if the first time `usersLogic` is referenced is when its actions are used as keys in another
logic's reducers, it will get built and mounted then and there.
 
This wasn't always the case. Before version 2.0 there was no guarantee that `otherLogic.actions`
would already be there. You had to either track this yourself or use `connect`.

It still works though. The syntax is as follows:

```javascript
const counterLogic = kea({
    actions: () => ({
        increment: (amount) => ({ amount }),
        decrement: (amount) => ({ amount })
    }),

    reducers: () => ({
        counter: [0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }),
})

const logic = kea({
    connect: {
        // pulling in actions from `counterLogic`
        actions: [counterLogic, ['increment', 'decrement']],
        // pull in values from `counterLogic`
        values: [counterLogic, ['counter']],
    },

    // using the actions in a reducer like they're our own
    doubleCounter: [0, {
        increment: (state, { amount }) => state + amount * 2,
        decrement: (state, { amount }) => state - amount * 2
    }],
    
    // pretend that we own the selector as well 
    selectors: ({ selectors }) => ({
        tripleCounter: [
            () => [selectors.counter],
            (counter) => counter * 3
        ]
    })
})
```

## Props

When you treat `logic` as a function and pass it an object as an argument, that object will be
saved as `props`.

```javascript
const logic = kea({ ... })
const props = { id: 10 }

logic(props).props === props
``` 

You can pass random data from React onto the logic this way. For example various defaults. 

It's as simple as this: 

```jsx
function FancyPantsCounter() {
    const { counter } = useValues(counterLogic({ defaultCounter: 1000 }))

    // ...
}
```

Then just use `props` wherever you need to. For example:

```javascript
const counterLogic = kea({
    actions: () => ({
        increment: (amount) => ({ amount }),
        decrement: (amount) => ({ amount })
    }),

    reducers: ({ props }) => ({
        counter: [props.defaultCounter || 0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }),

    listeners: ({ props }) => ({
        increment: ({ amount }) => {
            console.log(`incrementing by ${amount}`)
            console.log(`default ${props.defaultCounter || 0}`)
        }
    })
})
```

### Props in Selectors

Since `selectors` need to be recalculated when their inputs change, 
there's a twist when using `props` with them.
 
Previously we defined a selector as a function like this:

```javascript
const selector = (state) => state.path.to.something.counter
```

It's actually better than that. Selectors take a second argument called `props`.

```javascript
const selector = (state, props) => state.path.to.something.counter + props.defaultCounter
```

To make your new selector update itself when a prop changes, it's easiest to define an inline
selector that picks the right value from `props`. Here's an example:

```javascript
const counterLogic = kea({
    // ...
    selectors: ({ selectors, props }) => ({
        diffFromDefault: [
            () => [
                selectors.counter, 
                (_, props) => props.defaultCounter
            ],
            (counter, defaultCounter) => counter - defaultCounter
        ]
    })

})
```

## Keyed logic

If you give your logic a `key`, you can have multiple independent copies of it. The key is derived 
from `props`:

```javascript
const userLogic = kea({
    key: (props) => props.id, // 🔑 the key

    actions: () => ({
        loadUser: true,
        userLoaded: (user) => ({ user })
    }),
  
    reducers: () => ({
        user: [null, {
            userLoaded: (_, { user }) => user
        }]
    }),

    // more on events in a section below. 
    events: ({ actions }) => ({
        afterMount: [actions.loadUser]
    }),

    listeners: ({ props }) => ({
        loadUser: async () => {
            const user = await api.getUser({ id: props.id }),
            actions.userLoaded(user)
        }
    })
})
```

Now every time you call `userLogic({ id: 1 })` with a new `id`, a completely independent
logic will be built and mounted.

This is really handy when you have data that's passed as a props in React, such as:

```jsx
function User({ id }) {
    const { user } = useValues(userLogic({ id }))

    return user 
        ? <div>{user.name} ({user.email})</div> 
        : <div>Loading...</div>
}
```

No matter how many times `<User id={1} />` is rendered by React, it'll always be connected
to the same logic. 

If you render `<User id={2} />`, it'll however get its own independent copy of this same base logic. 



## Defaults

## Extending logic

## Breakpoints in listeners


## Events



```javascript
const usersLogic = kea({
    actions: () => ({
        fetchUsers: true,
        usersLoaded: (user) => ({ user })
    }),
  
    reducers: () => ({
        users: [null, {
            usersLoaded: (_, { user }) => user
        }]
    }),

    events: ({ actions }) => ({
        beforeMount: () => {
            // can't do much here as calling actions 
        },
        afterMount: [actions.fetchUsers]
        afterMount: [actions.fetchUsers]
        afterMount: [actions.fetchUsers]
    }),

    listeners: {}, // fetchUser makes an API call
})
```


## Mounting and Events

## Mixing with Redux
