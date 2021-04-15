---
id: typescript
title: TypeScript
sidebar_label: TypeScript
---

import useBaseUrl from '@docusaurus/useBaseUrl'; 

Starting with **version 2.2**, Kea officially supports TypeScript!

In addition to increased type safety, this massively improves developer ergonomics,
as you can now autocomplete all your actions and values, both while using logic
in a component:

<p><img alt="Kea TypeScript React Component" src={useBaseUrl('img/guide/typescript-using.gif')} loading="lazy" style={{ width: '100%', maxWidth: 753 }} /></p>

... and while writing it:

<p><img alt="Kea TypeScript in Logic" src={useBaseUrl('img/guide/typescript-writing.gif')} loading="lazy" style={{ width: '100%', maxWidth: 836 }} /></p>

There's just one gotcha.

TypeScript doesn't support the _funky loopy syntax_ that Kea uses, making impossible to automatically
generate types for code like this:

```tsx
// The TS Compiler doesn't like code like this, where all input is
// in one big object that depends on different parts of itself and
// also on the produced output (`logic`)
const logic = kea({
    actions: {
        openBlog: (id: number) => ({ id }),
        closeBlog: true,
    },
    reducers: {
        blog: [
            null,
            {
                // We're still inside the same huge object that
                // defines these actions just a few lines above
                openBlog: (_, { id }) => id,
                closeBlog: () => null,
                // How to autocomplete the list of valid actions here?
                // How to get `{ id: number }` for `openBlog`?
            },
        ],
    },
    // Listeners are defined as a function that gets the `logic`
    // as its parameter, but we're still building it, so 🤷
    listeners: ({ actions }) => ({
        openBlog: async ({ id }, breakpoint) => {
            await breakpoint(10000)
            // How can we get this to work? 
            actions.closeBlog()
        },
    }),
})

// Only here, after the logic is fully defined, we could have
// automatic autocompletion, but that's not enough.
function Blog () {
    const { openBlog, ... } = useActions(logic)
    return <div />
}
```

I tried many ways to get this to work, but it was just not possible. 
Even if I'd totally change the syntax of Kea itself, several things would
still not be possible with today's TypeScript. For example typing selectors that 
recursively depend on each other... or supporting plugins. 

Check out [this blog post](/blog/typescript) for a full overview of all the failed 
approaches.

Thus a workaround was needed.

## Option 1: `kea-typegen`

