---
id: localstorage
title: LocalStorage
sidebar_label: LocalStorage
---

## LocalStorage

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
import localStoragePlugin from 'kea-localstorage'
import { resetContext } from 'kea'

resetContext({
    createStore: true,
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

**NB!** To make a reducer persist in LocalStorage, your logic store **must** have a defined `path`.

Just add `{ persist: true }` as an option to your reducers, and it will be stored:

```javascript
const logic = kea({
    // path must be defined!
    path: () => ['scenes', 'homepage', 'name'],

    actions: ({ constants }) => ({
        updateName: (name) => ({ name }),
    }),

    reducers: ({ actions, constants }) => ({
        // just add { persist: true }
        name: [
            'chirpy',
            { persist: true },
            {
                [actions.updateName]: (state, payload) => payload.name,
            },
        ],
        // you may override the prefix and separator keys
        name: [
            'chirpy',
            { persist: true, prefix: 'example', separator: '_' },
            {
                [actions.updateName]: (state, payload) => payload.name,
            },
        ],
    }),
})
```

## Example

Update the counter and refresh the page. The number should remain:

TODO: CodeSandbox

_Note: if you refresh, it may flash the number 0 for a brief moment, as that's what's stored in the pre-rendered HTML that's served when you open the page. It should then immediately update._
