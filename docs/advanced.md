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
    defaults: () => ({ // must be a function to evaluate lazily
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

Extending logic is especially powerful when writing plugins. For example to dynamically
add actions, reducers or listeners to a logic.


## Breakpoints in listeners

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
It'll just check if the listener was called again and terminate if that's the case. You should
use this version of `breakpoint()` after long running calls and network requests in order to 
avoid those "out of order" errors.

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
            
            breakpoint() // break if `setUsername` was called while we were fetching
            
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


## Events

TODO

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

TODO

## Mixing with Redux

TODO