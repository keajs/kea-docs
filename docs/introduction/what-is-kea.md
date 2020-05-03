---
id: what-is-kea
title: What is Kea?
sidebar_label: What is Kea?
---

import useBaseUrl from '@docusaurus/useBaseUrl';

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
* Actions may also trigger **listeners**, which are async functions that talk with externals APIs,
  read values or dispatch other actions.
* All related actions, reducers, selectors and listeners are grouped into a **logic** (*counterLogic*).
* React Components **connect** to this logic and pull in all needed actions and values.    

Read the [installation instructions](/docs/introduction/installation) to add Kea to your app and 
check out the [quickstart](/docs/introduction/quickstart) to see some code. 

## What is Kea good for?

Kea is not just a place to put your app's data. It's actually a framework for managing
the complete lifecycle of this data.

Unlike some other state management libraries, where you statically connect your
reducers to the store or read state through global variables (`let state = getState({ namespace: 'homepage' })`),
Kea handles all of this dynamically and behind the scenes. 

Kea's logic is always connected to your React components (and to other logic) via regular
EcmaScript `import` statements and activated (*mounted*) only when requested by any component.
Logic that is no longer in use is automatically unmounted, freeing up memory.

This makes Kea perfect for large apps with complex relationships between state and components.
This also means that [code-splitting](https://webpack.js.org/guides/code-splitting/) works out of the 
box with Kea. No configuration required.

TODO

- Scales well as your app grows
- Logic connects to each other
- Extendable with plugins
- ...

## What is Kea *not* good for?

TODO 

- We use functional paradigms (don't modify state, make new stuff)
- Not needed for very small apps
- Has a bit of magic, so keep away if you are afraid
- GraphQL support is lacking
- Very opinionated
- ...

## Why "kea"?

TODO 

According to [Wikipedia](https://en.wikipedia.org/wiki/Kea):

> The kea (/ˈkiːə/; Māori: [kɛ.a]) is a species of large parrot 
> found in the forested and alpine regions of the South Island of New Zealand.
>
> Kea are known for their intelligence and curiosity. Kea can solve logical puzzles, such as pushing 
> and pulling things in a certain order to get to food, and will work together to achieve a certain 
> objective.

Kea the framework follows a similar approach. 
