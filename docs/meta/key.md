## Keyed logic

If you give your logic a `key`, you can have multiple independent copies of it. 

The key is derived from `props` when building:

```javascript
const userLogic = kea([
  key((props) => props.id), // 🔑 the key

  actions({
    loadUser: true,
    userLoaded: (user) => ({ user }),
  }),

  reducers({
    user: [null, { userLoaded: (_, { user }) => user }],
  }),

  // more on events in a section below.
  events(({ actions }) => ({
    afterMount: [actions.loadUser],
  })),

  listeners(({ props }) => ({
    loadUser: async () => {
      const user = await api.getUser({ id: props.id })
      actions.userLoaded(user)
    },
  })),
])
```

Now every time you call `userLogic({ id: 1 })` with a new `id`, a completely independent
logic will be built and mounted.

## Usage with React

Pass the relevant props to the logic, to use the right key:

```jsx
function User({ id }) {
  const { user } = useValues(userLogic({ id }))

  return user ? (
    <div>
      {user.name} ({user.email})
    </div>
  ) : (
    <div>Loading...</div>
  )
}
```

No matter how many times `<User id={1} />` is rendered by React, it'll always be connected
to the same logic.

If you render `<User id={2} />`, it'll however get its own independent copy of this same base logic
and do what is needed to load and display the second user.

In case you have many nested components and don't always want to pass down the `id` prop, have a look at [BindLogic](/docs/react/BindLogic).
