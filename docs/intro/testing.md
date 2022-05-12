---
sidebar_position: 4
---

# Testing

import useBaseUrl from '@docusaurus/useBaseUrl'

## Kea-Test-Utils

### Test the boundary

A logic communicates with the rest of the world through `actions` and `values`. Thus to assure that a logic does what
it's supposed to do, it's usually enough to dispatch some actions, and make sure they in turn change the right values
and/or dispatch other actions.

You literally write down what should happen in a chain of dispatched actions and matched values:

```ts
import { expectLogic, partial } from 'kea-test-utils'

it('setting search query loads remote items', async () => {
  await expectLogic(logic, () => {
    logic.actions.setSearchQuery('event')
  })
    .toDispatchActions(['setSearchQuery', 'loadRemoteItems'])
    .toMatchValues({
      searchQuery: 'event',
      remoteItems: partial({
        count: 0,
        results: [],
      }),
      remoteItemsLoading: true,
    })
    .toDispatchActions(['loadRemoteItemsSuccess'])
    .toMatchValues({
      searchQuery: 'event',
      remoteItems: partial({
        count: 3, // got new results
        results: partial([partial({ name: 'event1' })]),
      }),
      remoteItemsLoading: false,
    })
})
```

It doesn't matter if the actions you're matching have already been dispatched or if we need to wait for them.
Kea-Test-Utils' `.toDispatchActions` can both query a recorded history of actions, and wait for new ones to arrive.

In turn, `.toMatchValues` matches values as they were after the last matched action, no matter what they are now.

### Installing

