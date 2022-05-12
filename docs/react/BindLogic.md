---
sidebar_position: 5
---

# BindLogic

## Avoid key prop drilling

When using a _[keyed logic](/docs/meta/key)_, such as this `itemLogic`:

```js
const itemLogic = kea([
  key((props) => props.id),
  loaders(({ props }) => ({
    item: {
      loadItem: async () => (await fetch(`/api/items/${props.id}`)).json(),
    },
  })),
  afterMount(({ actions }) => {
    actions.loadItem()
  }),
])
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

Passing that `id` around, just to reference the same logic in several related components feels repetitive.

## BindLogic

Use the `<BindLogic />` tag to remember a logic's `props` for all the nested components:

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

function ItemTitle() {
  const { item } = useValues(itemLogic)
  return <div>{item?.title}</div>
}

function ItemStatus() {
  const { item } = useValues(itemLogic)
  return <div>{item?.status}</div>
}
```

Using `<BindLogic />`, Kea stores the built logic `itemLogic({ id })` inside a React Context.
All child components that call `useValues(itemLogic)` will get that specific mounted instance of the logic.

## Getting the bound logic

To get the bound built logic and its props, use `useMountedLogic`:

```js
function ItemTitle() {
  // get a logic with the bound props
  const logic = useMountedLogic(itemLogic)
  console.log(logic.props)
  // use the built logic
  const { item } = useValues(logic)
  return <div>{item?.title}</div>
}
```
