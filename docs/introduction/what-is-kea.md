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
* Actions may also trigger **listeners**, which are async functions that call other actions,
  read values or talk with the externals APIs that your app depends on.
  Listeners *dispatch* actions if they need to update data or trigger other listeners.
* Related actions, reducers, selectors and listeners are grouped into a **logic** (*counterLogic*).
* React Components **connect** to logic and pull in all actions and values they need.    

Read the [installation instructions](/docs/introduction/installation) to add  Kea to your app or 
check out the [quickstart](/docs/introduction/quickstart) to see some code. 

## Why "kea"?

According to [Wikipedia](https://en.wikipedia.org/wiki/Kea):

> The kea (/ˈkiːə/; Māori: [kɛ.a]) is a species of large parrot 
> found in the forested and alpine regions of the South Island of New Zealand.
>
> Kea are known for their intelligence and curiosity. Kea can solve logical puzzles, such as pushing 
> and pulling things in a certain order to get to food, and will work together to achieve a certain 
> objective.

Kea the framework follows a similar approach. 

TODO: expand on this