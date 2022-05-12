It's simple to access actions and values on other logic, but there are a few things you need to keep in mind.

## Make sure `otherLogic` is mounted

In Kea, you need to explicitly [`mount` your logic](/docs/meta/logic#mounting-and-unmounting).
If you try accessing properties on a logic that isn't mounted, it'll throw an error.

When you use a React hook like [`useValues`](/docs/react/useValues), [`useActions`](/docs/react/useActions) or [`useMountedLogic`](/docs/react/useMountedLogic), the logic is automatically mounted and
unmounted with the component.

However, what if you need access to some logic not from React, but from within another logic? That's when you use `connect`.

## Connect inside a logic

### `connect()`

Use `connect` to connect logic together. This assures that they mount together.

```ts
import { kea, actions, connect, listeners } from 'kea'

const userLogic = kea([])
const profileLogic = kea([])
const teamLogic = kea([])

const otherLogic = kea([
  // make sure teamLogic is mounted
  connect(teamLogic),
  // also accepts arrays
  connect([userLogic, profileLogic]),
  // some time later:
  actions({ loadUser: true }),
  listeners({
    loadUser: async () => {
      // these two logic are guaranteed to be mounted
      const { teamId } = teamLogic.values
      const { userId } = userLogic.values
      const me = await fetch(`/api/${teamId}/${userId}`)
      // ...
    },
  }),
])

otherLogic.mount() // also mounts teamLogic, userLogic and profileLogic
```

### `connect({ logic: [] })`

The above is just a shorthand for `connect({ logic: otherLogic })`:

```ts
import { kea, connect } from 'kea'

const userLogic = kea([])
const otherLogic = kea([
  connect({
    logic: [userLogic],
    // other keys for `connect`...
  }),
])

otherLogic.mount() // also mounts userLogic
```

## Pull in actions and values

In addition to simply connecting the logic, you may pull in actions and values from other logic, making them act just like locally declared actions and values.

### `connect({ actions: [] })`

```ts
import { kea, connect, actions } from 'kea'

const userLogic = kea([
  // userLogic has two actions
  actions({ reloadUser: true, resetUser: true }),
])

const otherLogic = kea([
  // pull in two actions from userLogic
  connect({ actions: [userLogic, ['reloadUser', 'resetUser']] }),
])

otherLogic.mount() // also mounts userLogic
otherLogic.actions.reloadUser() // actually triggers userLogic.actions.reloadUser
```

### `connect({ values: [] })`

```ts
import { kea, connect, reducers } from 'kea'

const userLogic = kea([
  // userLogic has two reducers
  reducers({ user: [[]], userLoading: [false] }),
])
const otherLogic = kea([
  // make sure userLogic is mounted
  connect({ values: [userLogic, ['user', 'userLoading']] }),
])

otherLogic.mount() // also mounts userLogic
otherLogic.values.user == userLogic.values.user
```

## Pull in actions and values from keyed logic

### `connect(props => {})`

If the logics you're connecting all share a [`key`](/docs/meta/key), use a function that receives `props` as its argument:

```ts
import { kea, key, connect } from 'kea'

const userLogic = kea([
  // keyed on "id"
  key((props) => props.id),
  // declare "user" through a loader
  loaders(({ props }) => ({ user: { getUser: () => api.getUser(props.id) } })),
  afterMount(({ actions }) => actions.getUser()),
])

const profileLogic = kea([
  // also keyed on "id"
  key((props) => props.id),
  // get the "user", by passing along the "id" prop
  connect(({ id }) => ({ values: [userLogic({ id }), ['user']] })),
])

profileLogic({ id: 12 }).mount() // also mounts userLogic({ id: 12 })
profileLogic({ id: 12 }).values.user // selected directly from userLogic({ id: 12 })
```

You can now access `user` like it is a local value. Actions work the same way.

## Connecting in listeners

### Using values from another logic in a listener

When you need to access another logic's values in a listener, make sure that logic is mounted with the methods
above. Then access `usersLogic.values` directly:

```javascript
const dashboardLogic = kea([
  // make sure usersLogic is mounted together with the logic
  connect(usersLogic),
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

### Using values from a keyed logic in a listener

Even if you connect another logic with a key (e.g. `userLogic({ id })`) using `connect`,
you must still explicitly pass in the key or props if you need to access _other_ un-connected actions or values on it:

```ts
const profileLogic = kea([
  // also keyed on "id"
  key((props) => props.id),
  // get the "user", by passing along the "id" prop
  connect(({ id }) => ({ values: [userLogic({ id }), ['user']] })),

  // custom logic that also uses userLogic
  listeners(({ props, values }) => ({
    // we must still pass { id } to use the right "getUser" action
    // here we use a shortcut and pass the "props" directly
    [userLogic(props).actionTypes.getUser]: () => {
      // even if "userLogic" is connected to "profileLogic", the listener doesn't know
      // your intent. To reach the correct "userLogic", explicitly pass it the "props"
      const { user } = userLogic(props).values
      // resolves to the same value thanks to "connect" above
      const connectedUser = values.user
    },
  })),
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

There are three cases when a logic is connected automatically to another, without having to explicitly `connect`.

All of these happens when we start to build a logic when already building a different logic.

### Using an action from another logic in a reducer

With a syntax like `[otherLogic.actionTypes.doSomething]` in a reducer:

```javascript
const usersLogic = kea([])

const shadowUsersLogic = kea([
  actions({
    reset: true,
  }),
  // passing a callback to make sure `usersLogic` is not `undefined` due to
  // the bundler's module loading order
  reducers(() => ({
    users: [
      [],
      {
        reset: () => [], // action that's defined in this logic
        [usersLogic.actionTypes.loadUsersSuccess]: (_, { users }) => users,
      },
    ],
  })),
])
```

### Using a selector from another logic in a selector

This case is also automatically connected:

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

### Listening to an action from another logic

Finally, in this case the logic is also automatically connected, though not so if you would
use the other logic's action within a local listener.

```javascript
const usersLogic = kea([]) // same as above

const dashboardLogic = kea([
  listeners(({ actions }) => ({
    [usersLogic.actionTypes.loadUsersSuccess]: ({ users }) => {
      // ...
    },
  })),
])
```
