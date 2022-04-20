## Props

When you build a `logic`, you can pass it an object that will be stored as `props`:

```javascript
const props = { id: 10 }
const logic = kea([])

logic.build(props).props === logic(props).props === props
```

Calling [`logic(props)`](/docs/meta/logic#logic-1) or [`logic.build(props)`](/docs/meta/logic#logicbuildprops) is a fast operation. Only the `props` on the logic will be updated in case the
logic is already mounted. Thus it's safe to call from a React component.


## Defaults from React

You can pass random data from React onto the logic this way. For example various defaults.

It's as simple as this:

```jsx
function FancyPantsCounter() {
  // without props
  const { counter } = useValues(counterLogic)
  // with props
  const { counter } = useValues(counterLogic({ defaultCounter: 1000 }))

  // ...
}
```

Then just use `props` wherever you need to. For example:

```javascript
const counterLogic = kea([
  actions({
    increment: (amount) => ({ amount }),
    decrement: (amount) => ({ amount }),
  }),
  reducers(({ props }) => ({
    counter: [
      props.defaultCounter || 0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  })),
  listeners(({ props }) => ({
    increment: ({ amount }) => {
      console.log(`incrementing by ${amount}`)
      console.log(`default ${props.defaultCounter || 0}`)
    },
  })),
])
```
