---
id: typescript
title: TypeScript
sidebar_label: TypeScript
---

import useBaseUrl from '@docusaurus/useBaseUrl'; 

Starting with **version 2.2**, Kea officially supports TypeScript!

Get type completion when `use`ing logic:

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
still ~~not be possible~~ be hard to implement or have big limitations 
with today's TypeScript. For example selectors that 
recursively depend on each other... or plugins. 

Check out [this blog post](/blog/typescript) for a full overview of all the failed 
approaches.

Thus a workaround was needed.

## Automatic types with `kea-typegen`

[`kea-typegen`](https://github.com/keajs/kea-typegen) uses the [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) to
analyse your `.ts` files and generate type definitions for your logic.

Run `kea-typegen write` or `kea-typegen watch` and get a bunch of `logicType.ts` files:

<p><img alt="Kea-TypeGen" src="/img/blog/typescript/typegen-write.gif" loading="lazy" style={{ width: '100%', maxWidth: 766 }} /></p>

The generated types will be automatically added to the `kea()` call.

```typescript
import { kea } from 'kea'
import { githubLogicType } from './githubLogicType'

export const githubLogic = kea<githubLogicType>({
    //                        ^^^^^^^^^^^^^^^^^ 👈 added automatically
    actions: { ... },
    reducers: { ... },
    listeners: ({ actions }) => ({ ... })
})
```

It's a bit of extra work, but works like magic once set up!

### Step 1. Install packages

First install the `kea-typegen` and `typescript` packages:

```shell
# if you're using yarn
yarn add --dev kea-typegen typescript

# if you're using npm
npm install kea-typegen typescript --save-dev
```

### Step 2. Actually ignore the types

Add this to your `.gitignore`:

```gitignore
*Type.ts
```

Typefiles are generated and used mainly for coding assistance and CI/CD, so it doesn't make sense to
pollute commits with them. Plus they will cause merging issues at pull requests. Just ignore them.

If you're transpiling TypeScript via `babel`, you won't need to generate any types before a build.

### Step 3. Run it

* While developing, run `kea-typegen watch`, and it'll generate new types every time your logic changes.
* Run `kea-typegen write` to generate all the types, for example before a production build.
* Finally, `kea-typegen check` can be used to see if any types need to be written

Here's a sample `pacakge.json`, that uses [`concurrently`](https://www.npmjs.com/package/concurrently)
to run `kea-typegen watch` together with webpack while developing and 
`kea-typegen write` before building the production bundle.

```shell
yarn add --dev concurrently
```

```json
{
  "scripts": {
    "start": "concurrently \"yarn start:app\" \"yarn start:kea\" -n APP,KEA -c blue,green",
    "start:app": "webpack-dev-server",
    "start:kea": "kea-typegen watch"
  }
}
```

### Step 4. Specify types for actions and defaults

The only places you need to specify types are `action` parameters and defaults (e.g. for `reducers` or `loaders`)

```tsx
import { Blog } from './blog'
import { logicType } from './logicType'

export const LocalType = 'YES' | 'NO'

const logic = kea<logicType<LocalType>>({ // 👈🦜 managed automatically by typegen 
    actions: {
        openBlog: (id: number, blog?: Blog) => ({ id, blog }), // 👈 add types here
        closeBlog: (answer: LocalType) => ({ answer }),
    },
    reducers: {
        blogId: [
            null as number | null, // 👈 null now, but sometimes a number 🙀
            {
                openBlog: (_, { id }) => id,
                closeBlog: () => null,
                // use `actionTypes` instead of `actions`
                [funLogic.actionTypes.randomBlogPage]: () => 4, // chosen by a fair dice roll
            },
        ],
    },
    listeners: () => ({ 
        closeBlog: ({ answer }) => { // no types needed here
            console.log(answer)
        }
    })
})
```

Files generated with kea-typegen will automatically import any types they can, and add the rest as type arguments
for `kea<logicType<LocalType, LocalUser>>`

### Caveats / Known issues

1. Using namespaced types like `ExportedApi.RandomThing` is slightly broken. 
   You may sometimes need to create an `interface` that `extends` the original type. Creating a `type` alias
   [will not work](https://github.com/microsoft/TypeScript/issues/19198#issuecomment-342596525), as 
   "One difference is that interfaces create a new name that is used everywhere. 
   Type aliases don’t create a new name — for instance, error messages won’t use the alias name. "

```ts
interface RandomThing extends ExportedApi.RandomThing {}
```

2. With some tools you might need to "Reload All Files" or explicitly open `logicType.ts` to see the changes.

3. Plugins aren't supported yet. I've hardcoded a few of them (loaders, router, window-values)
   into the typegen library, yet that's not a long term solution.

4. `logic.extend()` doesn't work yet

Found a bug? Some type wrongly detected? [Post an issue here](https://github.com/keajs/kea-typegen/issues).


### Different path for types (not recommended)

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
helps detect possible coding and typing issues sooner (the files show up red in the sidebar).

## Alternative: MakeLogicType<V, A, P>

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
