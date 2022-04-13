## Connecting logic together

Kea is said to be a _really scalable_ state management library. This power comes partially from its
ability to link together actions and values from different `logic`.

:::note
Automatic connections are implemented in Kea versions 2.0 and later. Explicit connections (described
below) work in all versions of Kea.
:::

Wiring logic together is easier than you think. Suppose we have these two logics:

```javascript
// stores a list of users, referenced everywhere in the app
const usersLogic = kea({
  actions: {
    loadUsers: true,
    loadUsersSuccess: (users) => ({ users }),
  },
  reducers: {
    users: [
      [],
      {
        loadUsersSuccess: (_, { users }) => users,
      },
    ],
  },
  // ... listeners, etc
})

// handles data shown on our dashboard scene
const dashboardLogic = kea({
  actions: {
    refreshDashboard: true,
  },

  listeners: {
    refreshDashboard: async () => {
      // pull data from the API, update values shown on the dashboard
    },
  },
})
```

Our pointy-haired-boss now tasked us with reloading the dashboard every time the users are
successfully loaded. How do we do that?

Just use the `loadUsersSuccess` action from `usersLogic` as a key in the `listeners` object:

```javascript
const usersLogic = kea({ ... }) // same as above

const dashboardLogic = kea({
    actions: {
        refreshDashboard: true
    },

    listeners: ({ actions }) => ({
        refreshDashboard: async () => {
            // pull data from the API, update values shown on the dashboard
        },
        [usersLogic.actionTypes.loadUsersSuccess]: ({ users }) => {
            actions.refreshDashboard()
            // we also get `users` in the payload,
            // but we socially distance ourselves from them
        }
    })
})
```

:::note
In the example above we had two options:

1. The `dashboardLogic` could listen to the `usersLogic.actionTypes.loadUsersSuccess` action and then call
   its own `refreshDashboard()` action.
2. The `usersLogic` could listen to its own `loadUsersSuccess` action and then call
   `dashboard.actions.refreshDashboard()`.

We went for the first option. Why?

It really depends on the use case. Here I'm assuming that `usersLogic` is some global logic that
stores info on all available users and is accessed by many lower level logics throughout your app,
including `dashboardLogic`.

In this scenario, `usersLogic` can exist independently, yet `dashboardLogic` can only exist together
with `usersLogic`. Linking them the other way (having `usersLogic` call `dashboardLogic`'s action)
would mean that the `usersLogic` is _always_ mounted together with `dashboardLogic`, even for instance
when we are not on the dashboard scene. That's probably not what we want.
:::

This `[otherLogic.actionTypes.doSomething]` syntax also works in reducers:

```javascript
const usersLogic = kea({ ... })

const shadowUsersLogic = kea({
    actions: {
        reset: true
    },
    reducers: ({ actions }) => ({
        users: [[], {
            reset: () => [], // action that's defined in this logic
            [actions.reset]: () => [], // another way to call a local action
            [usersLogic.actionTypes.loadUsersSuccess]: (_, { users }) => users
        }]
    })
})
```

and selectors:

```javascript
const usersLogic = kea({ ... })

const sortedUsersLogic = kea({
    selectors: {
        sortedUsers: [
            () => [usersLogic.selectors.users],
            (users) => [...users].sort((a, b) => a.name.localeCompare(b.name))
        ]
    }
})
```

... and everywhere else you might expect.

What if when refreshing the dashboard we need to do something with the list of users?

Just get the value directly from `usersLogic.values`:

```javascript
const dashboardLogic = kea({
  // ...
  listeners: {
    refreshDashboard: async () => {
      if (!usersLogic.values.users) {
        usersLogic.actions.loadUsers()
      }
      // pull data from the API, update values shown on the dashboard
    },
  },
})
```

In all of these cases, `usersLogic` will be automatically connected to the logic that called it
and mounted/unmounted as needed.

### Mounting another logic together with your logic

There's one caveat here. If the first time you access a value on `usersLogic` is inside a listener,
the logic will be mounted only then. If `usersLogic` has a `afterMount` event that loads and fetches data,
it'll probably not have done its work by then.

If you want to hook two logics together, so that they are mounted at the same time, use `connect`:

```javascript
import { otherLogic } from './somewhere'

const logic = kea({
  // mounts `otherLogic` when `logic` is mounted, starts fetching data
  connect: [otherLogic],

  listeners: {
    something: () => {
      // fetched data is already there
      const stuff = otherLogic.values.fetchedData

      // without `connect: [otherLogic]` above, kea would only mount
      // `logic` and start fetching its data right now
    },
  },
})
```

This is not needed if you use `otherLogic` as a key in reducers or listeners. It's only needed if you
access elements on `otherLogic` inside a listener.

## Explicit connections

While the [automatic connections](/docs/BROKEN) might seem self-evident, there's actually a lot that's
happening under the hood.

Kea's logic is always _lazy_, meaning it's not built nor mounted before it's needed. In the examples
above, if the first time `usersLogic` is referenced is when its `actions` are used as keys in
`dashboardLogic`'s `reducers`, it will get built and mounted then and there.

This wasn't always the case. Before version 2.0 there was no guarantee that `usersLogic` was already
mounted and that `usersLogic.actions` would be available for use. You had to track this manually.

You could either explicitly mount `usersLogic` in your component or you could use `connect` to
pull in actions and values from other logic. You can still do this in Kea 2.0 and it has its uses.

The syntax is as follows:

```javascript
const counterLogic = kea({
  actions: {
    increment: (amount) => ({ amount }),
    decrement: (amount) => ({ amount }),
  },

  reducers: {
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  },
})

const logic = kea({
  connect: {
    // pulling in actions from `counterLogic`
    actions: [counterLogic, ['increment', 'decrement']],
    // pull in values from `counterLogic`
    values: [counterLogic, ['counter']],
  },

  // using the actions in a reducer like they're our own
  reducers: {
    doubleCounter: [
      0,
      {
        increment: (state, { amount }) => state + amount * 2,
        decrement: (state, { amount }) => state - amount * 2,
      },
    ],
  },

  // pretend that we own the selector as well
  selectors: {
    tripleCounter: [(selectors) => [selectors.counter], (counter) => counter * 3],
  },
})
```
