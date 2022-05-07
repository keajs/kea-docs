---
sidebar_position: 3
---

# useSelector

This works similar to [react-redux's `useSelector`](https://react-redux.js.org/api/hooks#useselector), allowing you
to select anything from the store:

```javascript
import { kea, useValues } from 'kea'

function MyComponent() {
  // use kea's selector
  const someValue = useSelector(logic.selectors.someValue)
  // pass your own
  const value = useSelector((state) => state.something.from.the.store)

  return <div>{value}</div>
}
```

Internally this uses React's [`useSyncExternalStore`](https://reactjs.org/docs/hooks-reference.html#usesyncexternalstore)
if you're using React 18, or [a shim](https://www.npmjs.com/package/use-sync-external-store) if you're running React 17 or earlier.

## Re-rendering

A `useSelector` hook will trigger a re-render if any action causes its subscribed value to change.

Only the affected component and its children will be re-rendered, not your entire application.
