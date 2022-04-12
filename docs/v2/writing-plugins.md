---
id: writing-plugins
title: Writing plugins
---

When you find yourself writing repetitive code, it's time to extract it into a plugin.

## Extending logic

Kea has a powerful system for authoring plugins, yet at their core, most plugins simply
call [`logic.extend()`](/docs/guide/advanced#extending-logic) and add a few
actions, reducers or listeners to your logic.

If that's all you want to do, it's often not even needed to write a real plugin. A simple
function will do.

For example here's a function that just adds an `isLoading` state to your logic:

```javascript
function addLoading(logic, startAction, stopAction) {
  logic.extend({
    reducers: {
      isLoading: [
        false,
        {
          [startAction]: () => true,
          [stopAction]: () => false,
        },
      ],
    },
  })
}

const logic = kea({
  actions: {
    fetchRepositories: (username) => ({ username }),
    fetchedRepositories: (repositories) => ({ repositories }),
  },

  reducers: {
    repositories: [
      null,
      {
        fetchedRepositories: (_, { repositories }) => repositories,
      },
    ],
  },

  listeners: {
    fetchRepositories: async ({ username }) => {
      const repositories = await api.getRepositories(username)
      actions.fetchedRepositories(repositories)
    },
  },
})

addLoading(logic, 'fetchRepositories', 'fetchedRepositories')
```

## Basic plugin structure

This works, but what if we want to instead do something like this:

```javascript
const logic = kea({
  actions: {
    fetchRepositories: (username) => ({ username }),
    fetchedRepositories: (repositories) => ({ repositories }),
  },

  reducers: {
    repositories: [
      null,
      {
        fetchedRepositories: (_, { repositories }) => repositories,
      },
    ],
  },

  listeners: {
    fetchRepositories: async ({ username }) => {
      const repositories = await api.getRepositories(username)
      actions.fetchedRepositories(repositories)
    },
  },

  loading: {
    start: 'fetchRepositories',
    stop: 'fetchedRepositories',
  },
})
```

For this we will write an actual plugin `myOwnLoadingPlugin` and later activate it via the
`plugins` array on [`resetContext`](/docs/api/context#resetcontext).

We just need to move around the code from `addLoading` above and place it into the appropriate
structure.

This is what such a plugin would look like:

```javascript
const myOwnLoadingPlugin = () => ({
  name: 'myOwnLoading',

  events: {
    // this is run after the steps that convert input into logic
    afterLogic(logic, input) {
      // skip if there's no `loading` in the input
      if (!input.loading) {
        return
      }

      // Call the `loading` function, passing the current logic to it.
      // This is how and why you can do things like
      // `listeners: ({ actions }) => ({ ... })`
      const { start, stop } =
        typeof input.loading === 'function' ? input.loading(logic) : input.loading

      // extend the logic with the { start, stop } that we get back
      logic.extend({
        reducers: {
          isLoading: [
            false,
            {
              [start]: () => true,
              [stop]: () => false,
            },
          ],
        },
      })
    },
  },
})

export default resetContext({
  plugins: [
    // ... other plugins,
    myOwnLoadingPlugin,
  ],
})
```

Pretty simple stuff.

## Plugin Build Steps

The above code probably works well enough, but there's one catch: it's run after
all the other steps (`actions`, `reducers`, `selectors`, etc) are done. Depending on what you're
building, that might not be enough. Luckily there's also a way to also control _when_ this
`isLoading` reducer is added to your logic.

That's where `buildSteps` come in.

The core of Kea is just an engine that converts `input` into `logic` through various
`buildSteps`.

In fact, [this is the actual code](https://github.com/keajs/kea/blob/master/src/core/index.js) for the `core` plugin:

```javascript
// core plugin
export default {
  name: 'core',

  defaults: {
    cache: {},
    connections: {},
    constants: {},
    actionCreators: {},
    actionKeys: {},
    actions: {},
    defaults: {},
    reducers: {},
    reducerOptions: {},
    reducer: undefined,
    selector: undefined,
    selectors: {},
    values: {},
    propTypes: {},
    events: {},
  },

  buildSteps: {
    connect: createConnect,
    constants: createConstants,
    actionCreators: createActionCreators,
    actions: createActions,
    defaults: createDefaults,
    reducers: createReducers,
    reducer: createReducer,
    reducerSelectors: createReducerSelectors,
    selectors: createSelectors,
    values: createValues,
    events: createEvents,
  },
}
```

The `core` plugin just runs each of these steps one by one.

Here are (slightly abbreviated) steps for `actionCreators` and `actions`:

```javascript
import { createAction, getContext } from 'kea'

export function createActionCreators(logic, input) {
  if (!input.actions) {
    return
  }

  const actionCreators = typeof input.actions === 'function' ? input.actions(logic) : input.actions

  Object.keys(actionCreators).forEach((key) => {
    logic.actionCreators[key] = createAction(`${key} (${logic.pathString})`, actionCreators[key])
  })
}

export function createActions(logic, input) {
  Object.keys(logic.actionCreators).forEach((key) => {
    const action = logic.actionCreators[key]
    logic.actions[key] = (...inp) => getContext().store.dispatch(action(...inp))
  })
}
```

There's no magic here. Kea just converts `input` into `logic`, doing whatever
transformations are necessary.

Thanks to the `buildSteps`, your new plugin can run custom code before or after
any of these steps.

If you want to add the `isLoading` reducer after all the other reducers, but before
the `selectors`, this is what you should do:

```javascript
const myOwnLoadingPluginVersion2 = () => ({
  name: 'myOwnLoading',

  buildOrder: {
    loading: { after: 'reducers' },
  },

  buildSteps: {
    // this is run before the steps that convert input into logic
    loading(logic, input) {
      // skip if there's no `loading` in the input
      if (!input.loading) {
        return
      }

      // call the `loading` function, passing the current logic to it
      const { start, stop } = input.loading(logic)

      // and extend the logic with the results
      logic.extend({
        reducers: {
          isLoading: [
            false,
            {
              [start]: () => true,
              [stop]: () => false,
            },
          ],
        },
      })
    },
  },
})

export default resetContext({
  plugins: [
    // ... other plugins,
    myOwnLoadingPluginVersion2,
  ],
})
```

It's as simple as that.

Sometimes it's necessary to directly modify the `logic`, like the `buildActionCreators`
and `buildActions` steps did above. However for this `myOwnLoadingPluginVersion2` it
doesn't really matter.

You should, however, **never** modify the `input` in any way in your plugins! The idea is that
every time you build and mount your logic, it should work the same way. Modifying the input
breaks that contract and the build step might produce different results. It's best to avoid that.

<br />

:::note Next steps

- If you want to learn more about writing plugins, it's best to just read the code
  of some of the existing plugins and see how they do things.

- See the [plugins API page](/docs/api/plugins) for a list of everything that a plugin can do.
  :::
