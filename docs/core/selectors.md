---
sidebar_position: 3
---

# selectors

## Select from the state

Selectors are used to get specific values from the state object.

At it's core, a selector is just a function in the format:

```ts
const someValueSelector = (state: Record<string, any>) => state.some.value.from.the.state.object
```

## Automatically created for reducers

Each reducer automatically gets a corresponding selector:

```ts
const rootLogic = kea([
  // our path is "state.root.logic"
  path(['root.logic']),
  // add reducer "pieceOfData"
  reducers({ pieceOfData: ['default value', {}] }),
])

// the following are added to the logic
rootLogic.reducers.pieceOfData = () => 'default value'
rootLogic.selectors.pieceOfData = (state) => state.root.logic.pieceOfData
```

## Values

Every selector has a corresponding `value`. Values are just a shorthand for selectors on the current `state` of the store.

Basically:

```javascript
logic.values.pieceOfData === logic.selectors.pieceOfData(store.getState())
```

That's it.

Use values anywhere in your listeners or elsewhere, where you need to access the current value of a reducer or selector.

## Computed values

Use the `selectors` builder to create selectors which combine and cache other selectors:

```javascript
const logic = kea([
  actions({
    setMonth: (month) => ({ month }),
    setRecords: (records) => ({ records }),
  }),
  reducers({
    month: ['2020-04', { setMonth: (_, { month }) => month }],
    records: [[], { setRecords: (_, { records }) => records }],
  }),
  selectors({
    recordsForSelectedMonth: [
      (s) => [s.month, s.records],
      (month, records) => records.filter((r) => r.month === month),
    ],
  }),
])
```

The `s` is a shorthand for `selectors`, which just equals `logic.selectors`.

Now you can use `recordsForSelectedMonth` directly in your component:

```jsx
function RecordsForThisMonth() {
  const { recordsForSelectedMonth } = useValues(logic)

  return (
    <ul>
      {recordsForSelectedMonth.map((r) => (
        <li>{r.name}</li>
      ))}
    </ul>
  )
}
```

## Caching

Selectors are recalculated only if the value of their inputs changes. In the example above,
no matter how often your components ask for `recordsForSelectedMonth`, they will get
a cached response as long as `month` and `records` haven't changed since last time.

## Single source of truth

It is good practice to have as many selectors as possible, each of which sort or filter the _raw_ data
stored in your reducers further than the last.

It is bad practice to have listeners do this filtering. For example, you should **not** write code,
where on the action `selectUser(id)`, you run a listener that takes the stored value of `users`,
filters it to finds the selected user and then calls another action `setUser` to store this value
in the `user` reducer.

Such an approach will violate the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)
principle. You will end up with two copies of this one user in your store. If you change something in `user`,
should you also change the same data in `users`?

Instead, on `selectUser(id)`, store `selectedUserId` in a reducer. Then create a new selector `user`
that combines `selectedUserId` and `users` to dynamically find the selected user.

You'll have a lot less bugs this way. 😉

## Selectors that return functions

It's also possible to return a function in a selector. Here's a selector that returns a function that finds an user by `id`:

```javascript
const usersLogic = kea([
  loaders({ users: { loadUsers: api.loadUsers } }),
  selectors({
    findById: [
      (selectors) => [selectors.uesrs],
      (users) => (id: number) => users.find((user) => user.id === id),
    ],
  }),
])

usersLogic.mount()
const user = usersLogic.values.findById(12)
```

## Props in Selectors

Since `selectors` need to be recalculated when their inputs change, there's a twist when
using [`props`](/docs/meta/props) with them.

Take the following buggy code:

```javascript
const counterLogic = kea([
  // ...
  selectors(({ props }) => ({
    diffFromDefault: [
      (selectors) => [selectors.counter],
      (counter) => counter - props.defaultCounter, // DO NOT do this!
    ],
  })),
])
```

The code will work, but only partially.
The problem is that the value of `diffFromDefault` will only be updated when `counter` changes,
but not when `props.defaultCounter` changes.

What if we would also like to update the selector when the props change?

Previously we defined a selector as a function like this:

```javascript
const selector = (state) => state.path.to.something.counter
```

That's an incomplete definition. All selectors have a second argument called `props`.

```javascript
const selector = (state, props) => state.path.to.something.counter + props.defaultCounter
```

To make your new selector update itself when props change, use an inline
selector that picks the right value from `props`:

```javascript
const counterLogic = kea([
  // ...
  selectors({
    diffFromDefault: [
      (s) => [s.counter, (_, props) => props.defaultCounter],
      (counter, defaultCounter) => counter - defaultCounter,
    ],
  }),
])
```

## Custom isEquals

Selectors input arrays take a third element, a custom `isEquals` function, which will be used to compare each input selector's value. For example:

```ts
import { kea, selectors, reducers } from 'kea'

const logic = kea([
  reducers({ values: [[]] }),
  selectors({
    reversedValues: [
      (s) => [s.values],
      (values) => [...values].reverse(),
      // using default isEqualș: (a, b) => a === b
    ],
    reversedValuesIfLengthChanges: [
      (s) => [s.values],
      (values) => [...values].reverse(),
      (a, b) => a.length === b.length,
    ],
  }),
])
```
