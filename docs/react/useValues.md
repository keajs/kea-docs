---
sidebar_position: 1
---

# useValues

Assure the logic is mounted and fetch values from it.

```javascript
import { kea, useValues } from 'kea'

const logic = kea([])

function MyComponent() {
  const { counter, doubleCounter } = useValues(logic)

  return (
    <div>
      {counter} * 2 = {doubleCounter}
    </div>
  )
}
```

## Re-rendering

A `useValues` hook will trigger a re-render if any action causes any of the subscribed values to change.

Only the affected component and its children will be re-rendered, not your entire application.

## Note on destructuring

You can only use `useValues` with destructoring

```javascript
const { a, b } = useValues(logic)
```

This is because internally `useValues` uses [getter functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
that call [`useSelector`](/docs/react/useSelector) when a value is accessed. Because hooks need to always be called in the same order,
you _can't_ just store the object returned from `useValues` and then use its properties later in
the code. Doing so might call the internal hooks in an unspecified order. Use `useAllValues` if you
need to do this.
