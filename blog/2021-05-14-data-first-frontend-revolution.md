---
id: data-first-frontend-revolution
title: It's time for a data-first frontend revolution
author: Marius Andra
author_title: Kea Core Team, Software Engineer at PostHog
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, opinion, data-first]
---

Back in 2015, shortly after learning about React and Redux, I fell in love with the *functional programming* paradigms behind them *because* of what they enabled. 

By following a few principles of immutability and purity, React frontends were generally better written, stabler and easier to debug, compared to contemporary alternatives such as Ember or Angular.

Having seen what a bit of functional programming did to JavaScript, I started looking into [Clojure](https://learnxinyminutes.com/docs/clojure/), the most popular functional language at the time, and into [ClojureScript](https://clojurescript.org/) frontend frameworks: [reagent](https://github.com/reagent-project/reagent), [quiescent](https://github.com/levand/quiescent), [om](https://github.com/omcljs/om), [om.next](https://github.com/omcljs/om/wiki/Quick-Start-(om.next)), and [re-frame](https://github.com/day8/re-frame). Now there's also [fulcro](https://github.com/fulcrologic/fulcro) that wasn't around back then.

What stood out was how they all handled *application state*. 

They all had developed [at least three](http://day8.github.io/re-frame/a-loop/) globally isolated layers:

```js
// obvious pseudocode
async function renderApp() {
    while(await waitForChanges()) {
        // gather the input (check the url and call APIs)
        const input = await getInputFromURLAndAPIs(window)
        // normalize that to an intermediary app state
        const appState = convertInputToApplicationState(input)
        // create HTML out of that intermediary state
        const html = convertApplicationStateToHTML(appState)
        
        render(html)
    }
}
```

No framework skipped the application state step. Nobody did this:

```js
async function renderApp() {
    while(await waitForChanges()) {
        // gather the input (check the url and call APIs)
        const input = await getInputFromURLAndAPIs(window)
        // create HTML out of that input
        const html = convertInputToHTML(input)
        render(html)
    }
}
```

Yet that's exactly what you're doing when you store application state in React components.

### The three layers

All these frameworks reached the conclusion that the best way to convert API responses to DOM nodes was to first convert them to an intermediary representation: the global application state.

These three layers (input, data and view) have overlapping, yet separate and parallel hierarchies:

<img alt="Kea TypeScript ResetContext" src="/img/blog/react/three-layers.png" loading="lazy" />

The structure of your input data is different from the structure of your application state, which is different from the structure of your DOM nodes.

The folks at Facebook/React agree: [to build great user experiences, you benefit from having parallel data and view trees](https://reactjs.org/blog/2019/11/06/building-great-user-experiences-with-concurrent-mode-and-suspense.html#parallel-data-and-view-trees). They do use Relay after all for their state.

Yet the work with [Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html), [Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html), [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions), [`startTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#wrapping-setstate-in-a-transition), [`useDeferredValue`](https://reactjs.org/docs/concurrent-mode-patterns.html#deferring-a-value), the suggestion to [start fetching early in event callbacks](https://reactjs.org/docs/concurrent-mode-suspense.html#start-fetching-early), etc, is moving React in a direction where it's taking on more and more responsibilities from the data layer.

I think this is a clear step backwards for maintainability.

:::note Wild speculation
This is pure speculation, but I think this is why Suspense is still considered [experimental](https://reactjs.org/docs/concurrent-mode-suspense.html) in 2021, despite having been in development for [over 3 years](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html). It's just not that easy to blend the data and view layers in a way that makes everyone happy. Hence things keep being pushed til "when it's done".
:::

### Put your data first

I think it's time for a change. It's time for a paradigm shift.

It's time for a revolution in *data-first frontend frameworks*, which relegate React to what it does best: rendering and diffing DOM nodes. Values in, actions out. No `useState`. No `useEffect`.

In practice this means adopting a data layer as the core of your application. 

It means going from:

```
Frontend > React > [state management library of choice]
```

to

```
Frontend > Data Layer > View Layer (React)
```

[Rob Pike](https://users.ece.utexas.edu/~adnan/pike.html) puts it best:

> Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident. Data structures, not algorithms, are central to programming.

In all my years of programming I have yet to see an exception to this rule. On the contrary, teaching this to junior developers has proven to be the *single most impactful thing* in improving their code quality.

Forget JSX templates. Forget algorithms. [Get your data structures right](https://acco.io/i-escaped-node), and the rest will follow:

> From that moment forward, I would see this everywhere. If ever I felt like my program was getting too complicated or hard to read, it was almost always a data structure problem. Since then, every time I've been humbled by another programmer's code, it hasn't been by clever tricks or algorithms. It has always been by their ingenious insight into how their program's data ought to be organized.

It's time for a change. It's time for a paradigm shift. It's time for a revolution in data-first frontend frameworks that control the view layer and not the other way around.

Since you're reading this on the [Kea blog](https://kea.js.org/blog/), I'm obviously biased as to what's the [best data layer](https://kea.js.org) for frontend developers. Suggesting alternatives is made even more complicated by the fact that most other tools position themselves as "state management" libraries, at the mercy of React. 

[Kea](https://kea.js.org) is one of the few frameworks for managing the complete lifecycle of your data. It uses [React](https://reactjs.org/) as the view layer and integrates nicely with the existing [Redux](https://redux.js.org/) ecosystem. 

Go [check it out](https://kea.js.org) and then start writing webapps the way they were meant to be written: data first.

