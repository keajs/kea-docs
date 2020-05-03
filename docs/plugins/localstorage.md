---
id: localstorage
title: LocalStorage
sidebar_label: LocalStorage
---

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
To make a reducer persist in LocalStorage, your logic *must* have a `path`.

Use the [`babel-kea-plugin`](/docs/guide/debugging#automatic-paths-with-babel) to
automatically generate paths for every logic. 
:::

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
