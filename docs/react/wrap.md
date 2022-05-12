---
sidebar_position: 6
---

# wrap

## Wrap components

If you `wrap` your `Component` inside a `logic`, it'll get all the `values` and `actions` as props.

This works for both class and functional components.

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

// Two identical lines, as `logic(Component)` is a shorthand for `logic.wrap(Component)`
const MyConnectedComponent = logic(MyComponent)
const MyConnectedComponent = logic.wrap(MyComponent)
```
