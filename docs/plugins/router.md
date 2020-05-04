---
id: router
title: Router
sidebar_label: Router
---

The `kea-router` plugin provides a nice wrapper around `window.History` and helps manage the URL 
in your application. Use it to listen to route changes or change the URL yourself. There are a 
few helpers (`actionToUrl` and `urlToAction`) that help track the URL changes, or access the 
`router` directly to manually control the browser history object.

## Installation

First install the [`kea-router`](https://github.com/keajs/kea-router) package:

```shell
# if you're using yarn
yarn add kea-router

# if you're using npm
npm install --save kea-router
```

Then install the plugin:

```javascript
import { routerPlugin } from 'kea-router'
import { resetContext } from 'kea'

resetContext({
    plugins: [
        routerPlugin({
            /* options */
        })
    ],
})
```

## Configuration options

The plugin takes the following options:

```javascript
routerPlugin({
    // The browser History API or something that mocks it
    // Defaults to window.history in the browser and a mock memoryHistory otherwise
    history: window.history,

    // An object with the keys { pathname, search, hash } used to
    // get the current location. Defaults to window.location in the browser and
    // an empty object otherwise.
    location: window.location,

    // If there is a difference between the path in the browser and the path in
    // your routes, use these functions to clear it up.
    // For example to have the same app on many subfolders in one the site.
    pathFromRoutesToWindow: (path) => '/subfolder' + path,
    pathFromWindowToRoutes: (path) => path.replace(/^\/subfolder/, ''),
})
```

## Sample usage

Use `actionToUrl` to change the URL in response to actions and `urlToAction` to dispatch actions when the route changes

```javascript
import { kea } from 'kea'

export const articlesLogic = kea({
  // define the actions from below
  actions: () => ({ ... }),

  // define article = { id, ... }
  reducers: () => ({ ... }),

  actionToUrl: ({ actions, values }) => ({
    [actions.openList]: ({ id }) => `/articles`,
    [actions.openArticle]: ({ id }) => `/articles/${id}`,
    [actions.openComments]: () => `/articles/${values.article.id}/comments`,
    [actions.closeComments]: () => `/articles/${values.article.id}`
  }),

  urlToAction: ({ actions }) => ({
    '/articles': () => actions.openList(),
    '/articles/:id(/:extra)': ({ id, extra }) => {
      actions.openArticle(id)
      if (extra === 'comments') {
        actions.openComments()
      } else {
        actions.closeComments()
      }
    },
  })
})
```

### Control the route directly

Import `router` to control the router directly

```javascript
import React from 'react'
import { useActions, useValues } from 'kea'
import { router } from 'kea-router'

export function MyComponent() {
    const { push, replace } = useActions(router)
    const {
        location: { pathname, search, hash },
    } = useValues(router)

    return (
        <div>
            {pathname === '/setup' ? <Setup /> : <Dashboard />}
            <button onclick={() => push('/setup')}>Open Setup</button>
        </div>
    )
}
```

### Link tag

Create an `A` tag to make linking easier

```javascript
import React from 'react'
import { router } from 'kea-router'

// use <A href=''> instead of <a href=''> to open links via the router
export function A(props) {
    return (
        <a
            {...props}
            onClick={(event) => {
                if (!props.target) {
                    event.preventDefault()
                    router.actions.push(props.href) // router is mounted automatically, so this is safe to call
                }
                props.onClick && props.onClick(event)
            }}
        />
    )
}
```

### Listen to location changes

Listen to the `locationChanged` action to react to URL changes manually

```javascript
import { kea } from 'kea'
import { router } from 'kea-router'

const otherLogic = kea({
    listeners: () => ({
        [router.actions.locationChanged]: ({ pathname, search, hash, method }) => {
            console.log({ pathname, search })
        },
    }),
})
```

### Global scene router

Here's sample code for a global scene router

```javascript
import React, { lazy, useMemo } from 'react'
import { router } from 'kea-router'

export const scenes = {
  'dashboard': () => import(/* webpackChunkName: 'dashboard' */'./dashboard/DashboardScene'),
  'login': () => import(/* webpackChunkName: 'login' */'./login/LoginScene'),
  'projects': () => import(/* webpackChunkName: 'projects' */'./projects/ProjectsScene'),
}

export const routes = {
  '/': 'dashboard',
  '/login': 'login',
  '/projects': 'projects',
  '/projects/:id', 'projects'
}

export const sceneLogic = kea({
  actions: () => ({
    setScene: (scene, params) => ({ scene, params })
  }),
  reducers: ({ actions }) => ({
    scene: [null, {
      [actions.setScene]: (_, payload) => payload.scene
    }],
    params: [{}, {
      [actions.setScene]: (_, payload) => payload.params || {}
    }]
  }),
  urlToAction: ({ actions }) => {
    const mapping = {}
    for (const [paths, scene] of Object.entries(routes)) {
      for (const path of paths.split('|')) {
        mapping[path] = params => actions.setScene(scene, params)
      }
    }
    return mapping
  }
})

export function Layout({ children }) {
  return (
    <div className='layout'>
      <div className='menu'>...</div>
      <div className='content'>{children}</div>
    </div>
  )
}

export function Scenes() {
  const { scene, params } = useValues(sceneLogic)

  const Scene = useMemo(() => {
    return scenes[scene] ? lazy(scenes[scene]) : () => <div>404</div>
  }, [scene])

  return (
    <Layout>
      <Suspense fallback={() => <div>Loading...</div>}>
        <Scene {...params} />
      </Suspense>
    </Layout>
  )
}
```
