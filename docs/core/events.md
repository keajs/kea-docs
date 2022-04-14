# events

You can hook into the mount and unmount lifecycle of a logic with `events`:

```javascript
import { kea, events } from 'kea'

const logic = kea([
  events(({ actions, values }) => ({
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
    },
  })),
])
```

The useful events are `afterMount` and `beforeUnmount`, as when they are called
you have access to all the `actions`, `values`, etc of the logic.

All events accept either a function or an array of functions:

```javascript
const usersLogic = kea([
  events(({ actions, values }) => ({
    afterMount: [actions.fetchUsers, () => actions.fetchDetails(values.user.id)],

    // these four lines do the same:
    beforeUnmount: actions.cleanup,
    beforeUnmount: [actions.cleanup],
    beforeUnmount: () => actions.cleanup(),
    beforeUnmount: [() => actions.cleanup()],
  })),
])
```
