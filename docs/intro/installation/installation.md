---
sidebar_position: 2
---

# Installation

## Shortcut: CRA template

To create a new app based on [kea's create-react-app typescript template](https://github.com/keajs/cra-template-kea-typescript),
run the following:

```shell
# 2.0
yarn create react-app --template kea-typescript my-kea-app-v2
cd my-kea-app-v2
yarn start

# 3.0, for now
yarn create react-app --template kea-typescript@next my-kea-app-v3
cd my-kea-app-v3
yarn start
```

This sets up a new project with `kea` and `kea-typegen`, and adds
the plugins `kea-router` and `kea-loaders`. It's the fastest way to just try out Kea.

## Install Kea manually

Installing `kea` is rather straightforward. You need to install some packages and optionally call `resetContext`.

### 1. Install `kea`

The `kea` package comes bundled with everything you need to get started. It also bundles `redux` and `reselect`.

```shell
# if you're using yarn
yarn add kea

# if you're using npm
npm install kea --save
```

### 2. Optional: Reset Kea's context

Kea stores all of its data on a [context](/docs/intro/context), which must be set up before any `logic` can be used. This
context stores a reference to the redux store, initializes all plugins, caches all built logic and keeps
track of what is mounted and what is not.

Kea comes with a default context already set, but to initialize custom plugins and pass advanced options, call 
`resetContext(options)` before rendering your app.

```tsx
import { resetContext } from 'kea'
import { createRoot } from 'react-dom/client'

resetContext({
  plugins: [
    // additional kea plugins
  ],
})

// some time later
createRoot(document.getElementById('root')).render(<App />)
```

### 3. Disable StrictMode

If you're using `<React.StrictMode>` anywhere, remove it. Kea works well with concurrent rendering, just not with strict mode.

### 4. TypeScript support

If you're using [TypeScript](/docs/intro/typescript) (and everybody should), and want automatic type generation,
you'll need to [set up kea-typegen](/docs/intro/typescript#option-2-kea-typegen) as well.

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

Read more about [TypeScript Support in Kea](/docs/intro/typescript).
