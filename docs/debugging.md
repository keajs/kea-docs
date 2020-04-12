---
id: debugging
title: Debugging Kea
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
