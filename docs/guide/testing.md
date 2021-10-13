---
id: testing
title: Testing
---

## Why test your logics?

...

## Install Jest and Kea-Test-Utils

Kea provides a set of utilities that makes testing logic with Jest a real treat.

### Install the pacakges

- [Install and configure jest](https://jestjs.io/docs/getting-started).
- Install `kea-test-utils` with either:
  - `yarn add --dev kea-test-utils`
  - `npm install --save-dev kea-test-utils`

### Reset the context before each test

When testing with Jest, call [`resetContext()`](/docs/api/context#resetcontext) before each test to reset Kea's brain.

```ts
/* global test, expect, beforeEach */
import { kea, resetContext } from 'kea'
import { testUtilsPlugin } from 'kea-test-utils'

beforeEach(() => {
  resetContext({
    plugins: [testUtilsPlugin, /* other plugins */]  
  })
})

test('runs before and after mount events', async () => {
  // your test here
})
```

### Adapt `kea-router` to run in nodejs

To run `kea-router` in a jest test, you need to pass it a mocked history object. Otherwise and especially when using `jsdom`, the URL might persist between tests.

Install the `memory` package, and adapt as needed:

```ts
import { createMemoryHistory } from 'history'

beforeEach(() => {
  const history = createMemoryHistory()
  ;(history as any).pushState = history.push
  ;(history as any).replaceState = history.replace
  
  resetContext({
    plugins: [
      testUtilsPlugin, 
      routerPlugin({ history: history, location: history.location }),
      /* other plugins */  
    ]
  })
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
    actions: {
      increment: (amount = 1) => ({ amount }),
    },
    reducers: {
      counter: [0, {
        increment: (_, { name }) => name,
      }],
    },
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
    actions: {
      setValue: value => ({ value }),
      valueWasSet: value => ({ value })
    },

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

I'm not yet ready to recommend a best practice. But a year ago [this approach](https://github.com/keajs/kea/blob/master/src/__tests__/hooks.js)
got the job done. 

TODO! :)
