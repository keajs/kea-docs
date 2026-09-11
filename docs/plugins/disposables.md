# disposables

Register a timer, a listener or a subscription with a setup function that returns a cleanup function.
The [`kea-disposables`](https://github.com/PostHog/kea-disposables) plugin runs the cleanup when the logic unmounts,
so you never write a `beforeUnmount` that only calls `clearInterval`.

Background work also stops while the browser tab is hidden, and starts again when the user comes back.

Works with kea `3.0.0` and up.

## Installation

First install the [`kea-disposables`](https://github.com/PostHog/kea-disposables) package:

```shell
# if you're using yarn
yarn add kea-disposables

# if you're using npm
npm install --save kea-disposables
```

Then install the plugin:

```javascript
import { disposablesPlugin } from 'kea-disposables'
import { resetContext } from 'kea'

resetContext({
  plugins: [disposablesPlugin],
})
```

Every logic that mounts from that point on gets a `cache.disposables` manager. There is nothing to add per logic.

## Sample usage

```ts
import { actions, kea, listeners } from 'kea'

const logic = kea([
  actions({ startPolling: true, stopPolling: true, poll: true }),
  listeners(({ actions, cache }) => ({
    startPolling: () => {
      cache.disposables.add(() => {
        // The setup runs immediately.
        const id = setInterval(() => actions.poll(), 5000)
        // It returns the cleanup, the same shape as a useEffect.
        return () => clearInterval(id)
      }, 'poller')
    },
    stopPolling: () => {
      cache.disposables.dispose('poller')
    },
  })),
])
```

The unmount of `logic` clears the interval. No `beforeUnmount` is necessary.

## Declare disposables on the logic

The `disposables` builder covers the common case of a resource that lives as long as the logic,
so you write no `afterMount` to call `add`:

```ts
import { kea } from 'kea'
import { disposables } from 'kea-disposables'

const logic = kea([
  disposables(({ actions }) => ({
    poller: () => {
      const id = setInterval(() => actions.poll(), 5000)
      return () => clearInterval(id)
    },
    crossTabSync: {
      setup: () => {
        const handler = () => actions.sync()
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
      },
      options: { pauseOnPageHidden: false },
    },
  })),
])
```

The object keys are disposable keys, so `dispose('poller')` stops one early, and `add(..., 'poller')` later replaces it.
Anything conditional, or armed again from a listener, still uses `cache.disposables.add(...)`.

## The manager

Every mounted logic has one at `logic.cache.disposables`.

### `add(setup, key?, options?)`

| Argument  | Type                              | Notes                                                                               |
| --------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| `setup`   | `() => () => void`                | Runs immediately. It must return a cleanup function.                                |
| `key`     | `string`                          | Optional. The same key disposes the previous entry first. Generated if you omit it. |
| `options` | `{ pauseOnPageHidden?: boolean }` | Optional. The default is `{ pauseOnPageHidden: true }`.                             |

### `dispose(key)`

Tears down one resource, and keeps the logic mounted. Returns `true` if it disposed something.

### `isDisposed`

`true` after the final unmount of the logic. `add` and `dispose` do nothing from that point on,
so an async continuation that outlives the logic calls them without a null check.
Read the flag when the continuation must also stop work of its own, for example before it reads `values`.

## Pause on a hidden tab

A disposable pauses when the tab becomes hidden, and starts again when the tab becomes visible.
This removes the CPU and the network cost of a background tab.

A disposable that you add while the tab is hidden is registered but not started,
so a poll that schedules itself again in the background cannot defeat the pause.

Opt out for a resource that must stay live:

```ts
cache.disposables.add(
  () => {
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  },
  'crossTabSync',
  { pauseOnPageHidden: false }
)
```

Opt out for an event that can fire while the tab is hidden (`storage`, `online`, `offline`, `message`),
for a `visibilitychange` listener, and for work the user expects to continue in the background.

## TypeScript

Kea types `cache` as `Record<string, any>`, so `cache.disposables.add(...)` compiles without a check.
Annotate the destructured `cache` to get completions:

```ts
import { listeners } from 'kea'
import type { DisposablesCache } from 'kea-disposables'

listeners(({ cache }: { cache: DisposablesCache }) => ({
  // ...
}))
```

To read the manager off a logic from outside its own builders, use `getDisposables`:

```ts
import { getDisposables } from 'kea-disposables'

getDisposables(logic).dispose('poller')
```

## Context resets

A closed kea context, from a `resetContext()` call, disposes every live manager.
Kea drops the logic from the store there without an unmount, so `beforeUnmount` never runs,
and each timer and listener would otherwise stay live.
Storybook resets the context on every story mount, and most test setups reset between tests.
