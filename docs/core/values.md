# values

The last of Kea's core concepts is `values`. You have already seen used with
`useValues` in React components:

```javascript
const { month } = useValues(logic)
```

Values are just a shorthand for accessing selectors with the store's latest state already applied.

Basically:

```javascript
logic.values.month === logic.selectors.month(store.getState())
```

That's it.

In practice, other than in React via `useValues`, you also access `values` in listeners. For example:

```jsx
const logic = kea({
  // ... actions and reducers skipped

  listeners: ({ actions, values }) => ({
    fetchDetails: async () => {
      const details = await api.fetchDetails(values.username)
      actions.setDetails(details)
    },
  }),
})
```
