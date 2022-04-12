---
id: connect
title: Connect
sidebar_label: Connect
---

`connect(options)` is a shorthand for `kea({ connect: options })`

It's very handy for connecting actions and values to class components.

## Usage

```javascript
import React, { Component } from 'react'
import { connect } from 'kea'

import menuLogic from '../menu/logic'

@connect({
  actions: [
    menuLogic, [
      'openMenu',
      'closeMenu'
    ]
  ],
  values: [
    menuLogic, [
      'isOpen as isMenuOpen'
    ]
  ]
})
export default class MyComponent extends Component {
  render () {
    const { isMenuOpen } = this.props
    const { openMenu, closeMenu } = this.actions

    return (
      <div>
        <button onClick={isMenuOpen ? closeMenu : openMenu}>Toggle menu</button>
      </div>
    )
  }
}
```