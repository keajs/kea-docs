---
id: what-is-kea
title: What is Kea?
sidebar_label: What is Kea?
---

import useBaseUrl from '@docusaurus/useBaseUrl';

:::note
If you just want to see some code, see the [quickstart](/docs/introduction/quickstart) or
the [Github API](/docs/tutorials/github) tutorial 
:::

## Introduction 

Kea is a production-grade state management framework built for *ambitious* React apps.

It *scales really well* as your application grows and helps keep your state neat and clean.

<a href={useBaseUrl('img/introduction/how-does-kea-work.png')}><img alt="Redux Devtools with Inline Paths" src={useBaseUrl('img/introduction/how-does-kea-work.png')} style={{ maxWidth: 715, width: '100%' }} /></a>
<br /><br /> 

Kea is built on top of Redux and leverages its underlying functional principles. 

* Every operation in your app starts with an **action** (*increment counter*).
* These actions update **reducers** (*counter*) that hold the actual data.
* This data is stored in a global **state**, which is managed by Redux. 
* You fetch **values** (*counter is 1*) through **selectors** (*find the counter in the state*) from this state.
* Actions may also trigger **listeners**, which are plain async functions that talk with externals APIs,
  read values or dispatch other actions.
* All related actions, reducers, selectors and listeners are grouped into a **logic** (*counterLogic*).
* React Components **connect** to this logic and pull in all needed actions and values.    

Check out the [quickstart](/docs/introduction/quickstart) to see this as code or read the 
[installation instructions](/docs/installation/instructions) to get started.

## What is Kea good for?

First, Kea is not just a place to put your app's data. It's actually a framework for managing
the *complete lifecycle* of this data. This includes only mounting logic that is actively in use by React
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

Second, Kea's `logic` exposes a [very complete interface](/docs/api/logic) that you can use from
anywhere. Need to have one logic's listeners access another logic's values? Not a problem!
Everything follows a consistent interface and is designed for interoperability. 

Third, Kea is not a theoretical project. It's built by people who build complex applications for a 
living. Kea has been used in [several large projects](/), which consist of hundreds of logics that
cover thousands of components. It has scaled really well every time!

Finally, Kea's functionality is not set in stone. Whenever you find yourself writing repetitive code,
you may [abstract it away](/docs/guide/writing-plugins) into a plugin. In fact, Kea's core 
is actually [implemented](https://github.com/keajs/kea/blob/master/src/core/index.js) as a plugin itself.
There are plugins for [routing](/docs/plugins/router), [offline storage](/docs/plugins/localstorage), 
[sagas](/docs/plugins/sagas), [websockets](/docs/plugins/websockets) and much more. This opens up
whole new ways to build applications.

## What is Kea *not* good for?

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

Third, as of Kea 2.0, we are still missing native TypeScript support. Kea works fine with TS if you
[manually create interfaces](https://github.com/keajs/kea/issues/35#issuecomment-561814506), yet
we could do better. Addressing this support is [one of the main goals](/blog/kea-2.0#typescript-support) 
for the next versions of Kea.

Fourth, did I mention Kea is opinionated? Sometimes it may be too explicit for your taste (*having
to explicitly define actions* for example), sometimes it might be too implicit or too magical. There 
is thought put into each decision that went into Kea, taking into account developer happiness (neat and 
clean code that just works) and developer productivity (limiting bugs). It's a tight rope to walk, 
yet I believe Kea strikes a beautiful balance. You might disagree. If so, 
[open an issue](https://github.com/keajs/kea/issues) and let's debate!

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

:::note Next Steps
* Read [quickstart](/docs/introduction/quickstart) if you're in a hurry, otherwise...
* Read [core concepts](/docs/guide/concepts) to get a good technical overview of what makes Kea tick and why.
It includes everything in the quickstart.
:::