# Context

Kea stores all of its runtime data on a context. When you import `kea`, it comes with a default empty context.

## resetContext

Call `resetContext` before you render your app and connect all the different plugins to it.

Here are all the options you can pass to it:

```javascript
import { resetContext } from 'kea'

export default resetContext({
  // Plugins
  plugins: [sagaPlugin, loadersPlugin, routerPlugin],

  // Create a redux store when resetting the context (no options).
  createStore: true,

  // Create a redux store when resetting the context (with options).
  createStore: {
    // otherwise pass the following
    // what root paths are available for kea
    paths: ['kea', 'scenes'],

    // additional reducers that your app uses
    reducers: {},

    // preloaded state for redux, used only with all non-kea reducers
    preloadedState: undefined,

    // middleware that gets passed to applyMiddleware(...middleware)
    middleware: [],

    // the compose function, defaults to the one from redux-devtools-extension or compose from redux
    compose: composeWithDevTools || compose,

    // gets passed to compose(middleware, ...enhancers)(createStore)
    enhancers: [],
  },

  // global defaults for specific logic
  defaults: {
    scenes: {
      some: {
        logic: { key: 'value' },
      },
    },
  },

  // make a lot of noise
  debug: false,

  // after calling const builtLogic = logic.build(); builtLogic.mount(),
  // make fields like builtLogic.actions available on logic
  proxyFields: true,

  // if true, the defaults option takes keys like defaults:
  // --> { 'scenes.some.logic': { key: 'value' } }
  // if false, the defaults option takes keys like defaults:
  // --> { scenes: { some: { logic: { key: 'value' } } } }
  flatDefaults: false,

  // how to regenerate the store when attaching a reducer to redux
  // - dispatch = dispatch a ATTACH_REDUCER action
  // - replace = silently replace the root reducer
  attachStrategy: 'dispatch',

  // how to regenerate the store when detaching a reducer to redux
  // - dispatch = dispatch a DETACH_REDUCER action
  // - replace = silently replace the root reducer
  // - persist = never remove reducers from redux
  detachStrategy: 'dispatch',
})
```

## getContext

Call `getContext()` from anywhere to peek into the context

```javascript
import { getContext } from 'kea'

getContext() ==
  {
    plugins: {
      activated: [],
      buildOrder: [],
      buildSteps: {},
      events: {},
      logicFields: {},
      contexts: {},
    },

    input: {
      logicPathCreators: new Map(),
      logicPathCounter: 0,
      defaults: undefined,
    },

    build: {
      cache: {},
      heap: [],
    },

    mount: {
      counter: {},
      mounted: {},
    },

    reducers: {
      tree: {},
      roots: {},
      combined: undefined,
    },

    store: undefined, // you can get a copy of redux's store from here

    options: {
      debug: false,
      proxyFields: true,
      flatDefaults: false,
      attachStrategy: 'dispatch',
      detachStrategy: 'dispatch',

      ...otherOptions,
    },
  }
```
