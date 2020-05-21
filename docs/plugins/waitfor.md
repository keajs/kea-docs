---
id: waitfor
title: WaitFor
sidebar_label: WaitFor
---

Sometimes when doing Server Side Rendering (SSR) or [testing](/docs/guide/testing) your logic, you might
want to `await` for an action. This is what the [kea-waitfor](https://github.com/keajs/kea-waitfor) 
plugin does!

:::note Keep In Mind
`kea-waitfor` in not (YET!) designed to be used in listeners. Only use it outside your logic,
like in tests or in a Server Side Rendering context.

However, if you're feeling lucky and use it anyway in a listener, remember to add a [`breakpoint`](/docs/guide/additional#breakpoints) after the wait!
::: 

# Installation

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
        })
    ],
})
```

## `waitForAction`

To wait for a kea action, use `waitForAction`:

```javascript
import { waitForAction } from 'kea-waitfor'

const payload = await waitForAction(logic.actions.myAction)
```

For example: 

```javascript
import { kea } from 'kea'
import { waitForAction } from 'kea-waitfor'

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

logic.mount()
logic.actions.setValue('hamburger')
const { value } = await waitForAction(logic.actions.valueWasSet)

console.log(value) 
// --> 'hamburger'
```


## `waitForCondition`

To wait for any random condition, use `waitForCondition`:

```javascript
import { waitForCondition } from 'kea-waitfor'

const payload = await waitForCondition(action => action.payload.id !== 'new')
```

For example: 

```javascript
import { waitForCondition } from 'kea-waitfor'

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

logic.mount()
logic.actions.setValue('cheeseburger')
const { value } = await waitForCondition(action => {
    return action.type === logic.actions.valueWasSet.toString() && 
           action.payload.value === 'cheeseburger'
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
]).then(([
    valueWasSetPayload,
    clickedButtonPayload
]) => {
    console.log(valueWasSetPayload, clickedButtonPayload);
});
```

### First event

To wait for the first action to finish, use `Promise.race`:

```javascript
Promise.race([
    waitForAction(logic.actions.settingValueSuccess),
    waitForAction(logic.actions.settingValueFailure),
]).then((firstPayload) => {
    console.log(firstPayload) // but which one?
});
```

### First event with metadata

To add more metadata to better detect the winning action, feel free to
add `.then(...)` to the promises:

```javascript
Promise.race([
    waitForAction(logic.actions.settingValueSuccess)
        .then(payload => ({ success: true, ...payload })),
    waitForAction(logic.actions.settingValueFailure)
        .then(payload => ({ success: false, ...payload })),
]).then(({ success }) => {
    console.log(success)
});
```

### With a timeout

To wait with a timeout, use a makeshift timebomb:

```javascript
const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms))

Promise.race([
    waitForAction(logic.actions.settingValueSuccess)
        .then(payload => ({ status: 'ok', ...payload })),
    waitForAction(logic.actions.settingValueFailure)
        .then(payload => ({ status: 'error', ...payload })),
    delay(5000).then(() => ({ status: 'timeout' }))
]).then(({ status }) => {
  console.log(status)
});
```
