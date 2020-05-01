---
id: what-is-kea
title: What is Kea?
sidebar_label: What is Kea?
---

import useBaseUrl from '@docusaurus/useBaseUrl'; 

Kea is a production-grade framework built for managing state in ambitious React apps.

It scales really well as your app grows and keeps your state management logic neat and clean.

<img alt="Redux Devtools with Inline Paths" src={useBaseUrl('img/introduction/how-does-kea-work.png')} style={{ maxWidth: 611 }} />
<br /><br /> 

Kea is built on top of Redux and aims to make your state simple and predictable. 

* Every operation in your app starts with an **action** (*increment counter*) 
* These actions modify **reducers** (*counter*) that hold the actual data.
* This data is stored in a global **state** through Redux. 
* Reducers export **values** (*counter is 1*) through **selectors** (*find the counter in the state*).
* Actions may also trigger **listeners**, which are async functions that can call actions and read values.
* You group actions, reducers and listeners into a **logic** (*counterLogic*)
* React Components fetch actions and values from the logic and display or call them as needed.    



## Why "kea"?

According to Wikipedia:

> The [kea](https://en.wikipedia.org/wiki/Kea) (/ˈkiːə/; Māori: [kɛ.a]) is a species of large parrot 
> found in the forested and alpine regions of the South Island of New Zealand.
>
> Kea are known for their intelligence and curiosity. Kea can solve logical puzzles, such as pushing 
> and pulling things in a certain order to get to food, and will work together to achieve a certain 
> objective.

Kea the framework follows a similar approach