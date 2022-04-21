---
sidebar_position: 0
sidebar_label: API
---

# Plugins API

Sometimes, [logic builders](/docs/core/kea#logicbuilders) aren't enough, and you need to hook into the global
lifecycle of _every_ logic, inject middleware into Redux, or create new default keys like `logic.wormholes = {}`. 

That's where plugins come in.

## Initializing plugins

To activate a plugin with Kea, you pass an object of type `KeaPlugin`, or `(config?) => Keaplugin` into the `plugins`
array on [`resetContext`](/docs/intro/context). For example:

```ts
import { KeaPlugin, resetContext } from 'kea'
import { routerPlugin } from 'kea-router'

const woohooPlugin: KeaPlugin = {
  name: 'woohoo',
}

resetContext({
  plugins: [routerPlugin, woohooPlugin],
})
```

## Plugin structure

Here are all the options you can use within a plugin:

```ts
import { KeaPlugin } from 'kea'

type WoohooPluginConfig = Record<string, any>

const woohooPlugin = (config?: WoohooPluginConfig): KeaPlugin => ({
  // Required: name of the plugin
  name: '',

  // Default values for output in logic. `logic.woohoo` will default to `{}` now
  defaults: () => ({
    woohoo: {},
  }),

  events: {
    /** Run after creating a new context, before plugins are activated and the store is created */
    afterOpenContext: (context: Context, options: ContextOptions) => {},
    /** Run after this plugin has been activated */
    afterPlugin: () => {},
    /** Run before the redux store creation begins. Use it to add options (middleware, etc) to the store creator. */
    beforeReduxStore: (options: CreateStoreOptions) => {},
    /** Run after the redux store is created. */
    afterReduxStore: (options: CreateStoreOptions, store: Store) => {},
    /** Run before we start doing anything */
    beforeKea: (input: LogicInput | LogicBuilder) => {},
    /** before the steps to build the logic (gets an array of inputs from kea(input).extend(input)) */
    beforeBuild: (logic: BuiltLogic, inputs: (LogicInput | LogicBuilder)[]) => {},
    /** before the steps to convert input into logic (also run once per .extend()) */
    beforeLogic: (logic: BuiltLogic, input: LogicInput | LogicBuilder) => {},
    /** after the steps to convert input into logic (also run once per .extend()) */
    afterLogic: (logic: BuiltLogic, input: LogicInput | LogicBuilder) => {},
    /** called when building a logic with legeacy LogicInput objects, called after connect: {} runs in code */
    legacyBuild: (logic: BuiltLogic, input: LogicInput) => {},
    /** called when building a logic with legeacy LogicInput objects, called after defaults are built in core */
    legacyBuildAfterConnect: (logic: BuiltLogic, input: LogicInput) => {},
    /** called when building a logic with legeacy LogicInput objects, called after the legacy core plugin runs */
    legacyBuildAfterDefaults: (logic: BuiltLogic, input: LogicInput) => {},
    /** after the steps to build the logic */
    afterBuild: (logic: BuiltLogic, inputs: (LogicInput | LogicBuilder)[]) => {},
    /** Run before a logic store is mounted in React */
    beforeMount: (logic: BuiltLogic) => {},
    /** Run after a logic store is mounted in React */
    afterMount: (logic: BuiltLogic) => {},
    /** Run before a reducer is attached to Redux */
    beforeAttach: (logic: BuiltLogic) => {},
    /** Run after a reducer is attached to Redux */
    afterAttach: (logic: BuiltLogic) => {},
    /** Run before a logic is unmounted */
    beforeUnmount: (logic: BuiltLogic) => {},
    /** Run after a logic is unmounted */
    afterUnmount: (logic: BuiltLogic) => {},
    /** Run before a reducer is detached frm Redux */
    beforeDetach: (logic: BuiltLogic) => {},
    /** Run after a reducer is detached frm Redux */
    afterDetach: (logic: BuiltLogic) => {},
    /** Run before wrapping a React component */
    beforeWrap: (wrapper: LogicWrapper, Klass: AnyComponent) => {},
    /** Run after wrapping a React component */
    afterWrap: (wrapper: LogicWrapper, Klass: AnyComponent, Kea: KeaComponent) => {},
    /** Run after mounting and before rendering the component in React's scope (you can use hooks here) */
    beforeRender: (logic: BuiltLogic, props: Props) => {},
    /** Run when we are removing kea from the system, e.g. when cleaning up after tests */
    beforeCloseContext: (context: Context) => {},
  },
})
```

## Before 3.0

Plugins before Kea 3.0 were all of the above, plus [logic builders as a complicated system of build steps](https://v2.keajs.org/docs/guide/writing-plugins#plugin-build-steps).

With the introduction of true [logic builders](/docs/core/kea#logicbuilders), the build step system has been replaced with a simple
trio of legacy build events, run when we encounter an old `{}` object style `LogicInput`. Hopefully you won't have to care about it.

