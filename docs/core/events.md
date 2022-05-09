---
sidebar_position: 5
---

# events

## `events()`

You can hook into all the mount and unmount events with the `events` builder:

```javascript
import { kea, events } from 'kea'

const logic = kea([
  events(({ actions, values }) => ({
    // run before the logic is mounted
    beforeMount: () => {},
    // run after the logic is mounted
    afterMount: () => {},
    // run before the logic is unmounted
    beforeUnmount: () => {},
    // run after the logic is unmounted
    afterUnmount: () => {},
    // run when the logic gets a new set of props
    propsChanged: (props, oldProps) => {},
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

The `afterMount` and `beforeUnmount` events are also available as their own builders.

## `afterMount()`

The `afterMount` event runs code after a logic has been mounted. It's often used to start fetching data.

```ts
import { kea, afterMount } from 'kea'
import { loaders } from 'kea-loaders'

const logic = kea([
  loaders({
    users: {
      fetchUsers: async () => await api.getUsers()
    }
  })
  afterMount(({ actions }) => {
    actions.fetchUsers()
  }),
])
```

## `beforeUnmount()`

The `beforeUnmount` event fires right before a logic is unmounted. Here you can cancel listeners and do other
cleanup.

If you need to share data between `afterMount` and `beforeUnmount`, use [`logic.cache`](/docs/meta/logic#logiccache)

```ts
import { kea, afterMount, beforeUnmount } from 'kea'
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

## `propsChanged(props, oldProps)`

The `propsChanged` event fires when the logic gets a new set of props:

```ts
import { kea, props } from 'kea'
import { logicType } from './logicType'

interface LogicProps {
  id: number
}

const logic = kea<logicType<LogicProps>>([
  props({} as LogicProps),
  propsChanged(({ actions, props }, oldProps) => {
    console.log({ props, oldProps })
  }),
  afterMount(({ props }) => {
    console.log({ props })
  }),
])

logic({ id: 1 }).mount() // log: { props: { id: 1 } }
logic({ id: 2 }) // log: { props: { id: 2 }, oldProps: { id: 1 } }
logic({ id: 3 }) // log: { props: { id: 3 }, oldProps: { id: 2 } }
```
