---
sidebar_position: 0
---

# kea

## Logic builders

To build a logic, you give `kea` an array of logic builders.

Before a logic is mounted, it is built, and all logic builders are run in succession:

```ts
import { kea, actions, BuiltLogic } from 'kea'

const logic = kea([
  // add `setUsername` action to logic
  actions({
    setUsername: (username) => ({ username }),
  }),
  // add `username` reducer, selector and value to logic
  reducers({
    username: ['keajs', { setUsername: (_, { username }) => username }],
  }),

  // do something custom
  (logic: BuiltLogic) => {
    logic.cache.foobar = logic.actions.setUsername
  },

  // a logic builder that calls another logic builder inside it
  (logic: BuiltLogic) => {
    actions({
      setPassword: (password) => ({ password }),
    })(logic)
  },
])
```

A logic builder has the format `(logic: BuiltLogic) => { /* anything */ }`, and its job is to modify [any of the properties](/docs/meta/logic#properties) of a `logic`.

Normally you don't manipulate properties of your logic directly, but you use wrap core builders like `actions` and `listeners` instead.

:::note
Technically, functions like `actions` and `reducers` are _logic-builder-builders_, since they return a `LogicBuilder`, but, to keep
everyone's mental health expenses down, we're calling all functions that return logic builders, like `actions` or `listeners`, just "builders" for short.
:::

You can build powerful abstractions when you nest builders. For example, here's a `setters` builder,
which creates a `thing` reducer, and a corresponding `setThing` action, for every `thing` key it finds in its `input`:

```ts
import { kea, actions, reducers } from 'kea'

const capitalize = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

function setters(input: Record<string, any>) {
  return (logic) => {
    for (const [key, value] of Object.entries(input)) {
      actions({ [`set${capitalize(key)}`]: (value) => ({ [key]: value }) })(logic)
      reducers({ [key]: [value, { [`set${capitalize(key)}`]: (_, p) => p[key] }] })(logic)
    }
  }
}

const loginLogic = kea([
  setters({ username: 'keajs', password: '' }), // much shorter
])
loginLogic.mount()
loginLogic.actions.setUsername('posthog')
loginLogic.values.username === 'posthog'
loginLogic.values.password === ''
```

I'd _prefer_ using `actions` and `reducers` directly myself, but who knows, maybe `setters` can simplify your app.

If not, perhaps you will use the [`kea-forms`](/docs/plugins/forms) plugin at some point. It's built exactly the same way: you pass
`forms()` a few input parameters, and it'll add the relevant `actions` and `values` to your `logic`:

```ts
import { kea, forms } from 'kea'

const logic = kea([
  forms({
    signupForm: {
      defaults: { username: '', password: '' },
      errors: ({ password }) => ({
        password: password.length < 8 ? 'password too short' : undefined,
      }),
      submit: ({ username, password }) => api.fetchSignupResponse(username, password),
    },
  }),
])

logic.mount()
logic.actions.setSignupFormValue('password', 'asd')
logic.values.signupFormErrors.password === 'password too short'

logic.actions.submitSingupForm()
logic.values.isSignupFormSubmitting === true
```

It's a very practical way to build frontend apps.

## Input objects vs functions

Whenever you're using any of kea's built-in primitives (`actions`, `reducers`, `listeners`, etc), you have two options.

You can pass objects to them:

```javascript
kea([
  actions({
    increment: true,
  }),
  listeners({
    increment: () => {
      console.log('incrementing!')
    },
  }),
])
```

... or you can pass functions to them, which take the same `logic` as their only input, and get evaluated only on build:

```javascript
kea([
  actions((logic) => ({
    increment: true,
  })),
  listeners((logic) => ({
    increment: () => {
      console.log('incrementing!')
    },
  })),
])
```

You can get `actions`, `values` and other goodies from this `logic`:

```javascript
kea([
  listeners(({ actions, values }) => ({
    increment: () => {
      if (values.iHaveHadEnough) {
        actions.doSomethingElse()
      }
    },
  })),
])
```

The recommendation is to write the simplest code you can (start with `reducers({})`), and convert it into a function when
you need any data from the logic.

There's one more case when converting the input to a function is useful. Sometimes, due to the order in which your
browser loads modules, some imported values will be `undefined` when the code first runs. For example: 

```javascript
import { kea, connect } from 'kea'
import { otherLogic } from './otherLogic'

const logic = kea([
  connect(otherLogic), // if this is `undefined` when this code is executed
  connect(() => otherLogic), // wrap it in a function to load lazily
])
```

## Kea 2.0 input object syntax

Up until Kea 2.0, instead of logic builders, you could pass an object to `kea({})`:

```javascript
const logic = kea({
  actions: {
    increment: (amount = 1) => ({ amount }),
    decrement: (amount = 1) => ({ amount }),
  },
  reducers: {
    counter: [
      0,
      {
        increment: (state, { amount }) => state + amount,
        decrement: (state, { amount }) => state - amount,
      },
    ],
  },
})
```

This object would then be evaluated in a predefined order.

That syntax still works, and most Kea 2.0 code should function as is in 3.0. However, it's strongly encouraged
to use the new 3.0 builders syntax going forward.
