---
id: react
title: Using with React
sidebar_label: Using with React
---

Kea supports both, `function` and `Class` components.

## Functional Components

You use hooks to fetch actions and values from your logic.
Here are the two most common Hooks.
See the [Hooks API reference](/docs/BROKEN) for two more!

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
[`useAllValues`](/docs/BROKEN) if you need to do this.
:::

## Class Components

### `logic(Component)`

If you wrap your `Component` inside a `logic`, it'll get all the `values` and `actions` as props.

```jsx
const logic = kea({
  actions: {
    doSomething: true,
    doSomethingElse: true,
  },
  reducers: {
    firstOne: ['default', { doSomething: () => 'did it' }],
    secondOne: ['default', { doSomething: () => 'did it' }],
  },
})

class MyComponent extends Component {
  render() {
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
the [explicit connections](/docs/BROKEN) section under Additional Concepts,
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
  actions: [menuLogic, ['openMenu', 'closeMenu']],
  values: [menuLogic, ['isOpen as isMenuOpen'], accountLogic, ['currentUser']],
})
class MyComponent extends Component {
  render() {
    const { currentUser } = this.props
    const { closeMenu } = this.actions

    return <button onClick={closeMenu}>{currentUser.name}</button>
  }
}
```

## BindLogic

When using a **[keyed logic](/docs/BROKEN)**, such as this `itemLogic`:

```js
const itemLogic = kea({
  key: (props) => props.id,
  loaders: ({ props }) => ({
    item: {
      loadItem: async () => (await fetch(`/api/items/${props.id}`)).json(),
    },
  }),
  events: ({ actions }) => ({
    afterMount: [actions.loadItem],
  }),
})
```

you might end up in a nested hierarchy such as this:

```js
function Item({ id }) {
  return (
    <div>
      <ItemTitle id={id} />
      <ItemStatus id={id} />
    </div>
  )
}

function ItemTitle({ id }) {
  const { item } = useValues(itemLogic({ id }))
  return <div>{item?.title}</div>
}

function ItemStatus({ id }) {
  const { item } = useValues(itemLogic({ id }))
  return <div>{item?.status}</div>
}
```

Redux (that Kea is built on) was supposed to save us from passing down props everywhere, so this is a bummer. Until Kea 2.3
you only had three options in this case:

1. Pass around the `id` like above.
2. Pass along the entire `item`. This works if it's just one thing and a few components to pass it to. If your children
   also need access to some actions and other values from `itemLogic({ id })`, you're in for a mess.
3. Pass along the `const logic = itemLogic({ id })` as `<ItemTitle logic={logic} />` so the children can just use
   `useValues(logic)`. Clunky, but at least straightforward.

Starting with Kea 2.3 you can use the tag `<BindLogic />`:

```jsx
function Item({ id }) {
  return (
    <BindLogic logic={itemLogic} props={{ id }}>
      <div>
        <ItemTitle />
        <ItemStatus />
      </div>
    </BindLogic>
  )
}
```

Thus you can just write:

```jsx
function ItemTitle() {
  const { item } = useValues(itemLogic)
  return <div>{item?.title}</div>
}

function ItemStatus() {
  const { item } = useValues(itemLogic)
  return <div>{item?.status}</div>
}
```

Using `<BindLogic />`, Kea stores the built logic `itemLogic({ id })` inside a **React Context**.
All child components that call `useValues(itemLogic)` will get that specific mounted instance of the logic.

<br />

:::note Next steps

- Using [TypeScript](/docs/BROKEN)? Read how it works with Kea!
- Read about [Debugging](/docs/BROKEN) to be even more productive when working with Kea!  
  :::
