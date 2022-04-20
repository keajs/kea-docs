# waitfor

Sometimes when doing Server Side Rendering (SSR) or [testing](/docs/BROKEN) your logic, you might
want to `await` for an action. This is what the [kea-waitfor](https://github.com/keajs/kea-waitfor)
plugin does!

:::warning Keep In Mind
`kea-waitfor` in designed for use in tests (and is surpassed by [kea-test-utils](/docs/intro/testing)), or in a Server Side Rendering context.
It is not designed for daily use in listeners and elsewhere, as it's easy to miss dispatched events that happen synchronously.
You have the danger of edge cases where you'll be waiting for an event that already passed.
:::

## Installation

First install the [`kea-waitfor`](https://github.com/keajs/kea-waitfor) package:

```shell
# if you're using yarn
yarn add kea-waitfor

# if you're using npm
npm install --save kea-waitfor
```

Then install the plugin:

```javascript
import { waitForPlugin } from 'kea-waitfor'
import { resetContext } from 'kea'

resetContext({
  plugins: [
    waitForPlugin({
      /* options */
    }),
  ],
})
```

## `waitForAction`

To wait for a kea action, use `waitForAction`:

```javascript
import { waitForAction } from 'kea-waitfor'

const payload = await waitForAction(logic.actionTypes.myAction)
```

For example:

```javascript
import { kea } from 'kea'
import { waitForAction } from 'kea-waitfor'

const logic = kea([
  actions({
    setValue: (value) => ({ value }),
    valueWasSet: (value) => ({ value }),
  }),

  listeners(({ actions }) => ({
    setValue: async ({ value }) => {
      await delay(300)
      actions.valueWasSet(value)
    },
  })),
])

logic.mount()
logic.actions.setValue('hamburger')
const { value } = await waitForAction(logic.actionTypes.valueWasSet)

console.log(value)
// --> 'hamburger'
```

## `waitForCondition`

To wait for any random condition, use `waitForCondition`:

```javascript
import { waitForCondition } from 'kea-waitfor'

const payload = await waitForCondition((action) => action.payload.id !== 'new')
```

For example:

```javascript
import { waitForCondition } from 'kea-waitfor'

const logic = kea([
  actions({
    setValue: (value) => ({ value }),
    valueWasSet: (value) => ({ value }),
  }),

  listeners(({ actions }) => ({
    setValue: async ({ value }) => {
      await delay(300)
      actions.valueWasSet(value)
    },
  })),
])

logic.mount()
logic.actions.setValue('cheeseburger')
const { value } = await waitForCondition((action) => {
  return (
    action.type === logic.actionTypes.valueWasSet && action.payload.value === 'cheeseburger'
  )
})

console.log(value)
// --> 'cheeseburger'
```

## Wait for many events

### All events finish

To wait for multiple actions to finish, use `Promise.all` like you would with other
promises:

```javascript
Promise.all([
  waitForAction(logic.actions.valueWasSet),
  waitForAction(logic.actions.clickedButton),
]).then(([valueWasSetPayload, clickedButtonPayload]) => {
  console.log(valueWasSetPayload, clickedButtonPayload)
})
```

### First event

To wait for the first action to finish, use `Promise.race`:

```javascript
Promise.race([
  waitForAction(logic.actions.settingValueSuccess),
  waitForAction(logic.actions.settingValueFailure),
]).then((firstPayload) => {
  console.log(firstPayload) // but which one?
})
```

### First event with metadata

To add more metadata to better detect the winning action, feel free to
add `.then(...)` to the promises:

```javascript
Promise.race([
  waitForAction(logic.actions.settingValueSuccess).then((payload) => ({
    success: true,
    ...payload,
  })),
  waitForAction(logic.actions.settingValueFailure).then((payload) => ({
    success: false,
    ...payload,
  })),
]).then(({ success }) => {
  console.log(success)
})
```

### With a timeout

To wait with a timeout, use a makeshift timebomb:

```javascript
const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

Promise.race([
  waitForAction(logic.actions.settingValueSuccess).then((payload) => ({
    status: 'ok',
    ...payload,
  })),
  waitForAction(logic.actions.settingValueFailure).then((payload) => ({
    status: 'error',
    ...payload,
  })),
  delay(5000).then(() => ({ status: 'timeout' })),
]).then(({ status }) => {
  console.log(status)
})
```
