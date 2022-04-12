---
id: hooks
title: Hooks
sidebar_label: Hooks
---

There are a few hooks you can use in your functional components.

## useMountedLogic

Assure that the logic is mounted when the component renders and is unmounted when the component is
destroyed.

This hook is not needed if you use any of the other hooks.

```javascript
import { kea, useMountedLogic } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  useMountedLogic(logic)

  return <div>Logic is now mounted!</div>
}
```

## useActions

Assure the logic is mounted and fetch actions from the logic. Actions are automatically connected 
to `dispatch`.
    
```javascript
import { kea, useActions } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { increment } = useActions(logic)

  return <button onClick={increment}>Increment</button>
}
```

## useValues

Assure the logic is mounted and fetch values from it.

```javascript
import { kea, useValues } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { counter, doubleCounter } = useValues(logic)

  return <div>{counter} * 2 = {doubleCounter}</div>
}
```

:::note
You can only use `useValues` with destructoring
 
```javascript
const { a, b } = useValues(logic)
```

This is because internally `useValues` uses [getter functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 
that call react-redux's [`useSelector`](https://react-redux.js.org/next/api/hooks#useselector) 
hooks when a value is accessed. Because hooks need to always be called in the same order, 
you _can't_ just store the object returned from `useValues` and then use its properties later in 
the code. Doing so might call the internal hooks in an unspecified order. Use `useAllValues` if you 
need to do this.
:::

## useAllValues

Similar to `useValues`, but selects all the values in the logic and stores their current state in an object.
    
```javascript
import { kea, useAllValues } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const values = useAllValues(logic)

  return <div>{values.counter} * 2 = {values.doubleCounter}</div>
}
```