---
sidebar_position: 3
---

# TypeScript

import useBaseUrl from '@docusaurus/useBaseUrl';

## Create and pass a `logicType`

To add TypeScript support to your logic, create a `logicType`, and pass it as the `kea` function's type argument:

```ts
import { kea, actions, reducers } from 'kea'

import { loginLogicType } from './loginLogicType'

const loginLogic = kea<loginLogicType>([
  actions({
    setUsername: (username: string) => ({ username }),
  }),
  reducers({
    username: ['keajs', { setUsername: (_, { username }) => username }],
    // ...
  }),
])
```

This provides automatic typing wherever you use the logic:

<p><img alt="Kea TypeScript React Component" src={useBaseUrl('img/guide/typescript-using.gif')} loading="lazy" style={{ width: '100%', maxWidth: 753 }} /></p>

## Option 1: `MakeLogicType<V, A, P>`

There are two ways you can get a `logicType`. The first is manually:

```typescript
interface Values {
  id: number
  created_at: string
  name: string
  pinned: boolean
}

interface Actions {
  setName: (name: string) => { name: string }
}

interface Props {
  id: number
}

type myLogicType = MakeLogicType<Values, Actions, Props>

const myLogic = kea<myLogicType>([
  actions({
    setName: (name) => ({ name }),
  }),
  reducers({
    name: ['', { setName: (_, { name }) => name }],
    // etc
  }),
])
```

## Option 2: `kea-typegen`

The second way is with [`kea-typegen`](https://github.com/keajs/kea-typegen), which uses the [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) to analyse your `.ts` files and generate type definitions for your logic.

Run `kea-typegen write` or `kea-typegen watch` and get a bunch of `logicType.ts` files:

<p><img alt="Kea-TypeGen" src="/img/blog/typescript/typegen-write.gif" loading="lazy" style={{ width: '100%', maxWidth: 766 }} /></p>

The generated types will be automatically added to the `kea()` call.

```typescript
import { kea } from 'kea'
import { githubLogicType } from './githubLogicType'

export const githubLogic = kea<githubLogicType>([
  //                          ^^^^^^^^^^^^^^^^^ 👈 added automatically
  actions({ skip }),
  reducers({ skip }),
  listeners(({ actions }) => ({ skip })),
])
```

It's a bit of extra work, but works like magic once set up!

### Installation

First install the `kea-typegen` and `typescript` packages:

```shell
# if you're using yarn
yarn add --dev kea-typegen typescript

# if you're using npm
npm install kea-typegen typescript --save-dev
```

### Running typegen

- While developing, run `kea-typegen watch`, and it'll generate new types every time your logic changes.
- Run `kea-typegen write` to generate all the types, for example before a production build.
- Finally, `kea-typegen check` can be used to see if any types need to be written

Here's a sample `pacakge.json`, that uses [`concurrently`](https://www.npmjs.com/package/concurrently)
to run `kea-typegen watch` together with webpack while developing:

```shell
# if you're using yarn
yarn add --dev concurrently

# if you're using npm
npm install concurrently --save-dev
```

```json
{
  "scripts": {
    "start": "concurrently \"yarn start:app\" \"yarn start:kea\" -n APP,KEA -c blue,green",
    "start:app": "webpack-dev-server",
    "start:kea": "kea-typegen watch --write-paths"
  }
}
```

### When should you specify types?

With TypeGen, you should only need to specify each type once. This means at the boundaries: the `action` parameters and
any `defaults`, including in `reducers` or `loaders`. Everything else, including various return types, should be detected
automatically.

```tsx
import { Blog } from './blog'
import { logicType } from './logicType'

export const LocalType = 'YES' | 'NO'

// The kea<...> part is automatically added and kept up to date by kea-typegen 
const logic = kea<logicType<LocalType>>([
  actions({
    openBlog: (id: number, blog?: Blog) => ({ id, blog }), // 👈 add types here
    closeBlog: (answer: LocalType) => ({ answer }),
  }),
  reducers({
    blogId: [
      null as number | null, // 👈 null now, but sometimes a number 🙀
      { openBlog: (_, { id }) => id, closeBlog: () => null },
    ],
  }),
  listeners({
    closeBlog: ({ answer }) => {
      console.log(answer)
    },
  }),
])
```

Files generated with kea-typegen will automatically import any types they can, and add the rest as type arguments
for `kea<logicType<LocalType, LocalUser>>`

### Create logic-builder-type-builders

**If you're building custom logic builders**, and want typegen to automatically generate types, you must write a _logic-builder-type-builder_. :sweat_smile:

This involves creating a `typegen.ts` or a `setters.typegen.ts` file next to your `setters.ts` builder. This file should
export a function with the same name as the builder, and similar to the builder, add various actions, reducers
and other features on the _type_ of the logic.

Check out the sample [typedForm.typegen.ts](https://github.com/keajs/kea-typegen/blob/kea-3.0/samples/typed-builder/typedForm.typegen.ts),
or the more full-featured [`typegen.ts` from kea-forms](https://github.com/keajs/kea-forms/blob/kea-3.0/src/typegen.ts),
for examples of such type builders.

:::note
These type builders area a new area of development for kea, starting with 3.0, and we're working on making this API simpler for all.
For now, you'll need to know how the TypeScript Compiler API works, and write code to manipulate TypeScript `Node`s and `TypeNode`s.

> ProTip: Get a useful debugger, and use the [TypeScript AST Viewer](https://ts-ast-viewer.com/).
:::

### Caveats / Known issues

1. Using namespaced types like `ExportedApi.RandomThing` is slightly broken.
   You may sometimes need to create an `interface` that `extends` the original type, and use that in your actions/reducers.
   Creating a `type` alias [will not work](https://github.com/microsoft/TypeScript/issues/19198#issuecomment-342596525), as
   "One difference is that interfaces create a new name that is used everywhere.
   Type aliases don’t create a new name — for instance, error messages won’t use the alias name". For example:

```ts
interface RandomThing extends ExportedApi.RandomThing {}
```

2. Alternatively, disable such errors in your `logicType.tsx` files, by passing `--add-ts-nocheck` to kea-typegen.

3. With some tools you might need to "Reload All Files" or explicitly open `logicType.ts` to see the changes.

4. Adding types with `logic.extend()` isn't implemented yet.


Found a bug? Some type wrongly detected? [Post an issue in the kea-typegen repository](https://github.com/keajs/kea-typegen/issues).
