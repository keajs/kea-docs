---
id: installation
title: Installation
sidebar_label: Installation
---

Installing kea is rather straightforward. You need to add the kea package, reset kea's context and wrap your app with react-redux's <Provider /> tag.

## Install the packages

```shell
# if you're using yarn
yarn add kea redux react-redux reselect

# if you're using npm
npm install kea redux react-redux reselect --save
```

## Set up Kea's context

Kea stores all of its data on a context, which must be set up before any logic can be used. This context stores a reference to the redux store, initializes all plugins, caches all built logic and keeps track of what is mounted and what is not.

To set it up, just call resetContext(options) before rendering your app.

Then also wrap your <App /> with Redux's <Provider />, getting the store from getContext().

This is how your index.js would look like if you used create-react-app:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import { resetContext, getContext } from "kea"; // <-- add this
import { Provider } from "react-redux"; // <---------- add this
import "./index.css";
import App from "./App";

resetContext({
  // <----------------------------------- add this
  createStore: {
    // additional options (e.g. middleware, reducers, ...)
  },
  plugins: [
    // additional kea plugins
  ],
});

ReactDOM.render(
  // <-------------------------- and update this
  <Provider store={getContext().store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

And you're done! Feel free to use kea() calls anywhere in your code!

## A note about call order

In versions of Kea before 1.0, you had to run the setup code before any call to kea({}) was made. This is no longer the case. Each call to kea({}) lazily loads the logic and builds it only when requested, either when mounted onto a React component or instructed to do so manually (via logic.build() and/or logic.mount()).

Calling resetContext() always clears all initialised logic and reverts your app to a clean state.
