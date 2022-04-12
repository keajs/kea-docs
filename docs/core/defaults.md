# defaults

## Defaults

There are two ways to pass defaults to reducers. We've been using this style until now:

```javascript
const logic = kea({
  // ... actions: { increment, decrement }

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
```

If you choose, you can set your defaults explicitly in a `defaults` object:

```javascript
const logic = kea({
  // ... actions: { increment, decrement }

  defaults: {
    counter: 0,
  },

  reducers: {
    counter: {
      increment: (state, { amount }) => state + amount,
      decrement: (state, { amount }) => state - amount,
    },
  },
})
```

In case you pass both, the value in the `defaults` object will take precedence.

You can also pass selectors as defaults:

```javascript
const counterLogic = kea({ ... })

const logic = kea({
    defaults: () => ({ // must be a function to evaluate at build time
        counterCopy: counterLogic.selectors.counter
    }),

    reducers: {
        counterCopy: [counterLogic.selectors.counter, {
            increment: (state, { amount }) => state + amount,
            decrement: (state, { amount }) => state - amount
        }]
    }
})
```

You can take it one level deeper and return a selector that computes the defaults:

```javascript
const logic = kea({
    defaults: () => (state, props) => ({
        // simple value
        simpleDefault: 0,
        // returning a selector
        directName: someLogic.selectors.storedName
        // returning a value through a selector
        connectedName: someLogic.selectors.storedObject(state, props).name,
    })
})
```
