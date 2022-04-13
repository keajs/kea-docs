---
sidebar_position: 1
---

# What is Kea?

import useBaseUrl from '@docusaurus/useBaseUrl';

## Introduction

Kea is a production-grade state management framework built for _ambitious_ React apps.

It _scales really well_ as your application grows and helps keep your state neat and clean.

<a href={useBaseUrl('img/introduction/how-does-kea-work.png')}><img alt="Redux Devtools with Inline Paths" src={useBaseUrl('img/introduction/how-does-kea-work.png')} style={{ maxWidth: 715, width: '100%' }} /></a>
<br /><br />

Kea is built on top of Redux and leverages its underlying functional principles.

- Every operation in your app starts with an **action** (_increment counter_).
- These actions update **reducers** (_counter_) that hold the actual data.
- This data is stored in a global **state**, which is managed by Redux.
- You fetch **values** (_counter is 1_) through **selectors** (_find the counter in the state_) from this state.
- Actions may also trigger **listeners**, which are plain async functions that talk with externals APIs,
  read values or dispatch other actions.
- All related actions, reducers, selectors and listeners are grouped into a **logic** (_counterLogic_).
- React Components **connect** to this logic and pull in all needed actions and values.

Check out the [quickstart](/docs/BROKEN) to see this as code or read the
[installation instructions](./installation.md) to get started.

## What is Kea good for?

First, Kea is not just a place to put your app's data. It's actually a framework for managing
the _complete lifecycle_ of this data. This includes only mounting logic that is actively in use by React
and keeping the rest in standby, freeing up precious resources.

Unlike some other state management libraries, where you statically connect all your reducers to the
store (`const store = configureStore({ reducer: combinedReducers })`) or
read state through hardcoded global variables (`const todos = useStoreState(state => state.todos.items)`),
you don't need to worry about this in Kea. The framework does it for you.

Logic in Kea is always connected to your React components (and to other `logic`) via regular
`import` statements (`import { logic } from './logic'`) and mounted only when requested
by a component (`const { increment } = useActions(logic)`).
Logic that is no longer in use is automatically unmounted, freeing up memory.

