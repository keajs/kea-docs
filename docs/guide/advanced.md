---
id: advanced
title: Advanced Concepts
sidebar_label: Advanced Concepts
---

Here are some more things you can do with Kea. Learn these to fully master the framework!

## Lifecycles

Kea's `logic` has three different states: 

1. **Initialized**. When your JavaScript interpreter encounters a `const logic = kea(input)` call, not
   much happens. It just stores the `input` variable on the logic and goes on. No processing takes place.
2. **Built**. When a logic is needed, it must first be built. This means converting
   an `input` such as `{ actions: () => ({ ... }) }` into actual functions on `logic.actions`
   that can be called. Same for all the `reducers`, `selectors`, etc.
3. **Mounted**. Once a logic is built, it can be mounted. This means attaching the `reducers` to
   Redux, registering all the `listeners`, etc.  

If you use Kea outside of React, you have to mount and unmount your `logic` manually. 
[See here](/docs/guide/standalone) for instructions on how to do so. 

If you use Kea [with React](/docs/guide/react), every time you render a component that access a `logic`
via `useValues`, `useActions` or some other method, the logic is built and mounted automatically. When all components 
that use a `logic` are removed from React's tree, that `logic` will be unmounted automatically.

Only `logic` which is actively in use will be mounted and attached to Redux.

## Events

You can hook into the mount and unmount lifecycle with `events`:

```javascript
const logic = kea({
    events: ({ actions, values }) => ({
        beforeMount: () => {
            // run before the logic is mounted
        },
        afterMount: () => {
            // run after the logic is mounted
        },
        beforeUnmount: () => {
            // run before the logic is unmounted
        },
        afterUnmount: () => {
            // run after the logic is unmounted
        }
    })
})
```

The useful events are `afterMount` and `beforeUnmount`, as when they are called
you have access to all the `actions`, `values`, etc of the logic.

All events accept either a function or an array of functions:

```javascript
const usersLogic = kea({
    events: ({ actions, values }) => ({
        afterMount: [
            actions.fetchUsers,
            () => actions.fetchDetails(values.user.id)
        ],
        
        // these four lines do the same:
        beforeUnmount: actions.cleanup, 
        beforeUnmount: [actions.cleanup],
        beforeUnmount: () => actions.cleanup(),
        beforeUnmount: [() => actions.cleanup()],
    })
})
```

## Props

When you use `logic()` as a function, you ask to explicitly build it. 
If you pass it an object as an argument, that object will be saved as `props` on the built logic.:

```javascript
const props = { id: 10 }
const logic = kea({ ... })
logic(props).props === props
```

Calling `logic()` is a fast operation: if the logic has already been built, it won't be rebuilt.
Only the props will be updated.

You can pass random data from React onto the logic this way. For example various defaults. 

It's as simple as this: 

