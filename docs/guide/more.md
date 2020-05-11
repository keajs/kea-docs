---
id: more
title: Additional Concepts
sidebar_label: Additional Concepts
---

:::note
This page builds upon the [Core Concepts](/docs/guide/concepts). Read that first if you haven't yet.

The concepts discussed below are all worth knowing, yet some might be more immediately useful
than others. Have a look and then come back when you need them.
::: 

## Props

When you use `logic()` as a function and pass it an object as an argument, that object will be saved 
as `props`:

```javascript
const props = { id: 10 }
const logic = kea({ ... })
logic(props).props === props
```

Calling `logic(props)` is a fast operation. Only the `props` on the logic will be updated in case the 
logic is already mounted. Thus it's safe to call from a React component.

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


## Breakpoints

Listeners have a powerful trick up their sleeve: `breakpoint`s!

You use them to handle two very common scenarios:

1. **Debouncing.** Suppose we have a textfield for a `username` and you want to fetch the
   github repositories for whatever is typed in there. If the user types `"keajs"`, you will
   actually make five requests (`"k"`, `"ke"`, ...), while only the last one (`"keajs"`) matters.
   It's smarter to wait a few hundred milliseconds before making a request in case the user enters
   another character.

2. **Out-of-order network requests.** In the example above, suppose we intend to search for `"keajs"`.
   We type `"ke"` and pause for a moment. A network request gets sent to fetch the repositories for
   the user `"ke"`. We then complete the string into `"keajs"` and make another request.
   What happens if the first request for `"ke"` is slow and comes back after the request for
   `"keajs"` has already finished? Without tracking this explicitly, we might incorrectly override
   the list of repositories and show whatever network request finished last, no matter what
   username is in the searchfield. 

Breakpoints solve both of those scenarios. They are passed as the second argument to listeners,
after the `payload`. 

```javascript
kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            // do something
        }
    })
})       
```

If you call `await breakpoint(delay)`, the code will pause for `delay` milliseconds before
resuming. In case the action you're listening to gets dispatched again during this delay,
the listener for the old action will terminate. The new one will keep running. 

In case the logic unmounts during this delay, the listener will just terminate.

```javascript
kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            // pause for 100ms and break if `setUsername` 
            // was called again during this time
            await breakpoint(100)
            
            // do something
        }
    })
})       
```

If you call `breakpoint()` without any arguments (and without `await`), there will be no pause.
It'll just check if the listener was called again or the logic was unmounted and terminate if that's 
the case. You can use this version of `breakpoint()` after long running calls and network requests 
to avoid those "out of order" errors.

Here's an example that uses both types of breakpoints:

```javascript
const API_URL = 'https://api.github.com'

kea({
    // ... actions, reducers omitted 

    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            const { setRepositories, setFetchError } = actions
            
            await breakpoint(100) // debounce for 100ms
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            const response = await window.fetch(url)
            
            // break if `setUsername` was called again while we were fetching or if
            // the logic was unmounted, e.g. by the user moving to a different page
            breakpoint() 
            
            const json = await response.json()
            
            if (response.status === 200) {
                setRepositories(json)
            } else {
                setFetchError(json.message)
            }
        }
    })
})
```

Under the hood breakpoints just `throw` exceptions.

In case you must call a breakpoint from within a `try / catch` block, use the `isBreakpoint`
function to check if the caught exception was from a breakpoint or not:

```javascript
import { kea, isBreakpoint } from 'kea'

kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            try {
                const response = await api.getResults(username)
                breakpoint()
                actions.setRepositories(response)
            } catch (error) {
                if (isBreakpoint(error)) {
                    throw error // pass it along
                }
                actions.setFetchError(json.message)
            }
        }
    })
})
```

## Events

You can hook into the mount and unmount lifecycle of a logic with `events`:

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


## Explicit connections

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


<br />

:::note Next steps
* Read [Using with React](/docs/guide/react) to learn about all the ways you can use Kea with React. 
* Read the [Advanced Topics](/docs/guide/advanced) page for even more things Kea can do.
:::