- [Install and configure jest](https://jestjs.io/docs/getting-started)
- Install `kea-test-utils` with either

```shell
# With yarn
yarn add --dev kea-test-utils

# With npm
npm install --save-dev kea-test-utils
```

### Reset the context before each test

Kea stores everything in a context. Call `resetContext()` before each test to reset Kea's brain. Pass it the `testUtilsPlugin`
to enable the action and state recording necessary for `expectLogic` to work.

```ts
/* global test, expect, beforeEach */
import { kea, resetContext } from 'kea'
import { testUtilsPlugin } from 'kea-test-utils'

beforeEach(() => {
  resetContext({
    plugins: [testUtilsPlugin /* other plugins */],
  })
})

test('runs before and after mount events', async () => {
  // your test here
})
```

### Mount your logic

Then make sure your logic is [mounted](/docs/meta/logic#mount) before the tests run:

```ts
describe('dashboardLogic', () => {
  let logic: ReturnType<typeof dashboardLogic.build>

  beforeEach(() => {
    logic = dashboardLogic({ id: 123 })
    logic.mount()
  })

  test('runs before and after mount events', async () => {
    await expectLogic(logic).toMatchValues({ id: 123 })
  })
})
```

If you run `resetContext` between tests, and use enough [breakpoints in your listeners](/docs/core/listeners#breakpoints), you shouldn't need to worry about unmounting logic.

### `expectLogic()`

The entrypoint to the Live-Replay logic testing. All of these options work:

```ts
// option 1
await expectLogic(logic, () => logic.actions.doSomething()).toDispatchActions(['doSomething'])

// option 2
await expectLogic(() => logic.actions.doSomething()).toDispatchActions(logic, ['doSomething'])

// option 3
logic.actions.doSomething()
await expectLogic(logic).toDispatchActions(['doSomething'])

// option 4
logic.actions.doSomething()
await expectLogic().toDispatchActions(logic, ['doSomething'])
```

### `.toDispatchActions()`

Match dispatched actions in order. Waits up to `3s` and requires `await` if any of the actions haven't already happened.

```ts
await expectLogic(logic, () => {
  logic.actions.setSearchQuery('hello')
}).toDispatchActions([
  // array of actions
  // short form
  'setSearchQuery',
  // redux type
  logic.actionTypes.setSearchQuery,
  // full redux action
  logic.actionCreators.setSearchQuery('hello'),
  // custom matcher
  (action) =>
    action.type === logic.actionTypes.setSearchQuery && action.payload.searchQuery === 'hello',
])
```

### `.toDispatchActionsInAnyOrder()`

Match dispatched actions in any order. Waits up to `3s` and requires `await` if any of the actions haven't already happened.

```ts
await expectLogic(logic, () => {
  logic.actions.setSearchQuery('hello')
}).toDispatchActionsInAnyOrder([
  // array of actions
  // short form
  'setSearchQuery',
  // redux type
  logic.actionTypes.setSearchQuery,
  // full redux action
  logic.actionCreators.setSearchQuery('hello'),
  // custom matcher
  (action) =>
    action.type === logic.actionTypes.setSearchQuery && action.payload.searchQuery === 'hello',
])
```

### `.toNotHaveDispatchedActions()`

Make sure none of the given actions have been dispatched. Use with `delay` or `toFinishListeners`.

```ts
await expectLogic(logic, () => {
  logic.actions.setSearchQuery('hello')
}).toNotHaveDispatchedActions([
  // array of actions
  // short form
  'setSearchQuery',
  // redux type
  logic.actionTypes.setSearchQuery,
  // full redux action
  logic.actionCreators.setSearchQuery('hello'),
  // custom matcher
  (action) =>
    action.type === logic.actionTypes.setSearchQuery && action.payload.searchQuery === 'hello',
])
```

### `.toFinishListeners()`

Wait for all listeners on a logic to finish.

```ts
await expectLogic(logic, () => logic.actions.doSomething()).toFinishListeners()
```

### `.toFinishAllListeners()`

Wait for all running listeners to finish.

```ts
await expectLogic().toFinishAllListeners()
```

### `.toMatchValues()`

Match the store's state as it was **after a matched action**.

```ts
await expectLogic(logic, () => logic.actions.doSomething())
  .toDispatchActions(['doSomething'])
  .toMatchValues({
    something: 'done',
    somethingLoading: 'true',
  })
  .toDispatchActions(['doSomethingElse'])
  .toMatchValues(otherLogic, {
    something: 'else',
  })
```

#### Match values at the end of history

If you use `toDispatchActions([])`, we lock the history index that `toMatchValues` uses to the last matched action.

This allows you to effortlessly query history, but sometimes you might want to see what are the current values. Here
you have two options.

1. Actually match a better action with `.toDispatchActions(['doSomethingElse'])` if applicable
2. Use `.clearHistory()` to reset all matched actions. See below for details.

### `truth` and `partial`

Use the `truth` and `partial` helpers, or jest's `expect` matchers to make matching values easier:

```ts
import { expectLogic, partial, truth } from 'kea-test-utils'

await expectLogic(logic, () => logic.actions.loadResults())
  .toHaveDispatchedActions(['loadResultsSuccess'])
  .toMatchValues({
    results: partial([partial({ id: 33 })]), // has a result with id: 33
  })
  .toMatchValues({
    results: truth((results) => results.length === 42), // has 42 results
  })
  .toMatchValues({
    results: expect.arrayContaining([expect.objectContaining({ id: 33 })]), // jest matchers work too
  })
```

### `.toMount()`

Expect specific logics to be mounted

```ts
await expectLogic(logic).toMount([userLogic, otherLogic({ id: insight.id })])
```

### `.printActions()`

Show what actions have been printed now, and where the current pointer for value matching is.

```ts
await expectLogic(logic, () => logic.actions.setSearchQuery())
  .toMatchActions(['setSeachQuery'])
  .printActions()
  .printActions({ compact: true })
```

### `.delay()`

Wait the time in `ms`.

```ts
await expectLogic(logic, () => logic.actions.setSearchQuery())
  .wait(100)
  .printActions()
```

### `.clearHistory()`

Forget anything ever happened. This can be useful if you want to reset the index used for `toMatchValues` after matching
with `toDispatchActions`.

```ts
await expectLogic(logic, () => logic.actions.setSearchQuery())
  .clearHistory()
  .printActions() // nothing to print
  .toMatchValues({ results: [] }) // checks the current state of values
```

## Common issues

### Adapt kea-router to run in nodejs

To run kea-router in a jest test, you need to pass it a mocked history object. Otherwise and especially when using jsdom, the URL might persist between tests.

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
    ],
  })
})
```
