---
id: instructions
title: Installation Instructions
sidebar_label: Instructions
---

:::note
If you're using a JS framework such as [next.js](/docs/installation/nextjs), check out the 
[detailed instructions](/docs/installation/nextjs) for it. 
The instructions below should work for most setups though.
:::

## Shortcut: CRA template

To create a new app based on [kea's create-react-app typescript template](https://github.com/keajs/cra-template-kea-typescript),
run the following:

```sh
yarn create react-app my-kea-app --template kea-typescript
cd my-kea-app
yarn start
```

This sets up a new project with `kea` and `kea-typegen`, and adds
the plugins `kea-router` and `kea-loaders`. It's the fastest way to just try out Kea.

## Install Kea manually

Installing `kea` is rather straightforward. You need to install some packages, reset kea's context and 
wrap your app with react-redux's `<Provider />` tag.

### 1. Install some packages

In addition to `kea` you will also need [`redux`](https://redux.js.org/), 
[`react-redux`](https://react-redux.js.org/) and [`reselect`](https://github.com/reduxjs/reselect). 

```shell
# if you're using yarn
yarn add kea redux react-redux reselect

# if you're using npm
npm install kea redux react-redux reselect --save
```

### 2. Set up Kea's context

Kea stores all of its data on a **context**, which must be set up before any `logic` can be used. This 
context stores a reference to the redux store, initializes all plugins, caches all built logic and keeps
track of what is mounted and what is not.

To set it up, just call `resetContext(options)` before rendering your app.

### 3. Wrap with `<Provider />`

Then wrap your `<App />` with Redux's `<Provider />`, getting the `store` from `getContext()`.

This is how your `index.js` would look like if you used `create-react-app`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { resetContext, getContext } from 'kea' // 👈 add this
import { Provider } from 'react-redux' // 👈 add this
import './index.css'
import App from './App'

resetContext({ // 👈 add this    
    createStore: {
        // options for redux (e.g. middleware, reducers, ...)
    },
    plugins: [
        // additional kea plugins
    ],
})

ReactDOM.render( // 👈 and update this    
    <Provider store={getContext().store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
```

That's it! Feel free to use `kea()` calls anywhere in your code!

### 4. TypeScript support

If you're using TypeScript (and everybody should), you'll need to [set up kea-typegen](/docs/guide/typescript#option-1-kea-typegen) as well.

First, run the following:

```shell
yarn add kea-typegen concurrently --dev
```

Then add the following to your `.gitignore`:

```gitignore
# kea
*Type.ts
```

Finally, change your start script in `package.json`

```json
{
  "scripts": {
    "start": "concurrently \"yarn start:app\" \"yarn start:kea\" -n APP,KEA -c blue,green",
    "start:app": "react-scripts start  # put your old 'start' script here",
    "start:kea": "kea-typegen watch"
  }
}
```

Read more about [TypeScript Support in Kea](/docs/guide/typescript).

<br />

:::note Next Steps
* Read [Core Concepts](/docs/guide/concepts) to get a good understanding of how Kea works and why.
:::