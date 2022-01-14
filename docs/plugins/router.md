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
        }),
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
    decodeParams: (input = '?key=value', symbol = '?') => ({ key: 'value' }),
    
    // Passed directly to url-pattern.   
    urlPatternOptions: {
        // What characters to match as ":key" with "/url/:key"
        // You must set this explicitly if you need to match a "." or a "@"
        segmentValueCharset: "a-zA-Z0-9-_~ %.@()!'",
    },
})
```

## Sample usage

Use `actionToUrl` to change the URL in response to actions and `urlToAction` to dispatch actions when the route changes

```javascript
import { kea } from 'kea'

export const articlesLogic = kea({
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
    }),

    // Skipped in the examples: the actions, reducers, etc for the above
    actions: { ... },
    reducers: { ... },
    selectors: { ... }
})
```

### Url Pattern

`kea-router` uses the [url-pattern](https://github.com/snd/url-pattern) library under the hood to match
paths. Please see [its documentation](https://github.com/snd/url-pattern) for all supported options.

### UrlToAction

#### Search and Hash parameters

`kea-router` has built in support for serializing and deserializing `search` and `hash` URL parameters, such as:

```javascript
// "pathname" + "?search" + "#hash"
url = 'http://example.com/path?searchParam=true#hashParam=nah'
```

The second and third parameters to `urlToAction` are `searchParams` and `hashParams` respectively.
These are deserialized objects that you can use directly.

#### Full example

```javascript
import { kea } from 'kea'

export const articlesLogic = kea({
    urlToAction: ({ actions }) => ({
        // Synax:
        //   urlToAction: ({ actions }) => ({
        //     '/path': (pathParams, searchParams, hashParams, payload) => {
        //       // ...
        //     }
        //   })
        //
        // Example on url: "/articles?id=123&comments=true#hashKey=hurray"
        // --> pathParams = {}
        // --> searchParams = { id: 123, comments: true }
        // --> hashParams = { hashKey: 'hurray' }
        // --> payload = // payload for router.actions.locationChanged
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
        },
    }),
})
```

For `actionToUrl`, you may include the `search` and `hash` parts directly in the URL or return
an array in the format: `[pathname, searchParams, hashParams]`. The `searchParams` and `hashParams`
can be both strings or objects.

```javascript
import { kea } from 'kea'

export const articlesLogic = kea({
    actionToUrl: ({ values }) => ({
        // Use one of:
        // - action: () => url,
        // - action: () => [url, searchParams, hashParams],

        openList: ({ id }) => `/articles`,

        // these three are equivalent
        openArticle: ({ id }) => `/articles?id=${id}`,
        openArticle: ({ id }) => [`/articles`, { id }],
        openArticle: ({ id }) => [`/articles`, `?id=${id}`],

        openComments: () => [`/articles`, { id: values.article.id, comments: true }],
        closeComments: () => [`/articles`, { id: values.article.id }, '#hashKey=true'],
    }),
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
        location: { pathname, search, hash }, // strings
        searchParams, // object
        hashParams, // object
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
    actions: {
        buttonPress: true,
    },

    listeners: {
        buttonPress: () => {
            if (router.values.location.pathname !== '/setup') {
                router.actions.push('/setup', { search: 'param' }, '#integration')
            }
        },
    },
})
```

Both the `push` and `replace` actions accept `searchParams` and `hashParams` as their second and
third arguments. You can provide both an object or a string for them. You can also include the
search and hash parts in the `url`.

### Link tag

Use the included `<A>` tag to link via the router. This changes the URL via `router.actions.push()` instead of reloading the entire page.

```javascript
import React from 'react'
import { A } from 'kea-router'

// use <A href=''> instead of <a href=''> to open links via the router
export function Page() {
    return (
        <ul>
            <li>
                <A href="/about">About me</A>
            </li>
            <li>
                <A href="/contact">Contact</A>
            </li>
        </ul>
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
    listeners: {
        [router.actions.locationChanged]: ({ pathname, search, hash, method }) => {
            console.log({ pathname, search })
        },
    },
})
```

### Global scene router

Here's sample code for a global scene router

```javascript
import React, { lazy } from 'react'

export const scenes = {
    error404: () => <div>404</div>,
    dashboard: lazy(() => import('./dashboard/DashboardScene')),
    login: lazy(() => import('./login/LoginScene')),
    projects: lazy(() => import('./projects/ProjectsScene')),
}

export const routes = {
    '/': 'dashboard',
    '/login': 'login',
    '/projects': 'projects',
    '/projects/:id': 'projects',
}

export const sceneLogic = kea({
    actions: {
        setScene: (scene, params) => ({ scene, params }),
    },
    reducers: {
        scene: [
            null,
            {
                setScene: (_, payload) => payload.scene,
            },
        ],
        params: [
            {},
            {
                setScene: (_, payload) => payload.params || {},
            },
        ],
    },
    urlToAction: ({ actions }) => {
        return Object.fromEntries(
            Object.entries(routes).map(([path, scene]) => {
                return [path, (params) => actions.setScene(scene, params)]
            })
        )
    },
})

export function Layout({ children }) {
    return (
        <div className="layout">
            <div className="menu">...</div>
            <div className="content">{children}</div>
        </div>
    )
}

export function Scenes() {
    const { scene, params } = useValues(sceneLogic)

    const Scene = scenes[scene] || scenes.error404

    return (
        <Layout>
            <Suspense fallback={() => <div>Loading...</div>}>
                <Scene {...params} />
            </Suspense>
        </Layout>
    )
}
```

### Utility functions

`kea-router` exposes three functions to help manage urls in your app:

```javascript
import { encodeParams, decodeParams, combineUrl } from 'kea-router'

// Use `encodeParams` to convert an object to part of a path
// --> encodeParams(object, symbol)
encodeParams({ key: 'value' }, '?') === '?key=value'

// Use `decodeParams` to convert a part of a path to an object
// --> decodeParams(object, symbol)
decodeParams('?key=value', '?') === { key: 'value' }
decodeParams('key=value', '?') === { key: 'value' }

// Use `combineUrl` to both split an existing url into its components and
// to merge new search and hash parts into an existing url.
// --> combineUrl(url, searchInput, hashInput, encodeParams, decodeParams)
//   - `searchInput` and `hashInput` can be either a string or an object
//   - `encodeParams` and `decodeParams` can be overridden if needed
combineUrl('/path?key=value#hash') ===
    {
        url: '/path?key=value#hash',
        pathname: '/path',
        search: '?key=value',
        searchParams: { key: 'value' },
        hash: '#hash',
        hashParams: { hash: null },
    }
combineUrl('/path?key=value#hash', { key: 'otherValue' }, '#addHash=bla') ===
    {
        url: '/path?key=otherValue#hash&addHash=bla',
        pathname: '/path',
        search: '?key=otherValue',
        searchParams: { key: 'otherValue' },
        hash: '#hash&addHash=bla',
        hashParams: { hash: null, addHash: 'bla' },
    }
```
