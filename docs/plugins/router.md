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

    // kea-router has support for (de)serializing the search and hash parameters
    // It comes with sensible default functions, yet you can override them here
    encodeParams: (obj = { key: 'value' }, symbol = '?') => '?key=value',
    decodeParams: (input = '?key=value', symbol = '?') => ({ key: 'value' })
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
    
    actionToUrl: ({ values }) => ({
        openList: ({ id }) => `/articles`,
        openArticle: ({ id }) => `/articles/${id}`,
        openComments: () => `/articles/${values.article.id}/comments`,
        closeComments: () => `/articles/${values.article.id}`
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

### Url Pattern

`kea-router` uses the [url-pattern](https://github.com/snd/url-pattern) library under the hood to match
paths. Please see [its documentation](https://github.com/snd/url-pattern) for all supported options.

### Search and Hash parameters

In case you want to use search and hash parameters, it's pretty easy.

For `actionToUrl`, either include them in the URL or return an array in the format:
`[pathname, search, hash]`. The `search` and `hash` elements in that array may be either
strings or objects, which would then be serialised. 

For `urlToAction`, the second parameter will be the deserialised `search` object and the third
parameter will be the `hash` object:

```javascript
import { kea } from 'kea'

export const articlesLogic = kea({
    actionToUrl: ({ values }) => ({
        openList: ({ id }) => `/articles`,
        // these three are equivalent
        openArticle: ({ id }) => `/articles?id=${id}`,
        openArticle: ({ id }) => [`/articles`, { id }],
        openArticle: ({ id }) => [`/articles`, `?id=${id}`],
        openComments: () => [`/articles`, { id: values.article.id, comments: true }],
        closeComments: () => [`/articles`, { id: values.article.id }, '#hashKey=true'],
    }),

    urlToAction: ({ actions }) => ({
        // pathname, search object, hash object 
        '/articles': (_, { id, comments }, { hashKey }) => {
            if (id) {
                actions.openArticle(id)
                if (comments) {
                    actions.openComments()
                } else {
                    actions.closeComments()
                }
            } else {
                actions.openList()
            }
        }
    })
})
```

### Control the route directly

Import `router` to control the router directly in your components

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

Or in a logic:

```javascript
import { kea } from 'kea'
import { router } from 'kea-router'

const logic = kea({
    actions: () => ({
        buttonPress: true,
    }),

    listeners: () => ({
        buttonPress: () => {
            if (router.values.location.pathname !== '/setup') {
                router.actions.push("/setup", { search: 'param' }, '#integration')
            }
        }
    })
})
```

Both the `push` and `replace` actions accept search and hash parameters as their second and
third arguments. You can provide both an object or a string for them.

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

In case `urlToAction` is not sufficient for your needs, listen to the `locationChanged` action to 
react to URL changes manually:

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

export const scenes = {
    'dashboard': () => import(/* webpackChunkName: 'dashboard' */'./dashboard/DashboardScene'),
    'login': () => import(/* webpackChunkName: 'login' */'./login/LoginScene'),
    'projects': () => import(/* webpackChunkName: 'projects' */'./projects/ProjectsScene'),
}

export const routes = {
    '/': 'dashboard',
    '/login': 'login',
    '/projects': 'projects',
    '/projects/:id': 'projects'
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