```jsx
function FancyPantsCounter() {
    // without props
    const { counter } = useValues(counterLogic)
    // with props
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

## Props in Selectors

Since `selectors` need to be recalculated when their inputs change, there's a twist when 
using `props` with them.

Take the following buggy code:
 
```javascript
const counterLogic = kea({
    // ...
    selectors: ({ selectors, props }) => ({
        diffFromDefault: [
            () => [selectors.counter],
            (counter) => counter - props.defaultCounter // DO NOT do this!
        ]
    })
})
``` 

The code will work, but only partially.
The problem is that the value of `diffFromDefault` will only be updated when `counter` changes,
but not when `props.defaultCounter` changes.

What if we would also like to update the selector when the props change? 
 
Previously [we defined](/docs/guide/concepts#selectors) a selector as a function like this:

```javascript
const selector = (state) => state.path.to.something.counter
```

That's an incomplete definition. All selectors have a second argument called `props`.

```javascript
const selector = (state, props) => state.path.to.something.counter + props.defaultCounter
```

To make your new selector update itself when props change, use an inline
selector that picks the right value from `props`:

```javascript
const counterLogic = kea({
    // ...
    selectors: ({ selectors }) => ({
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

If you render `<User id={2} />`, it'll however get its own independent copy of this same base logic
and do what is needed to load and display the second user. 


## Defaults

There are two ways to pass defaults to reducers. We've been using this style until now:

```javascript
const logic = kea({
    // ... actions: () => ({ increment, decrement })

    reducers: () => ({
        counter: [0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }),
})
```

If you choose, you can set your defaults explicitly in a `defaults` object:

```javascript
const logic = kea({
    // ... actions: () => ({ increment, decrement })
  
    defaults: {
        counter: 0
    },

    reducers: () => ({
        counter: {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }
    })
})
```

In case you pass both, the value in the `defaults` object will take precedence.

You can also pass selectors as defaults:

```javascript
const counterLogic = kea({ ... })

const logic = kea({
    defaults: () => ({ // must be a function to evaluate at build time
        counterCopy: counterLogic.selectors.counter
    }),

    reducers: () => ({
        counterCopy: [counterLogic.selectors.counter, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    })
})
```

You can take it one level deeper and return a selector that computes the defaults:

```javascript
const logic = kea({
    defaults: () => (state, props) => ({
        // simple value
        simpleDefault: 0,
        // returning a selector
        directName: someLogic.selectors.storedName
        // returning a value through a selector
        connectedName: someLogic.selectors.storedObject(state, props).name,
    })
})
```

## Connecting logic together

Kea is said to be a *really scalable* state management library. This power comes partially from its 
ability to link together actions and values from different `logic`.

### Automatic connections

:::note
Automatic connections are implemented in Kea versions 2.0 and later. Explicit connections (described
below) work in all versions of Kea.
:::

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

Just use the `loadUsersSuccess` action from `usersLogic` as a key in the `listeners` object:

```javascript
const usersLogic = kea({ ... }) // same as above
 
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

:::note
In the example above we had two options:
 
1. The `dashboardLogic` could listen to the `usersLogic.actions.loadUsersSuccess` action and then call 
   its own `refreshDashboard()` action.
2. The `usersLogic` could listen to its own `loadUsersSuccess` action and then call 
   `dashboard.actions.refreshDashboard()`.

We went for the first option. Why?

It really depends on the use case. Here I'm assuming that `usersLogic` is some global logic that
stores info on all available users and is accessed by many lower level logics throughout your app,
including `dashboardLogic`. 

In this scenario, `usersLogic` can exist independently, yet `dashboardLogic` can only exist together
with `usersLogic`. Linking them the other way (having `usersLogic` call `dashboardLogic`'s action) 
would mean that the `usersLogic` is *always* mounted together with `dashboardLogic`, even for instance 
when we are not on the dashboard scene. That's probably not what we want.
:::

This `[otherLogic.actions.doSomething]` syntax also works in reducers:

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

... and everywhere else you might expect.

What if when refreshing the dashboard we need to do something with the list of users? 

Just get the value directly from `usersLogic.values`:

```javascript
const dashboardLogic = kea({
    // ...
    listeners: () => ({
        refreshDashboard: async () => {
            if (!usersLogic.values.users) {
                usersLogic.actions.loadUsers()
            }
            // pull data from the API, update values shown on the dashboard 
        }
    })
})
```

In all of these cases, `usersLogic` will be automatically connected to the logic that called it
and mounted/unmounted as needed.

### Explicit connections

While the automatic connections might seem self-evident, there's actually a lot that's
happening under the hood. 

Kea's logic is always *lazy*, meaning it's not built nor mounted before it's needed. In the examples
above, if the first time `usersLogic` is referenced is when its `actions` are used as keys in 
`dashboardLogic`'s `reducers`, it will get built and mounted then and there.
 
This wasn't always the case. Before version 2.0 there was no guarantee that `usersLogic` was already
mounted and that `usersLogic.actions` would be available for use. You had to track this manually.

You could either explicitly mount `usersLogic` in your component or you could use `connect` to
pull in actions and values from other logic. You can still do this in Kea 2.0 and it has its uses.
 
The syntax is as follows:

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
        values: [counterLogic, ['counter']]
    },

    // using the actions in a reducer like they're our own
    reducers: () => ({
        doubleCounter: [0, {
            increment: (state, { amount }) => state + amount * 2,
            decrement: (state, { amount }) => state - amount * 2
        }]
    }),
    
    // pretend that we own the selector as well 
    selectors: ({ selectors }) => ({
        tripleCounter: [
            () => [selectors.counter],
            (counter) => counter * 3
        ]
    })
})
```

## Extending logic

Up until a logic has been built and mounted, you can extend it:

```javascript
const logic = kea({
    actions: () => ({
        increment: (amount = 1) => ({ amount }),
        decrement: (amount = 1) => ({ amount })
    }),
    
    reducers: () => ({
        counter: [0, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }),
})

logic.extend({
    reducers: () => ({
        negativeCounter: [0, {
            increment: (state, { amount }) => state - amount,
            decrement: (state, { amount }) => state + amount
        }]
    }),
})

// later in React
const { counter, negativeCounter } = useValues(logic)
```

Extending logic is especially powerful when [writing plugins](/docs/guide/writing-plugins). For 
example to dynamically add actions, reducers or listeners to a logic, based on some key.

