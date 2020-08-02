---
id: typescript
title: 'TypeScript Support in Kea (aka The Long Road)'
author: Marius Andra
author_title: Kea Core Team
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, typescript]
---

Even [before](https://github.com/keajs/kea/issues/65) Kea [reached 1.0](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/)
last year, one topic kept popping up over and over again:

> "Great, but what about typescript?"

... or [more eloquently](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00ddmv/):

> "Unless the API has changed dramatically in the last few months it’s written in a way that ensure
> that it’s basically impossible to create effective typescript types to use it safely."

While that comment above is still _technically_ true, as of version 2.2 (`2.2.0-rc.1`),
Kea has full support for TypeScript!

The road there was long and winding... with plenty of dragons guarding the way.

Yet we prevailed!

But how?

:::note What is Kea?
Kea is a state management library for React. Powered by Redux.
It's like Redux Toolkit, but different and older.

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
> that it’s basically impossible to create effective typescript types to use it safely."

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

There's a lot happening here:

1. We have everything inside one object literal `{}`
2. We have one action `openBlog` that takes an `id` and returns `{ id }`
3. The `reducers` are specified as a function that gets the `logic` itself as its first
   parameter. That's some TS-killing loopy stuff right there!
4. The reducer `blog` uses this action to change its value
5. This reducer also depends on an action from a different logic
6. The selector `doubleBlog` depends on the return type of the `blog` reducer
7. The selector `tripleBlog` depends on both `blog` and `doubleBlog`
   and their return types.

These are just a few of the complications. This was going to be hard.

Yet I was determined to succeed, for I had on my side the strongest motivation that
exists: I had to [prove someone wrong](https://xkcd.com/386/) on the internet.

### Attempt 1

It immediately became clear that adding types to the codebase wasn't going
to automatically solve my problems. I needed to dive into [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/generics.html).

The first attempt that I tried looked something like this:

```typescript
// Note: broken code, for demonstration purposes only!
import { kea as realKea } from 'kea'

type ActionDefinitions = Record<string, (...args: any) => any>

type ReducerDefinitions = Record<string,
    | Record<string, any>
    | [any, Record<string, any>]
>

type Input = {
    actions?:
        | ActionDefinitions
        | ((logic: Logic<Input>) => ActionDefinitions),  // !
    reducers?:
        | ReducerDefinitions
        | ((logic: Logic<Input>) => ReducerDefinitions)  // !
    // ...
}

type ConvertInputActions<A extends Record<string, () => any>> = {
    [K in keyof A]: (...args: Parameters<A[K]>) => {
        type: string,
        payload: ReturnType<A[K]>
    }
}

type Logic<I extends Input> = {
    actions: ConvertInputActions<I['actions']>,
    reducers: ConvertInputReducers<I['reducers']>,
    // ...
}

function kea<I extends Input>(input: I): Logic<I> {
    return realKea(input)
}

const logic = kea({ actions: () => { ... } })
```

Seems legit?

The big problem is with the lines marked with "!". Simplified:

```typescript
type MakeLogicActions<InputActions> = {
    /* skip */
}
type MakeLogicReducers<InputReducers> = {
    /* skip */
}

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
```

When set to `(logic: any) => any`, we get type completion when _using_ the logic:

![Kea TypeScript Values](/static/img/blog/typescript/values.gif)

... but not when _writing_ it:

![Kea TypeScript No Input Listeners](/static/img/blog/typescript/no-input-listeners.gif)

I dare you, try to make the `(logic: Logic<Input>) => any` inside `Input<Logic>` depend on the `I extends Input` that was passed
to `Logic<Input>`.

AFAIK this kind of loopy stuff is just not possible with TypeScript.

This attempt just wouldn't prove someone on the internet _wrong enough_,
so back to the drawing board!

### Attempt 2

I [first alluded to](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00qqqn/)
automatic type generation 10 months ago, yet it always seemed like a huge undertaking.
There had to be an easier way.

What if I changed the syntax of Kea itself to something friendlier to TypeScript?
Hopefully in a backwards-compatible and opt-in way?

Surely there won't be any problems maintaining two parallel implementations and
everyone using Kea will understand that this is Kea's _hooks moment_, right? Right?

_Right?_

Would something like this be easier to type?

```typescript
// pseudocode!
const logic = tsKea()
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

I mean, it's just a slight alteration to code that already works:

```typescript
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

Unfortunately not.

(Or fortunately if you don't like breaking changes!)

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

## Automatic Type Generation

There's only one thing left to do.

My job now is to spend countless nights and weekends building [kea-typegen](https://github.com/keajs/kea-typegen),
which will use the TypeScript Compiler API to load your project, analyse the generated AST,
infer the correct types and write them back to disk in the form of `logicType.ts` files. 

These `logicTypes` will then be fed back to the `const logic = kea<logicType>()` calls... and presto! Fully typed logic!

It's not ideal (*ugh, another command to run*), but it *should* work.

The stakes are high: If I fail or quit, the person on the internet will be proven right... and that's just not an option.

### kea-typegen

Thus it's with great excitement that I can announce `kea-typegen` to the world!



...


Take that, person on the internet!


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
