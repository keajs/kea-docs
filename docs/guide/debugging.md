---
id: debugging
title: Debugging
sidebar_label: Debugging
---

import useBaseUrl from '@docusaurus/useBaseUrl'; 

## Devtools

Currently there are no kea-specific devtools available. However the Redux devtools work really
well. 

Get them for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

<img alt="Redux Devtools" src={useBaseUrl('img/guide/redux-devtools.png')} style={{ maxWidth: 662 }} />


## Path

If you explore your store's state in the devtools, you'll notice that every kea logic is
mounted under a path like `kea.inline.1`. In order to help debugging, you may manually specify
a `path` for your logic. 

```javascript
kea({
    path: () => ['scenes', 'dashboard', 'index']
})
```

If you use a `key` in your logic, it'll be passed as the first argument to the `path` function.

```javascript
kea({
    key: (props) => props.id,
    path: (key) => ['scenes', 'dashboard', 'index', key]
})
```

## Automatic Path Generation with Babel

If you're using Babel to transpile your code, check out the [babel kea plugin](https://github.com/keajs/babel-plugin-kea).
It can generate a paths for you automatically.

First install the package:

```bash
# with yarn
yarn add babel-plugin-kea --dev

# with npm
npm install babel-plugin-kea --save-dev
```

Then add it to the list of plugins in `.babelrc`:

```json5
{
  "plugins": [
    "babel-plugin-kea"
  ]
}
```

Logic paths are scoped from your app's root path. If you wish to skip a few parts of the path, 
for example if your frontend lives under `frontend/src` and you don't want every kea path to start 
with `frontend.src`, specify it in the config as follows:

```json5
{
  "plugins": [
    ["babel-plugin-kea", { path: './frontend/src' }]
  ]
}
```