This makes Kea perfect for large apps with complex relationships between state and components.
This also means that [code-splitting](https://webpack.js.org/guides/code-splitting/) works out of the
box with Kea. No patchwork required.

Second, Kea's `logic` exposes a [very complete interface](/docs/BROKEN) that you can use from
anywhere. Need to have one logic's listeners access another logic's values? Not a problem!
Everything follows a consistent interface and is designed for interoperability.

Third, Kea is not a theoretical project. It's built by people who build complex applications for a
living. Kea has been used in [several large projects](/), which consist of hundreds of logics that
cover thousands of components. It has scaled really well every time!

Finally, Kea's functionality is not set in stone. Whenever you find yourself writing repetitive code,
you may [abstract it away](/docs/BROKEN) into a plugin. In fact, Kea's core
is actually [implemented](https://github.com/keajs/kea/blob/master/src/core/index.js) as a plugin itself.
There are plugins for [routing](/docs/BROKEN), [offline storage](/docs/BROKEN),
[sagas](/docs/BROKEN), [websockets](/docs/BROKEN) and much more. This opens up
whole new ways to build applications.

## What is Kea _not_ good for?

All that said, there are few cases when you should not consider using Kea.

First, if you have a large app with an existing state management solution that works reasonably well,
switching to Kea might cost more than it's worth. This might especially be the case if your entire app
is built around [GraphQL/Apollo](https://www.apollographql.com/) or another complete ecosystem.
Very tiny apps might also do fine with just React's `useState`, but as soon as you need
to share logic between components, it's wise to evaluate real state management solutions.

Second, Kea is rather opinionated and wants you to follow some functional programming principles. Mainly
this means that you should never modify existing state (`state.push(newElement)`), but must always create
new state (`state = [...state, newElement]`). Instead of abstracting away these details from the end-user,
like some libraries do with [immer](https://immerjs.github.io/immer), Kea embraces
this style of writing code. I believe the time spent learning a bit of functional programming
is absolutely [worth it](http://www.paulgraham.com/avg.html) and will make you into a better programmer
overall. That said, this style is not for everyone.

Third, did I mention Kea is opinionated? Sometimes it may be too explicit for your taste (_having
to explicitly define actions_ for example), sometimes it might be too implicit or too magical. There
is thought put into each decision that went into Kea, taking into account developer happiness (neat and
clean code that just works) and developer productivity (limiting bugs). It's a tight rope to walk,
yet I believe Kea strikes a beautiful balance. You might disagree. If so,
[open an issue](https://github.com/keajs/kea/issues) and let's debate!

## How does Kea compare to other frameworks?

That's a good question! [Join the discussion here!](https://github.com/keajs/kea/issues/106)

## Why "kea"?

According to [Wikipedia](https://en.wikipedia.org/wiki/Kea):

> The kea (/ˈkiːə/; Māori: [kɛ.a]) is a species of large parrot
> found in the forested and alpine regions of the South Island of New Zealand.
>
> Kea are known for their intelligence and curiosity. Kea can solve logical puzzles, such as pushing
> and pulling things in a certain order to get to food, and will work together to achieve a certain
> objective.

[Check out some videos](https://www.youtube.com/results?search_query=kea+the+smartest+parrot) to see
this magnificent bird in action.

Kea the parrot always finds the shortest and the smartest way to achieve a goal, such as getting food
from a maze.

Kea the framework follows a similar approach. It offers a simple and straightforward solution
to the complicated problem of state management.

Plus, when I started to learn React, I was on a plane back to Belgium from a holiday in New Zealand,
having just [seen the bird](https://photos.app.goo.gl/5DNXZWCKtYveeu8c9) a week before. Thus I find
the name strangely fitting.

## History

Hi everyone! 👋

The Kea project began when I first started to use [Redux](https://redux.js.org/) in a
[React](https://reactjs.org/) app in 2015\.

Redux was fine, but I kept writing very similar code over and over again. Eventually I looked for ways
to simplify things. I wrote several helper functions that automatised most of these repetitive tasks.

That loose collection of functions grew into the first public release of Kea, version 0.1 at the start
of 2016\.

Those in turn evolved into a unified _high level abstraction over Redux_. The small helper functions
morphed into a standardised way to describe your app's state and all the logic that manipulates it,
including side effects. (versions 0.1 to 0.28 over 3 years).

That worked well. There were plenty of users and businesses who depended on Kea to power their apps.
Several of them said very nice things about it.

Then things got complicated.

Changes in React and React-Redux (mostly hooks) combined with community feedback through unsolvable
feature requests forced me to take a step back and have a fresh look at what was "Kea" and where was
it heading. It was time for a refactor... Which turned into a rewrite... Which took on a life of
its own... and kept [expanding and expanding and expanding](https://github.com/keajs/kea/blob/master/docs/CHANGES-1.0.md).

All of this while retaining the same bundle size as before (16kb minified -\> 17kb minified).

After 5+ months of hard work over 300+ commits Kea 1.0 was born.

It's a complete rewrite of what came before, taking Kea from being just an abstraction over Redux into
proper framework territory.

8 months later, Kea reached version 2.0. This new major version ties up [a lot of loose ends](/blog/kea-2.0)
and adds several new convenience features.

I hope you'll have as much fun using it as I had writing it! 🤩

If you have any feedback, please reach out directly or open an [issue](https://github.com/keajs/kea/issues) on Github!

-- [Marius Andra](https://twitter.com/mariusandra)

:::note Next Steps

- Read [quickstart](/docs/BROKEN) if you're in a hurry, otherwise...
- Read [core concepts](/docs/BROKEN) to get a good technical overview of what makes Kea tick and why.
  It includes everything in the quickstart.
  :::