The best way to get types in your logic is with [`kea-typegen`](https://github.com/keajs/kea-typegen),
which uses the [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) to
analyse your `.ts` files and generate type definitions for your logic.

Running `kea-typegen write` or `kea-typegen watch` will generate a bunch of `logicType.ts` files:

<p><img alt="Kea-TypeGen" src="/img/blog/typescript/kea-typegen.gif" loading="lazy" style={{ width: '100%', maxWidth: 766 }} /></p>

... which you must then import and pass on to the `kea()` call.

```typescript
import { kea } from 'kea'
import { githubLogicType } from './githubLogicType'

export const githubLogic = kea<githubLogicType>({
    //                        ^^^^^^^^^^^^^^^^^ 👈
    actions: { ... },
    reducers: { ... },
    listeners: ({ actions }) => ({ ... })
})
```

It's a bit of extra work, but works like magic once set up!

If, like in the screencast above, you have logic that connects to other logic or selectors that depend on other
selectors `kea-typegen` will run in multiple passes
until there are no more changes to write.

### Step 1. Packages

First install the `kea-typegen` and `typescript` packages:

```shell
# if you're using yarn
yarn add --dev kea-typegen typescript

# if you're using npm
npm install kea-typegen typescript --save-dev
```

### Step 2. Understand the environment.

`kea-typegen` will generate a `[filename]Type.ts` file next to every file that contains a `kea()` call.

Thus a logic stored in `src/dashboardsLogic.ts` will get an accompanying `src/dashboardsLogicType.ts` file.

I recommend **not committing** these to git and instead adding this to your `.gitignore`:

```gitignore
# file: .gitignore
*Type.ts
```

These files are generated and used mainly for coding assistance and CI/CD, so it doesn't make sense to
pollute commits with them. Plus they will cause merging issues at pull requests. Just ignore them.

### Step 3. Run it

* While developing, run `kea-typegen watch`, and it'll generate new types every time your logic changes.
* Run `kea-typegen write` to generate all the types, for example before a production build.
* Finally, `kea-typegen check` can be used to see if any types need to be written

Here's a sample `pacakge.json`, that uses [`concurrently`](https://www.npmjs.com/package/concurrently)
to run `kea-typegen watch` together with webpack while developing and 
`kea-typegen write` before building the production bundle.

```json
// package.json
{
    "scripts": { 
        "start": "concurrently \"yarn run start:webpack\" \"yarn run start:typegen\" -n WEBPACK,TYPEGEN -c blue,green",
        "start:typegen": "kea-typegen watch",
        "start:webpack": "webpack-dev-server",
        "build": "yarn run build:typegen && yarn run build:webpack",
        "build:typegen": "kea-typegen write",
        "build:webpack": "NODE_ENV=production webpack --config webpack.config.js"
    }
}
```

### Types in Reducers

`kea-typegen` automatically detects the types used in your actions, reducers,
selectors and so on. It may however be the case that you need to manually specify the
type of your reducers.

In the following example the type of `blogId` is autodetected as `null`,
since we can't read more out of the default value. 

Using the `as` keyword you can improve on this and provide the exact type for your
reducer:

```tsx
const logic = kea({
    actions: {
        openBlog: (id: number) => ({ id }),
        closeBlog: true,
    },
    reducers: {
        blogId: [
            null as number | null, // 👈 it can also be a number
            {
                openBlog: (_, { id }) => id,
                closeBlog: () => null,
            },
        ],
    },   
})

```

### Rough Edges

This is the very first version of `kea-typegen`, so there are still some rough edges.

1. You must manually import the `logicType` and insert it into your logic.
   This will be done automatically in the future.

<img alt="Import Logic Type Manually" src="/img/blog/typescript/import-logic-type.gif" loading="lazy" />

2. You must manually hook up all type dependencies by adding them on the `logicType`
   in `logic.ts`. `kea-typegen` will then put the same list inside `logicType`.
   This will also be done automatically in the future.

<img alt="Send Type to Logic Type" src="/img/blog/typescript/send-type-to-type.gif" loading="lazy" />

3. When [connecting logic together](https://kea.js.org/docs/guide/additional#connecting-logic-together),
   you must use `[otherLogic.actionTypes.doSomething]` instead of `[otherLogic.actions.doSomething]`

<img alt="Use ActionTypes" src="/img/blog/typescript/action-types.gif" loading="lazy" />

4. Sometimes you might need to "Reload All Files" in your editor... or
   explicitly open `logicType.ts` to see the changes.

5. Plugins aren't supported yet. I've hardcoded a few of them (loaders, router, window-values)
   into the typegen library, yet that's not a long term solution.

6. `logic.extend()` doesn't work yet.

These are all solvable issues. [Let me know](https://github.com/keajs/kea-typegen/issues) which ones to prioritise!


### Advanced: changing where you store the types

It's possible to write the type files into a different folder as arguments to the `kea-typegen` commands
or with a `.kearc` file:

```json
{
    "tsConfigPath": "./tsconfig.json",
    "rootPath": "./src",
    "typesPath": "./types"
}
```

However, experience would suggest against doing so. Having the `logicType.ts` files in the same folder as the code 
helps detect possible coding and typing issues sooner. Plus they're easier to import.

## Option 2: MakeLogicType<V, A, P>

At the end of the day, we are forced to make our own `logicTypes` and feed them to `kea()` calls.

However nothing says these types need to be explicitly made by `kea-typegen`.
You could easily make them by hand. [Follow the example](https://github.com/keajs/kea-typegen/blob/master/samples/logicType.ts)
and adapt as needed!

To help with the most common cases, Kea 2.2.0 comes with a special type:

```typescript
import { MakeLogicType } from 'kea'

type MyLogicType = MakeLogicType<Values, Actions, Props>
```

Pass it a bunch of interfaces denoting your logic's `values`, `actions` and `props`...
and you'll get a _close-enough_ approximation of the generated logic.

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

type RandomLogicType = MakeLogicType<Values, Actions, Props>

const randomLogic = kea<RandomLogicType>({
    /* skipping for brevity */
})
```

The result is a fully typed experience:

<img alt="MakeLogicType" src="/img/blog/typescript/make-logic-type.gif" loading="lazy" />

You'll even get completion when coding the logic:

<img alt="MakeLogicType Reducers" src="/img/blog/typescript/make-logic-reducers.gif" loading="lazy" />

Thank you to the team at Elastic for [inspiring](https://github.com/elastic/kibana/pull/72160) this approach!


:::note Next steps
-   Read about [Debugging](/docs/guide/debugging) to be even more productive when writing Kea code.
:::
