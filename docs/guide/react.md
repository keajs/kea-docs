---
id: react
title: Using with React
sidebar_label: Using with React
---

Kea supports both, `function` and `Class` components.

## Functional Components

You use hooks to fetch actions and values from your logic.
Here are the two most common Hooks.
See the [Hooks API reference](/docs/api/hooks) for two more!

When you use a Hook, Kea makes sure the logic is mounted as your component renders and gets
automatically unmounted when your component is removed from React.

### `useActions`

Fetch actions from a logic.
   
```jsx
import { kea, useActions } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { increment } = useActions(logic)

  return <button onClick={increment}>Increment</button>
}
```

### `useValues`

Fetch values from a logic.

```jsx
import { kea, useValues } from 'kea'

const logic = kea({ ... })

function MyComponent () {
  const { counter, doubleCounter } = useValues(logic)

  return <div>{counter} * 2 = {doubleCounter}</div>
}
```

:::note
**Please Note!** You can only use `useValues` with destructoring:
 
```javascript
const { a, b } = useValues(logic)
```

This is because internally `useValues` uses [getter functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 
that call react-redux's [`useSelector`](https://react-redux.js.org/next/api/hooks#useselector) 
hooks when a value is accessed. Because hooks need to always be called in the same order, 
you _can't_ just store the object returned from `useValues` and then use its properties later in 
the code. Doing so might call the internal hooks in an unspecified order. Use
[`useAllValues`](/docs/api/hooks#useallvalues) if you need to do this.
:::
    
## Class Components

### `logic(Component)`

If you wrap your `Component` inside a `logic`, it'll get all the `values` and `actions` as props.

```jsx
const logic = kea({
    actions: () => ({
        doSomething: true,
        doSomethingElse: true,
    }),
    reducers: () => ({
        firstOne: ['default', { doSomething: () => 'did it' }],
        secondOne: ['default', { doSomething: () => 'did it' }]
    })
})

class MyComponent extends Component {
    render () {
        const { firstOne, secondOne } = this.props
        
        // The following two lines are equivalent as
        // `this.actions` is a shorthand for `this.props.actions`
        const { doSomething, doSomethingElse } = this.actions
        const { doSomething, doSomethingElse } = this.props.actions
        
        return <div />
    }
}

const MyConnectedComponent = logic(MyComponent)
```
 
### `connect`

In case you don't want to hook up everything in a `logic` to your `Component` or if you
want to mix and match values from multiple logics, use `kea({ connect: { ... } })` as discussed in 
the [explicit connections](/docs/guide/additional#explicit-connections) section under Additional Concepts, 
to create a new logic with only the actions and values you need. Then wrap your `Component` in that.

If you go for this route, you can use a small helper function called `connect`, which is literally just:

```javascript
const connect = (args) => kea({ connect: args })
``` 

You use it like so:

```jsx
import { connect } from 'kea'

const logic = connect({ 
    actions: [
        menuLogic, [
            'openMenu',
            'closeMenu'
        ]
    ],
    values: [
        menuLogic, [
            'isOpen as isMenuOpen'
        ],
        accountLogic, [
            'currentUser'
        ]
    ]
})

class MyComponent extends Component { ... }

const MyConnectedComponent = logic(MyComponent)
```

In case you don't fear experimental JS syntax, you can use [legacy decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#legacy)
and simplify your code down a bit:

```jsx
import { connect } from 'kea'

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
        ],
        accountLogic, [
            'currentUser'
        ]
    ]
})
class MyComponent extends Component {
    render () {
        const { currentUser } = this.props
        const { closeMenu } = this.actions

        return <button onClick={closeMenu}>{currentUser.name}</button>
    }
}
```

<br />

:::note Next steps
* Read about [Debugging](/docs/guide/debugging) to be even more productive when writing Kea code.  
:::