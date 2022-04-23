# subscriptions

Subscribe to changes in values. Works with kea `3.0.0` and up.

## Installation

First install the [`kea-subscriptions`](https://github.com/keajs/kea-subscriptions) package:

```shell
# if you're using yarn
yarn add kea-subscriptions

# if you're using npm
npm install --save kea-subscriptions
```

Then install the plugin:

```javascript
import { subscriptionsPlugin } from 'kea-subscriptions'
import { resetContext } from 'kea'

resetContext({
  plugins: [subscriptionsPlugin],
})
```

## Sample usage

```ts
import { kea, actions, reducers } from 'kea'
import { subscriptions } from 'kea-subscriptions'

const logic = kea([
  actions({ setMyValue: (value) => ({ value }) }),
  reducers({ myValue: ['default', { setMyValue: (_, { value }) => value }] }),
  subscriptions({ myValue: (value, oldValue) => console.log({ value, oldValue }) }),
])

logic.mount()
// [console.log] { value: 'default', oldValue: undefined }
logic.actions.setMyValue('coffee')
// [console.log] { value: 'coffee', oldValue: 'default' }
logic.actions.setMyValue('bagels')
// [console.log] { value: 'bagels', oldValue: 'coffee' }
```
