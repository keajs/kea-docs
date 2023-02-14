# localstorage

You may store the content of your reducers in LocalStorage with the [`kea-localstorage`](https://github.com/keajs/kea-localstorage) plugin.

## Installation

First install the [`kea-localstorage`](https://github.com/keajs/kea-localstorage) package:

```shell
# if you're using yarn
yarn add kea-localstorage

# if you're using npm
npm install --save kea-localstorage
```

Then install the plugin:

```javascript
import { localStoragePlugin } from 'kea-localstorage'
import { resetContext } from 'kea'

resetContext({
  plugins: [localStoragePlugin],
})
```

## Configuration options

The plugin takes the following options:

```javascript
localStoragePlugin({
  // in case you want to replace this, e.g. for tests or non browser environments
  storageEngine: window.localStorage,

  // added before all paths in localStorage keys
  prefix: 'example',

  // to change the symbol that concats path parts
  separator: '_',
})
```

## Usage

:::note
To make a reducer persist in LocalStorage, your logic _must_ have a `path`.  See the [debugging](/docs/intro/debugging#logic-path) docs for more details.
:::

Just add `{ persist: true }` as an option to your `reducers`, or use the special `persistReducer` builder instead:

```javascript
import { kea, reducers } from 'kea'
import { persistReducer } from 'kea-localstorage'
const logic = kea([
  // path must be defined!
  path(['scenes', 'homepage', 'name']),

  actions({
    updateName: (name) => ({ name }),
  }),

  reducers({
    // just add { persist: true }
    name: [
      'chirpy',
      { persist: true },
      {
        updateName: (state, payload) => payload.name,
      },
    ],
    // you may override the prefix and separator keys
    complexName: [
      'chirpy',
      { persist: true, prefix: 'example', separator: '_' },
      {
        updateName: (state, payload) => payload.name,
      },
    ],
    // this is not persisted here, but below
    notAlreadyPersisted: ['name', {}]
  }),
  
  // logic builder to persist existing reducers
  persistReducer('notAlreadyPersisted')
])
```

:::note
Please be aware that under the hood `kea-localstorage` overrides the default value for the reducer with whatever was stored in `localStorage`. This means that **any listeners** hooked to any actions related to the reducer will **not be triggered** (this is also due to the fact that a reducer may have multiple actions, and there's no way of knowing which one to trigger).
:::

### `storageKey`

Pass a `storageKey`, to override the key used for storage. This allows multiple logics to share the same value. For example
to have all keyed logics store a reducer globally.

```js
const someLogic = kea([
  key(props => props.key), // not used for localstorage, overridden by storageKey
  reducers(({ actions }) => ({
    persistedValue: [0, { persist: true, storageKey: 'my.global.key' }, {
      [actions.change]: (_, payload) => payload.value
    }]
  }))
])
```