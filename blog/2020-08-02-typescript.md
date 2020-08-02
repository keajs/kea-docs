---
id: typescript
title: 'TypeScript Support in Kea (The Long Road)'
author: Marius Andra
author_title: Kea Core Team
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, typescript]
---

Even [before](https://github.com/keajs/kea/issues/65) Kea [reached 1.0](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/)
last year, one topic kept popping up over and over again:

> "Yeah it's great, but what about typescript?"

... or [more eloquently](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00ddmv/):

> "Unless the API has changed dramatically in the last few months it’s written in a way that ensure
> that it’s basically impossible to create effective typescript types to use it safely."

While that comment above is still _technically_ true, as of version 2.2 (`2.2.0-rc.1`),
Kea has full support for TypeScript!

The road there was long and winding... with plenty of dragons along the way.

Yet we prevailed!

But how?

:::note What is Kea?
Kea is a state management library for [React](https://reactjs.org/). Powered by [Redux](https://redux.js.org/).
It's like [Redux Toolkit](https://redux-toolkit.js.org/), but different and older. It's designed to spark joy!

-   Read "[What is Kea?](http://localhost:3000/docs/introduction/what-is-kea)" to learn more.
-   Open the "[Quickstart](/docs/introduction/quickstart)" to see code.

:::

## TypeScript Support

First up, it's relatively easy to add TypeScript to a project. Just install the deps, convert
your files to `.ts` or `.tsx`, set `compilerOptions` in `tsconfig.json` to `strict` and add types
until there aren't any `any`s left.

This already gives a lot!

For example an autocomplete for `resetContext`:

<img alt="Kea TypeScript ResetContext" src="/static/img/blog/typescript/context.gif" loading="lazy" />

But we want more. This should work as well:

<img alt="Kea TypeScript No Values" src="/static/img/blog/typescript/no-values.gif" loading="lazy" />

and this:

<img alt="Kea TypeScript No Input Listeners" src="/static/img/blog/typescript/no-input-listeners.gif" loading="lazy" />

How on earth do we do that?

## The Gallery of Failed Attempts

As predicted by [the Redditor quoted above](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00ddmv/):

> "Unless the API has changed dramatically in the last few months it’s written in a way that ensure
> that it’s **basically impossible** to create effective typescript types to use it safely."

It turns out code like this is nearly impossible to type safely:

```typescript
const logic = kea({
    // 1.
    actions: {
        openBlog: (id: number) => ({ id }), // 2.
    },
    reducers: (logic) => ({
        // 3.
        blog: [
            null,
            {
                openBlog: (_, { id }) => id, // 4.
                [appLogic.actions.closeBlog]: () => null, // 5.
            },
        ],
    }),
    selectors: {
        doubleBlog: [
            (s) => [s.blog], // 6.
            (blog) => (blog ? blog * 2 : null),
        ],
        tripleBlog: [
            (s) => [s.blog, s.doubleBlog], // 7.
            (blog, doubleBlog) => blog + doubleBlog,
        ],
    },
})
```

Who could have guessed?

There's a lot happening here:

1. We have a lot of keys (`actions`, `reducers`) inside one huge object literal `{}`
2. We have one action `openBlog` that takes an `(id: number)` and returns `{ id }`
3. The `reducers` are specified as a function that gets the `logic` itself as its first
   parameter. That's some TS-killing _loopy stuff_ right there!
4. The reducer `blog` uses the `openBlog` action (defined above in the same object!) to change its value
5. This reducer also depends on an action from a different logic, `appLogic`
6. The selector `doubleBlog` depends on the return type of the `blog` reducer
7. The selector `tripleBlog` depends on both `blog` and `doubleBlog`
   and their return types.

These are just a few of the complications. 

This was going to be hard.

Yet I was determined to succeed, for I had on my side the strongest motivation
on the planet: I had to [prove someone wrong](https://xkcd.com/386/) on the internet.

### Attempt 1

It immediately became clear that just getting rid of `any`s in the codebase wasn't 
going to be enough.

The [JavaScript that converts](https://github.com/keajs/kea/tree/master/src/core/steps) `kea(input)` into a `logic` is just 
a bit too complicated for the TypeScript compiler to automatically infer types from it.

[TypeScript Generics](https://www.typescriptlang.org/docs/handbook/generics.html) enter he game.

Just write a long TypeScript type that gets the `kea(input)` parameter's type,
looks at its properties and morphs them into a `LogicType`. Write some functional *loopy* stuff in
a funny markup language. No big deal.

So I thought.

The first attempt looked like this when stripped to its core:

```typescript
type Input = {
    actions?: (logic: Logic<Input>) => any // !
    reducers?: (logic: Logic<Input>) => any // !
    // ...
}
type Logic<I extends Input> = {
    actions: MakeLogicActions<I['actions']>
    reducers: MakeLogicReducers<I['reducers']>
    // ...
}
function kea<I extends Input>(input: I): Logic<I> {
    return realKea(input)
}

// helpers
type MakeLogicActions<InputActions> = {
    [K in keyof InputActions]: (
        ...args: Parameters<InputActions[K]>
    ) => {
        type: string
        payload: ReturnType<InputActions[K]>
    }
}
type MakeLogicReducers<InputReducers> = {
    // skip
}
```

This implementation gives us type completion when _using_ the logic:

<img alt="Kea TypeScript Values" src="/static/img/blog/typescript/values.gif" loading="lazy" />

... but not when _writing_ it:

<img alt="Kea TypeScript No Input Listeners" src="/static/img/blog/typescript/no-input-listeners.gif" loading="lazy" />

The lines marked `// !` are where this breaks down.

There's just no way to make the `(logic: Logic<Input>) => any` inside `Input` depend on the
`I extends Input` that was passed to `Logic<Input>`. 

Got all that? Me neither. 

This kind of _loopy stuff_ is just not possible with TypeScript:

```typescript
// don't try this at home
type Input<L extends Logic<Input> = Logic<Input>> = {
    actions?: (logic: L) => MakeInputActions[Input['actions']] // ???
    reducers?: (logic: L) => MakeInputReducers[Input['actions']] // ???
    // ...
}
type Logic<I extends Input<Logic> = Input<Logic>> = {
    actions: MakeLogicActions<I['actions']>
    reducers: MakeLogicReducers<I['reducers']>
    // ...
}
function kea<I extends Input<Logic<I>>>(input: I): Logic<I> {
    return realKea(input)
}
```

I got _something_ to work, but ultimately without typing support while writing the `kea({...})` call itself, this attempt 
wouldn't prove someone on the internet _wrong enough_.

Back to the drawing board!

### Attempt 2

I [first alluded to](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00qqqn/)
automatic type generation 10 months ago, yet it always seemed like a huge undertaking.
There had to be an easier way.

What if I changed the syntax of Kea itself to something friendlier to TypeScript?
Hopefully in a completely opt-in and 100% backwards-compatible way?

Surely there won't be any problems maintaining two parallel implementations and
everyone using Kea will understand that this is Kea's [_hooks moment_](https://reactjs.org/docs/hooks-intro.html#no-breaking-changes) [1], right? Right?

_Right?_

Would something like this be easier to type?

```typescript
// pseudocode!
const logic = typedKea()
    .actions({
        submit: (id) => ({ id }),
        change: (id) => ({ id }),
    })
    .reducers({
        isSubmitting: [false, { submit: () => true }],
    })
    .listeners(({ actions }) => ({
        // (logic) => ...
        submit: async ({ id }) => {
            actions.change(id)
        },
    }))
```

I mean, it's just a slight alteration to this code that already works:

```typescript
// real code!
const logic = kea({})
    .extend({
        actions: {
            submit: (id) => ({ id }),
            change: (id) => ({ id }),
        },
    })
    .extend({
        reducers: {
            isSubmitting: [false, { submit: () => true }],
        },
    })
    .extend({
        listeners: ({ actions }) => ({
            submit: async ({ id }) => {
                actions.change(id)
            },
        }),
    })
```

Surely not a big effort to refactor?

Unfortunately (or _fortunately_?), this approach didn't work either.

While this huge chain of type extensions sounds good in theory,
you'll hit TypeScript's max instantiation depth limit eventually, as
[discovered by someone who was trying to add TS support to ... ehm, SQL](https://github.com/microsoft/TypeScript/issues/29511)?

I would experience the same. After a certain complexity the types just stopped working.

Definitely not ideal... and again won't prove someone on the internet _wrong enough_.

### Attempt 3

Attempt 3 was one more go at attempt 1, but by building out the types in the other direction:

So instead of:

```typescript
type Input = {
    actions?: (logic: Logic<Input>) => any
    reducers?: (logic: Logic<Input>) => any
}
type Logic<I extends Input> = {
    actions: MakeLogicActions<I['actions']>
    reducers: MakeLogicReducers<I['reducers']>
}
function kea<I extends Input>(input: I): Logic<I> {
    return realKea(input)
}
```

I started with something like:

```typescript
interface AnyInput {}
export interface Input<A extends InputActions, R extends InputReducers, L extends InputListeners> extends AnyInput {
    actions?: InputActions
    reducers?: InputReducers<A, ReturnType<R>>
    listeners?: () => InputListeners<A, ReturnType<R>>
}

export interface Logic<I extends AnyInput> {
    /* This is a problem for another day! */
}

export declare function kea<T extends Input<T['actions'], T['reducers'], T['listeners']>>(input: T): Logic<T>
```

... only to fail even harder.

### Attempt N+1

There were many other [experiments](https://github.com/keajs/kea/compare/typescript-experiments) and
[types](https://github.com/keajs/kea/blob/0cd60e02dd315b55546e0f8f01501c5d0bbf957d/src/types.d.ts)
that I tried.

They all had their issues.

In the end, it appears that this kind of _loopy_ syntax that
Kea uses together with selectors that depend on each other just wouldn't work with TypeScript.

That's even before you take into account [plugins](/docs/api/plugins) and `logic.extend(moreInput)`.

### What now?

I guess there's only one thing left to do.

My job now is to spend countless nights and weekends building [kea-typegen](https://github.com/keajs/kea-typegen),
which will use the TypeScript Compiler API to load your project, analyse the generated AST,
infer the correct types and write them back to disk in the form of `logicType.ts` files.

These `logicTypes` will then be fed back to the `const logic = kea<logicType>()` calls... and presto! Fully typed logic!

It's not ideal (_ugh, another command to run_), but it _should_ work.

The stakes are high: If I fail or quit, the person on the internet will be proven right... and that is just not an option.

## Automatic Type Generation

Thus it's with great excitement that I can announce [`kea-typegen`](https://github.com/keajs/kea-typegen) to the world!

It's still rough with [a lot of things to improve](https://github.com/keajs/kea-typegen/projects/1),
yet it's already _really useful_!

We've been [using it in PostHog](https://github.com/PostHog/posthog/pull/1286) for
about a week now, and it's working great!

Take that, random person on the internet!

Install the `typescript` and `kea-typegen` packages, run `kea-typegen watch` and code away!
Keep the generated `logicType.ts` files in version control.

<img alt="Kea-TypeGen" src="/static/img/blog/typescript/kea-typegen.gif" loading="lazy" />

### Rough Edges

This is the very first version of `kea-typegen`, so there are still some rough edges.

1. You must manually import the `logicType` and insert it into your logic.
   This will be done automatically in the future.

<img alt="Import Logic Type Manually" src="/static/img/blog/typescript/import-logic-type.gif" loading="lazy" />

2. You must manually hook up all type dependencies by adding them on the `logicType`
   in `logic.ts`. Kea-TypeGen will then put the same list inside `logicType`.
   This will also be done automatically in the future.

<img alt="Send Type to Logic Type" src="/static/img/blog/typescript/send-type-to-type.gif" loading="lazy" />

3. When [connecting logic together](https://kea.js.org/docs/guide/additional#connecting-logic-together),
   you must use `[otherLogic.actionTypes.doSomething]` instead of `[otherLogic.actions.doSomething]`

<img alt="Use ActionTypes" src="/static/img/blog/typescript/action-types.gif" loading="lazy" />

4. Sometimes you might need to "Reload All Files" in your editor at times... or
   explicitly open `logicType.ts` to see the changes.

5. Plugins aren't supported yet. I've hardcoded a few of them (loaders, router, window-values)
   into the typegen library, yet that's not a long term solution.

6. `logic.extend()` doesn't work yet.

These are all solvable issues. [Let me know](https://github.com/keajs/kea-typegen/issues) which ones to prioritise!

## Alternative: MakeLogicType<V, A, P>

At the end of the day, Kea's _loopy_ syntax doesn't bode well with TypeScript
and we are forced to make our own `logicTypes` and feed them to Kea.

However nothing says these types need to be explicitly made by `kea-typegen`.
You could easily make them by hand. [Follow the example](https://github.com/keajs/kea-typegen/blob/master/samples/logicType.ts)
and adapt as needed!

To help migrating the most common cases, Kea 2.2.0 will come with a special type:

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

<img alt="MakeLogicType" src="/static/img/blog/typescript/make-logic-type.gif" loading="lazy" />

You'll even get completion when coding the logic:

<img alt="MakeLogicType Reducers" src="/static/img/blog/typescript/make-logic-reducers.gif" loading="lazy" />

Thank you to the team at Elastic for [inspiring](https://github.com/elastic/kibana/pull/72160) this approach!

## Closing words

TypeScript support for Kea is finally here.

Well, almost. You can already use Kea `v2.2.0-rc.1` with TypeScript support. The final `2.2.0` is
not far away.

So far I've been building `kea-typegen` in isolation. 
I'd love to hear what the wider community thinks of it. Is it useful?
What's missing? How can I improve the developer ergonomics?
Should I send the created `logicTypes` to GPT-3, so it would code the rest of your app?
And who ate all the bagels?

Just [open an issue](https://github.com/keajs/kea-typegen/issues) and let's chat!

Also check out [the samples folder](https://github.com/keajs/kea-typegen/tree/master/samples)
in the `kea-typegen` repository for a few random examples of generated logic.

Finally here's a 12min video where I add TypeScript support to [PostHog](https://posthog.com/) (we're hiring!):

<iframe src="//www.youtube.com/embed/jGy-p9UxcBA" frameborder="0" allowfullscreen width="100%" style={{ minHeight: 350 }}></iframe>

#### Footnotes 
[1] Hooks Moment: A massive improvement in developer ergonomics at the cost of all old code becoming legacy overnight.
