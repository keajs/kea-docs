---
id: typescript
title: "TypeScript Support in Kea (aka The Long Road)"
author: Marius Andra
author_title: Kea Core Team
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, typescript]
---

Even [before](https://github.com/keajs/kea/issues/65) Kea reached 1.0 last year, one question kept 
popping up over and over again:

> "Yeah, but what about typescript?"

... or [more specifically](https://www.reddit.com/r/reactjs/comments/d386wp/kea_10_released_data_layer_for_react_powered_by/f00ddmv/):

> "Unless the API has changed dramatically in the last few months it’s written in a way that ensure 
> that it’s basically impossible to create effective typescript types to use it safely." 

While that comment above is still technically true, those days are now behind us! 
Starting with version 2.2 (`2.2.0-rc.1` as of this writing), Kea will have full support for TypeScript! 

The road there was long and winding... with plenty of dragons guarding the way.

Yet we prevailed!

## What is needed from TypeScript

First up, it's relatively easy to add TypeScript to a project. Just install the deps, convert
your files to `.ts` or `.tsx`, set `compilerOptions` in `tsconfig.json` to `strict` and add types
until there aren't any `any`s left.

This already gives a lot! For example full typing of options in functions like
`resetContext`:

![Kea TypeScript ResetContext](/static/img/blog/typescript/context.gif)

But we want more. This should work as well:

![Kea TypeScript No Values](/static/img/blog/typescript/no-values.gif)

That's when things start getting complicated.

## The Gallery of Failed Attempts

## Automatic Type Generation

## Manual Type Generation

