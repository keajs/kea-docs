## Making sure the other logic is mounted

In Kea, you need to be explicit about when your logic is mounted. If you try accessing values on a logic that isn't
mounted, it'll throw an error.

### Automatically with React hooks

When you use the React hooks `useValues`, `useActions` or `useMountedLogic`, logic is automatically mounted for
as long as the component is rendered:

```tsx
import { useActions, useMountedLogic } from 'kea'
import { userLogic } from './userLogic'

function User() {
  // automatically mounts `userLogic`
  const { reloadUser } = useActions(userLogic)
  // also automatically mounts `userLogic`
  const { user } = useValues(userLogic)
  // and also this automatically mounts `userLogic`, but without pulling actions/value
  useMountedLogic(userLogic)

  return <div />
}
```

Sometimes you want to use `useMountedLogic` in your root component with a few key logics you want to always have running.

### Manually with `connect([])`

To specify a list of dependent logics that must be mounted with this logic, use `connect()`

```ts
import { kea, connect } from 'kea'

const userLogic = kea([])
const otherLogic = kea([
  // make sure userLogic is mounted
  connect([userLogic]),
])

otherLogic.mount() // also mounts userLogic
```

### Manually with `connect({ logic: [] })`

```ts
import { kea, connect } from 'kea'

const userLogic = kea([])
const otherLogic = kea([
  // make sure userLogic is mounted
  connect({ logic: [userLogic] }),
])

otherLogic.mount() // also mounts userLogic
```

### Manual actions with `connect({ actions: [] })`

```ts
import { kea, connect, actions } from 'kea'

const userLogic = kea([actions({ reloadUser: true, resetUser: true })])

const otherLogic = kea([
  // pull in reloadUser from userLogic
  connect({ actions: [userLogic, ['reloadUser', 'resetUser']] }),
])

otherLogic.mount() // also mounts userLogic
otherLogic.actions.reloadUser() // actually triggers userLogic.actions.reloadUser
```

### Manual values with `connect({ values: [] })`

```ts
import { kea, connect, reducers } from 'kea'

const userLogic = kea([reducers({ user: [[]], userLoading: [false] })])
const otherLogic = kea([
  // make sure userLogic is mounted
  connect({ values: [userLogic, ['user', 'userLoading']] }),
])

otherLogic.mount() // also mounts userLogic
otherLogic.values.user == userLogic.values.user
```

## Requires manual connection

### Using values from another logic in a listener

When you need to access another logic's values in a listener, make sure that logic is mounted with the methods
below. Then access `usersLogic.values` directly:

```javascript
const dashboardLogic = kea([
  connect([usersLogic]),
  listeners({
    refreshDashboard: async () => {
      if (!usersLogic.values.users) {
        usersLogic.actions.loadUsers()
      }
      // pull data from the API, update values shown on the dashboard
    },
  }),
])
```

### Explicitly with `.findMounted()`

If you don't want to explicitly connect a logic, but just to see if it's available, use `logic.findMounted(props): BuiltLogic`:

```ts
import { reportingLogic } from './reportingLogic'

const logic = kea([
  listeners({
    something: () => {
      // only run if reportingLogic is mounted
      reportingLogic.findMounted()?.actions.reportEvent({
        event: 'something',
        foobar: 'heck yeah',
      })
    },
  }),
])
```

## Automatically when building

When used in a key in a logic builder - like all the cases below - `usersLogic` will be automatically connected to the logic that called it
and mounted/unmounted as needed.

### Listening to an action from another logic

Use the `loadUsersSuccess` action from `usersLogic` as a key in the `listeners` object:

```javascript
const usersLogic = kea([]) // same as above

const dashboardLogic = kea([
  actions({
    refreshDashboard: true,
  }),
  listeners(({ actions }) => ({
    refreshDashboard: async () => {
      // pull data from the API, update values shown on the dashboard
    },
    [usersLogic.actionTypes.loadUsersSuccess]: ({ users }) => {
      actions.refreshDashboard()
      // we also get `users` in the payload,
      // but we socially distance ourselves from them
    },
  })),
])
```

### Using an action from another logic in a reducer

This `[otherLogic.actionTypes.doSomething]` syntax also works in reducers:

```javascript
const usersLogic = kea([])

const shadowUsersLogic = kea([
  actions({
    reset: true,
  }),
  reducers(({ actionTypes }) => ({
    users: [
      [],
      {
        reset: () => [], // action that's defined in this logic
        [actionTypes.reset]: () => [], // another way to call a local action
        [usersLogic.actionTypes.loadUsersSuccess]: (_, { users }) => users,
      },
    ],
  })),
])
```

### Using a selector from another logic in a selector

... and selectors:

```javascript
const usersLogic = kea([])

const sortedUsersLogic = kea([
  selectors({
    sortedUsers: [
      () => [usersLogic.selectors.users],
      (users) => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    ],
  }),
])
```
