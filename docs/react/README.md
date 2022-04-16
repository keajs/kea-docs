---
sidebar_position: 4
---

# React

## Hooks for functional components

You use hooks to fetch actions and values from your logic.  When you use a Hook, Kea makes sure the logic is mounted as your component renders and gets
automatically unmounted when your component is removed from React.

- [`useActions`](/docs/react/useActions)
- [`useAllValues`](/docs/react/useAllValues)
- [`useMountedLogic`](/docs/react/useMountedLogic)
- [`useValues`](/docs/react/useValues)

## Wrapping for class components

If you wrap your `Component` inside a `logic`, it'll get all the `values` and `actions` as props.

```jsx
const logic = kea([
  actions({
    doSomething: true,
    doSomethingElse: true,
  }),
  reducers({
    firstOne: ['default', { doSomething: () => 'did it' }],
    secondOne: ['default', { doSomething: () => 'did it' }],
  }),
])

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

## BindLogic

Use React Context to remember a logic's props down the tree. [Read more here](BindLogic)