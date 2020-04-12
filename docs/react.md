---
id: react
title: Using with React
sidebar_label: Using with React
---

Kea supports both, `function` and `Class` components.

## Functional Components

You use hooks to fetch actions and values from your logic.
Here are the two most common Hooks.
See the [Hooks API reference](/docs/api/hooks) for two more!

When you use a Hook, Kea makes sure the logic is mounted as your component renders and gets
automatically unmounted when your component is removed from React.

### `useActions`

Fetch actions from a logic.
   
```javascript
import { kea, useActions } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { increment } = useActions(logic)

  return <button onClick={increment}>Increment</button>
}
```

### `useValues`

Fetch values from a logic.

```javascript
import { kea, useValues } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { counter, doubleCounter } = useValues(logic)

  return <div>{counter} * 2 = {doubleCounter}</div>
}
```

:::note
**Please Note!** You can only use `useValues` with destructoring:
 
```javascript
const { a, b } = useValues(logic)
```

This is because internally `useValues` uses [getter functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 
that call react-redux's [`useSelector`](https://react-redux.js.org/next/api/hooks#useselector) 
hooks when a value is accessed. Because hooks need to always be called in the same order, 
you _can't_ just store the object returned from `useValues` and then use its properties later in 
the code. Doing so might call the internal hooks in an unspecified order. Use
[`useAllValues`](/docs/api/hooks#useallvalues) if you need to do this.
:::
    
## Class Components

* logic(Component)
* connect

...

```jsx
function SuperCounter () {
    const { increment } = useActions(logic)
    const { counter } = useValues(logic)

    return (
        <div>
            Counter: {counter}<br/>
            <button onClick={() => increment(100)}>Add 100 😕</button>
            <button onClick={() => increment(999)}>Add 999 🤩</button>
        </div>
    )
}
```

