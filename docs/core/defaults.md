---
sidebar_position: 6
---

# defaults

## Set defaults directly in reducers

There are two ways to pass defaults to reducers. We've been using this style until now:

```javascript
import { kea, reducers } from 'kea'

const logic = kea([
  reducers({
    counter: [
      0, // defaults to 0
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  }),
])
```

## Use `defaults` builder

You can also set your defaults explicitly with a `defaults` builder:

```javascript
import { kea, defaults, reducers } from 'kea'

const logic = kea([
  defaults({
    counter: 0,
  }),

  reducers({
    counter: {
      increment: (state, { amount }) => state + amount,
      decrement: (state, { amount }) => state - amount,
    },
  }),
])
```

## Precedence

In case you pass both, the default passed earlier via `defaults` will take precedence over the one in `reducers`.

## Selectors as defaults

You can pass selectors as defaults to compute them on the fly.

```javascript
import { kea, defaults, reducers } from 'kea'

const counterLogic = kea([])

const logic = kea([
  // must be a function to evaluate at build time after counterLogic has mounted 
  defaults(() => ({
    counterCopy: counterLogic.selectors.counter,
  })),

  reducers(() => ({
    counterCopy: [
      counterLogic.selectors.counter,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  })),
])
```

You can take it one level deeper and return a selector that computes the defaults:

```javascript
import { kea, defaults } from 'kea'

const logic = kea([
  defaults(() => (state, props) => ({
    // simple value
    simpleDefault: 0,
    // returning a selector
    directName: someLogic.selectors.storedName,
    // returning a value through a selector
    connectedName: someLogic.selectors.storedObject(state, props).name,
  })),
])
```
