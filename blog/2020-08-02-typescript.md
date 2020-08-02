---
id: typescript
title: 'TypeScript Support in Kea (The Long Road to)'
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

![Kea TypeScript ResetContext](/static/img/blog/typescript/context.gif)

But we want more. This should work as well:

![Kea TypeScript No Values](/static/img/blog/typescript/no-values.gif)

and this:

![Kea TypeScript No Input Listeners](/static/img/blog/typescript/no-input-listeners.gif)

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
   parameter. That's some TS-killing *loopy stuff* right there!
4. The reducer `blog` uses the `openBlog` action (defined above in the same object!) to change its value
5. This reducer also depends on an action from a different logic
6. The selector `doubleBlog` depends on the return type of the `blog` reducer
7. The selector `tripleBlog` depends on both `blog` and `doubleBlog`
   and their return types.

These are just a few of the complications. This was going to be hard.

Yet I was determined to succeed, for I had on my side the strongest motivation
on the planet: I had to [prove someone wrong](https://xkcd.com/386/) on the internet.

### Attempt 1

It immediately became clear that adding types to the codebase wasn't enough.
The JS/TS code that converts an `input` into a `logic` is just too complicated for
the TypeScript compiler to automatically infer types from it.

[TypeScript Generics](https://www.typescriptlang.org/docs/handbook/generics.html)
to the rescue!

It felt possible to write code that takes `InputType` from `kea(input: InputType)`, 
looks at its properties and morphs them into a `LogicType`.

So I thought.

The first attempt looked something like this:

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

On paper this is legit, yet the lines marked `// !` are where this breaks down.

This implementation gives us type completion when _using_ the logic:

![Kea TypeScript Values](/static/img/blog/typescript/values.gif)

... but not when _writing_ it:

![Kea TypeScript No Input Listeners](/static/img/blog/typescript/no-input-listeners.gif)

There's just no way to make the `(logic: Logic<Input>) => any` inside `Input` depend on the
`I extends Input` that was passed to `Logic<Input>`. Try it, it'll get complicated really fast.

This kind of *loopy stuff* is just not possible with TypeScript:

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

I got _something_ to work, buy ultimately this attempt wouldn't prove someone on
the internet _wrong enough_.

Back to the drawing board!

### Attempt 2

I [first alluded to](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00qqqn/)
automatic type generation 10 months ago, yet it always seemed like a huge undertaking.
There had to be an easier way.

What if I changed the syntax of Kea itself to something friendlier to TypeScript?
Hopefully in a completely opt-in and 100% backwards-compatible way?

Surely there won't be any problems maintaining two parallel implementations and
everyone using Kea will understand that this is Kea's [_hooks moment_](https://reactjs.org/docs/hooks-intro.html#no-breaking-changes), right? Right?

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

In the end, it appears that this kind of *loopy* syntax that
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

Thus it's with great excitement that I can announce `kea-typegen` to the world!

It's still rough, but all the effort has paid off and it is already really useful!

Just run `npx kea-typegen watch` and code away!

Here's a 10min video where I convert the Github API example to TypeScript.

...

Take that, person on the internet!

### Caveats



## Manual Type Generation

## Closing remarks

What's next? I don't know. Perhaps this type generation will be amazing as is.
Perhaps it's smarter to store everything in one huge "logicTypes.ts" file?
Perhaps integrating it inside a whicheverpack plugin will remove the need for
a separate command to run? Perhaps ttypescript can make this more magical?
Perhaps there will be official support for plugins in TypeScript? Perhaps I
should send all the gathered metadata on the logics to GPT-3, so it would write
the rest of your app?

Who knows.

## WIP:

I even recorded a 10min video on how it works!

<iframe src="//www.youtube.com/embed/jGy-p9UxcBA" frameborder="0" allowfullscreen width="100%" style={{ minHeight: 350 }}></iframe>
