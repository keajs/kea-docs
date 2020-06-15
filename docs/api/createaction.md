---
id: createaction
title: CreateAction
sidebar_label: CreateAction
---

Create actions which you can use in your kea reducers. These are **not** bound to dispatch.

## Usage

```javascript
import { createAction } from 'kea'

const newAction = createAction('description', (id, value) => ({ id, value }))

const someLogic = kea({
  actions: {
    myAction: true
  },

  reducers: ({ actions }) => ({
    myValue: [false, PropTypes.bool,
      [actions.myAction]: () => true,
      [newAction]: () => false
    ]
  })
})

// somewhere else
store.dispatch(newAction(12, 'bla'))
```