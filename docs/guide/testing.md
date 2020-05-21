---
id: testing
title: Testing
---

:::note
Kea comes with over [120+ tests](https://github.com/keajs/kea/tree/master/src/__tests__) that verify things work like they should!

Feel free to browse the test suite. It's better to look at recently modified files, since some tests haven't been changed for years
and test in funky ways (not in line with Kea 2.0's best practices aka *don't do this at home*). 
:::

## Testing with Jest

[Jest](https://jestjs.io/) is our testing framework of choice.

When testing with Jest, call [`resetContext()`](/docs/api/context#resetcontext) before each test to reset Kea's brain.

```javascript
/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'

beforeEach(() => {
  resetContext()
})

test('runs before and after mount events', async () => {
  // your test here
})
```

## Testing logic

Before writing tests for logic, read the [advanced](/docs/guide/advanced) sections on [Lifecycles](/docs/guide/advanced#lifecycles)
and [Mounting and Unmounting](/docs/guide/advanced#mounting-and-unmounting).

Normally in a test you would mount a logic, call some actions on it and assure the values.

Here's a simple example:

```javascript
/* global test, expect, beforeEach */
import { kea, resetContext } from '../index'

beforeEach(() => {
  resetContext()
})

test('runs before and after mount events', async () => {
  const logic = kea({
    actions: () => ({
      increment: (amount = 1) => ({ amount }),
    }),
    reducers: ({ actions }) => ({
      counter: [0, {
        increment: (_, { name }) => name,
      }],
    }),
  })

  logic.mount()
  expect(logic.values.counter).toBe(0)

  logic.actions.increment(1)
  expect(logic.values.counter).toBe(1)
})
```

## Wait for actions

Sometimes you need to wait for a specific action to complete before you can end your test.

Use the [kea-waitfor](/docs/plugins/waitfor) plugin for that. 

```javascript
/* global test, expect, beforeEach */
import { resetContext, kea } from 'kea'

import { waitForAction, waitForPlugin } from 'kea-waitfor'

beforeEach(() => {
  resetContext({
    plugins: [waitForPlugin]
  })
})

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms))

test('can wait for an action', async () => {
  const logic = kea({
    actions: () => ({
      setValue: value => ({ value }),
      valueWasSet: value => ({ value })
    }),

    listeners: ({ actions }) => ({
      setValue: async ({ value }) => {
        await delay(300)
        actions.valueWasSet(value)
      }
    })
  })

  // wait just for an action
  const unmount1 = logic.mount()
  logic.actions.setValue('hamburger')
  const { value } = await waitForAction(logic.actions.valueWasSet)
  expect(value).toBe('hamburger')
  unmount1()
 
  // any random check on the action
  const unmount2 = logic.mount()
  logic.actions.setValue('cheeseburger')
  const { value } = await waitForCondition(action => {
    return action.type === logic.actions.valueWasSet.toString() && 
           action.payload.value === 'cheeseburger'
  })
  expect(value).toBe('cheeseburger')
  unmount2()
})
```

## Testing Kea and React together

TODO
