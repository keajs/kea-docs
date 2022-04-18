# events

## `afterMount()`

The `afterMount` event runs code after a logic has been mounted. It's often used to start fetching data.

```ts
import { kea, afterMount } from 'kea'
import { loaders } from 'kea-loaders'

const logic = kea([
  afterMount(({ actions }) => {
    actions.fetchUsers()
  }),
  loaders({
    users: {
      fetchUsers: async () => await api.getUsers()
    }
  })
])
```

## `beforeUnmount()`

The `beforeUnmount` event fires right before a logic is unmounted. Here you can cancel listeners and do other
cleanup.

```ts
import { kea, afterMount, beforeUnmount } from "kea";
import { loaders } from 'kea-loaders'

const logic = kea([
  afterMount(({ actions, cache }) => {
    cache.onMouseMove = (e) => {
      console.log('mouse moved', e.offsetX, e.offsetY)
    }
    window.addEventListener('mousemove', cache.onMouseMove)
  }),
  beforeUnmount(({ actions }) => {
    window.removeEventListener('mousemove', cache.onMouseMove)
  }),
])
```

## `events()`

You can hook into all four mount and unmount lifecycle events of a logic with `events`:

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
