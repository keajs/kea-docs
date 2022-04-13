# selectors

Selectors combine multiple reducers into one combined value.
They are powered by [reselect](https://github.com/reduxjs/reselect) under the hood.

Let's take this example:

```javascript
const logic = kea([
  actions({
    setMonth: (month) => ({ month }),
    setRecords: (records) => ({ records }),
  }),
  reducers({
    month: [
      '2020-04',
      {
        setMonth: (_, { month }) => month,
      },
    ],
    records: [
      [],
      {
        setRecords: (_, { records }) => records,
      },
    ],
  }),
])
```

It's a pretty simple logic that just stores two values, `records` and `month`. Our pointy-haired
boss now tasked us with showing all records that belong to the selected month. How do we do this?

A _naïve_ solution in pure react would look like this:

```jsx
function RecordsForThisMonth() {
    const { month, records } = useValues(logic)
    const recordsForSelectedMonth = records.filter(r => r.month === month)

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)}</ul>
}
```

At the end of the day this gets the job done, but there's an obvious problem here: performance.
Every time we render this component, we have to do all the work of filtering the records.

What if we could pre-calculate this list?

If you've read the React docs, you know that [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo)
is the answer:

```jsx
function RecordsForThisMonth() {
    const { month, records } = useValues(logic)

    // DO NOT do this!
    const recordsForSelectedMonth = useMemo(() => {
        return records.filter(r => r.month === month)
    }, [records, month])

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)}</ul>
}
```

This works, but it introduces another, more subtle problem: it breaks
the [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) principle.

With Kea, your React components should be pretty dumb. They should not know the internal structure
of your `records` array. Instead they should just fetch the values they need directly from `logic`.

This means we have to move this filtering of `records` into the `logic` itself.
That's where selectors come in:

```javascript
const logic = kea([
  actions({
    setMonth: (month) => ({ month }),
    setRecords: (records) => ({ records }),
  }),
  reducers({
    month: [
      '2020-04',
      {
        setMonth: (_, { month }) => month,
      },
    ],
    records: [
      [],
      {
        setRecords: (_, { records }) => records,
      },
    ],
  }),
  selectors({
    recordsForSelectedMonth: [
      (selectors) => [selectors.month, selectors.records],
      (month, records) => {
        return records.filter((r) => r.month === month)
      },
    ],
  }),
])
```

Then get the value of `recordsForSelectedMonth` directly in your component:

```jsx
function RecordsForThisMonth() {
    const { recordsForSelectedMonth } = useValues(logic)

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)}</ul>
}
```

A few things to keep in mind with selectors:

- All reducers automatically get a selector with the same name. Thus you can directly
  use the values of reducers as the input in new selectors, like we did above with
  `selectors.month` and `selectors.records`.
- Selectors are recalculated only if the value of their inputs changes. In the example above,
  no matter how often your components ask for `recordsForSelectedMonth`, they will get
  a cached response as long as `month` and `records` haven't changed since last time.
- The order of selectors doesn't matter. If you add another selector called
  `sortedRecordsForSelectedMonth`, it can be defined either before or after `recordsForSelectedMonth`.
  As long as you don't have circular dependencies, the order doesn't matter.

At the end of the day, `selectors` themselves are simple functions, which just take as input
the redux store's current state, traverse it and return the value you're looking for:

```javascript
logic.selector = (state) => state.path.to.logic
logic.selectors.month = (state) => logic.selector(state).month

logic.selectors.month(store.getState()) === '2020-04'
```

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

## Props in Selectors

Since `selectors` need to be recalculated when their inputs change, there's a twist when
using `props` with them.

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

Previously [we defined](/docs/BROKEN) a selector as a function like this:

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
      (selectors) => [selectors.counter, (_, props) => props.defaultCounter],
      (counter, defaultCounter) => counter - defaultCounter,
    ],
  }),
])
```
