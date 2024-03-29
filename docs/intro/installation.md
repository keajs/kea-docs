---
sidebar_position: 2
---

# Installation

## Shortcut 1: Vite starter

Use [`vite-kea-react-ts-template`](https://github.com/keajs/vite-kea-react-ts-template) via `degit` as the basis for your project.

Simplty run:

```bash
npx degit keajs/vite-kea-react-ts-template my-project
cd my-project
npm install
npm run dev
```

## Shortcut 2: CRA template

To create a new app based on [kea's create-react-app typescript template](https://github.com/keajs/cra-template-kea-typescript),
run the following:

```shell
yarn create react-app --template kea-typescript my-next-startup
cd my-next-startup
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

If you're using `<React.StrictMode>` anywhere, remove it. Kea works well with React 18 and concurrent rendering, just not with strict mode.

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
    "start:app": "# put your old 'start' script here",
    "start:kea": "kea-typegen watch --write-paths"
  }
}
```

Read more about [TypeScript Support in Kea](/docs/intro/typescript).
