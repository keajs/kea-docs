---
id: suspense-is-the-wrong-abstraction
title: 'Suspense is the wrong abstraction'
author: Marius Andra
author_title: Kea Core Team, Software Engineer at PostHog
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, release]
---

Back in 2016, shortly after learning about React and Redux, I fell in love with the *functional programming* paradigms behind them. 

By following a few principles of immutability and purity, React frontends were generally better written, stabler and easier to debug, when compared to alternative contemporary frameworks like Ember or Angular.

Having seen what a bit of functional programming did to JavaScript, and believing the grass to be cut better in the functional programming world, I started looking into [Clojure](https://learnxinyminutes.com/docs/clojure/). More specifically, into ClojureScript frontend frameworks. 

Frameworks such as [reagent](https://github.com/reagent-project/reagent) (dead), [quiescent](https://github.com/levand/quiescent) (dead), [om](https://github.com/omcljs/om) (dead), [om.next](https://github.com/omcljs/om/wiki/Quick-Start-(om.next)) (dead), [re-frame](https://github.com/day8/re-frame) (active). Now there's also [fulcro](https://github.com/fulcrologic/fulcro) that wasn't around back then.

What stood out was how they all handled *application state*. 

They all had developed [at least three](http://day8.github.io/re-frame/a-loop/) globally isolated layers, such as:

```js
// obviously pseudocode
async function renderApp() {
    // gather the input
    const input = await getInputFromURLAndAPIs(window)
    // convert that to an intermediary format
    const appState = convertInputToApplicationState(input)
    // convert that intermediary format to HTML
    const html = convertApplicationStateToHTML(appState)
    return html
}
```

The rendering phase, what we call React, would just select slices of this state and put that HTML tags.

No framework skipped the application d

```js
async function renderApp() {
    const input = await getInputFromURLAndAPIs(window)
    const html = convertInputToHTML(input)
    return html
}
```

All these frameworks reached the conclusion that the best way to convert API responses to DOM nodes was to first convert them to an intermediary representation: a global application state.

That's because these steps have overlapping, yet separate and parallel hierarchies. 

[
  Image: 
  1. Input layer boxes: URL, users API response, searchfield text
  2. Data layer boxes: account, scenes/users, sidebar, scenes/users/summary
  3. View layer tree: <html><Header/><Nav/><Scene><Users /></Scene></html>
]

The hierarchical structure of your input data is different than the hierarchical structure of your application state data, which is different than the hierarchical structure of your output DOM nodes.

The folks at React agree: [to build great user experiences, you benefit from having parallel data and view trees](https://reactjs.org/blog/2019/11/06/building-great-user-experiences-with-concurrent-mode-and-suspense.html#parallel-data-and-view-trees). They do use Relay after all for their state.

Yet the work with [Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html), [Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html), [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions), [`startTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#wrapping-setstate-in-a-transition), [`useDeferredValue`](https://reactjs.org/docs/concurrent-mode-patterns.html#deferring-a-value), the suggestion to [start fetching early in event callbacks](https://reactjs.org/docs/concurrent-mode-suspense.html#start-fetching-early), etc, is moving React in a direction where it's taking on more and more responsibilities from the data layer.

This is pure speculation, but I think this is why Suspense is still considered [experimental](https://reactjs.org/docs/concurrent-mode-suspense.html) in 2021, despite having been in development for [over 3 years](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html). It's just not that easy to merge the two bottom layers in a way that makes everyone happy. Hence things keep being pushed till "when it's done".

I think it's time for a change. It's time for a paradigm shift.

It's time for a revolution in Data-First JavaScript Frontend Frameworks, which relegate React to what it does best in the world: rendering and diffing DOM nodes. Values in, actions out. No hooks. No local state. No `useEffect`.

In practice this means adopting a data layer as the core of your application.

This also means a mindset shift fro,

```
Frontend > React > [state management library of choice]
```

to

```
Frontend > Data Layer + View Layer
```

Since you're reading this on the [Kea blog](https://kea.js.org/blog/), I'm obviously biased as to what's the best data layer out there. 

























Why do people keep thinking it's fine to start `fetch`ing inside `useEffect` and the to store that in local `state`?







Pushing forward with Suspense and concurrent mode means to doubling down on this approach. The reason they have been years in the making at this point is because they're basically running an experiment in how far you can go with removing the application layer and putting everything into the view layer.

My theory is that they haven't released anything yet because they've run into unsurpassable blocks, which come from having the wrong abstraction in the first place.




React does somewhat separate the app state layer (code before `return <div />`) and the view layer (`return <div />`), but it's a partial separation.

This is, again, perfect for a component that fetches a user's profile and displays it at the same time. It's less perfect for a fleet tracking application.

We're not all building a website that displays personal data from you and your friends in increasingly complex components with the main goal of selling you ads (Facebook) or other products (Airbnb). 

In those cases, the data layer

It's time for a revolution of Data-Driven Javascript Frontends, which relegate React to being what it does best: the view layer.






Just look at this simple example:

```js
function App() {
  const [text, setText] = useState("hello");
  const deferredText = useDeferredValue(text, {
    timeoutMs: 5000
  });

  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <div className="App">
      <label>
        Type into the input:{" "}
        <input value={text} onChange={handleChange} />
      </label>
      ...
      <MySlowList text={deferredText} />
    </div>
  );
}
```

It shouldn't be the `App` that knows it should bounce the input, but only for `MySlowList`. 


Clojure took these paradigms a big step further. In addition to writing your user interface and state management layers functionally, you would write everything else as well. If a bit of functional programming is good, the reasoning went, a lot of it should be even better.
