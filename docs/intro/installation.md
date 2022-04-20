---
sidebar_position: 2
---

# Installation

## Shortcut: CRA template

To create a new app based on [kea's create-react-app typescript template](https://github.com/keajs/cra-template-kea-typescript),
run the following:

```sh
yarn create react-app --template kea-typescript my-kea-app
cd my-kea-app
yarn start
```

This sets up a new project with `kea` and `kea-typegen`, and adds
the plugins `kea-router` and `kea-loaders`. It's the fastest way to just try out Kea.

## Install Kea manually

Installing `kea` is rather straightforward. You need to install some packages, optionally call `resetContext`
and wrap your app with a `<Provider />` tag.

### 1. Install some packages

In addition to `kea` you will also need [`redux`](https://redux.js.org/),
[`react-redux`](https://react-redux.js.org/) and [`reselect`](https://github.com/reduxjs/reselect).

```shell
# if you're using yarn
yarn add kea redux react-redux reselect

# if you're using npm
npm install kea redux react-redux reselect --save
```

### 2. Optional: Reset Kea's context

Kea stores all of its data on a [context](context), which must be set up before any `logic` can be used. This
context stores a reference to the redux store, initializes all plugins, caches all built logic and keeps
track of what is mounted and what is not.

Kea comes with a default context already set, but to initialize custom plugins and pass advanced options, call 
`resetContext(options)` before rendering your app.

### 3. Wrap with `<Provider />`

Then wrap your `<App />` with `<Provider />`.

This is how your `index.js` would look like if you used `create-react-app`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { resetContext, Provider } from 'kea' // 👈 add this
import './index.css'
import App from './App'

resetContext({
  // 👈 add this
  createStore: {
    // options for redux (e.g. middleware, reducers, ...)
  },
  plugins: [
    // additional kea plugins
  ],
})

ReactDOM.render(
  // 👈 and update this
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

That's it! Feel free to use `kea()` calls anywhere in your code!

### 4. TypeScript support

If you're using [TypeScript](typescript) (and everybody should), and want automatic type generation,
you'll need to [set up kea-typegen](typescript#option-2-kea-typegen) as well.

First, run the following:

```shell
yarn add kea-typegen concurrently --dev
```

Then, change your start script in `package.json`

```json
{
  "scripts": {
    "start": "concurrently \"yarn start:app\" \"yarn start:kea\" -n APP,KEA -c blue,green",
    "start:app": "react-scripts start  # put your old 'start' script here",
    "start:kea": "kea-typegen watch"
  }
}
```

Read more about [TypeScript Support in Kea](./typescript).
