---
id: nextjs
title: Next.js
sidebar_label: Next.js
---

:::note
Here are the steps you must take to get set up **Kea with Next.js**.

[For generic installation instructions, click here](/docs/intro/installation/).
:::

## Install the packages

In addition to the `kea`, you must also install the
[`babel-plugin-kea`](/docs/intro/debugging) and
[`next-redux-wrapper`](https://github.com/kirill-konshin/next-redux-wrapper) packages:

```shell
# if you're using yarn
yarn add kea next-redux-wrapper
yarn add --dev babel-plugin-kea

# if you're using npm
npm install kea next-redux-wrapper --save
npm install babel-plugin-kea --save-dev
```

## Set up babel-plugin-kea

In order to properly hydrate your store between server and client renders, we must install the
[`babel-plugin-kea`](/docs/intro/debugging) package. This ensures that
every `kea()` call automatically gets a `path`, which help us link the same logic on the client and
the server.

Add this to your `.babelrc`:

```json
{
  "presets": ["next/babel"],
  "plugins": ["babel-plugin-kea"]
}
```

## Create \_app.js

Create `pages/_app.js` and paste in the following content. The content below is taken from
[next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)'s readme. Notable changes
have been annotated with comments.

```javascript
// pages/_app.js
import React from 'react'
import { resetContext } from 'kea'
import App from 'next/app'
import withRedux from 'next-redux-wrapper'

// How long do we try to render on the server before giving up? In milliseconds.
const SERVER_RENDER_TIMEOUT = 1000

const makeStore = (initialState, options) => {
  // Reset Kea's context and pass `initialState` as defaults.
  // Add all plugins and other configuration here.
  const context = resetContext({ defaults: initialState })
  return context.store
}

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}

    // In case we are server rendering and our `Component` has a `logic` attached
    // to it, initialize it through a promise and pass the `resolve` function to
    // the logic as props.

    // It's then up to the logic to call `props.resolve()` when it has finished
    // its setup.

    if (ctx.isServer && Component.logic) {
      await Promise.race([
        new Promise((resolve) => Component.logic({ resolve }).mount()),
        new Promise((resolve) => setTimeout(resolve, SERVER_RENDER_TIMEOUT)),
      ])
    }

    return { pageProps }
  }

  render() {
    const { Component, pageProps, store } = this.props
    return (
      <Component {...pageProps} />
    )
  }
}
export default withRedux(makeStore)(MyApp)
```

## Usage

Feel free to use `kea` calls anywhere in your app now!

If you have a `logic` that initializes the data for a page, pass it as the `logic` property
on the page's Component: `MyPage.logic = logic`.

When this logic is built, it'll get a function `resolve` as part of `props`. Once your logic
has finished initializing or it crashed, call `props.resolve()` to signal that the loading has
finished.

```javascript
import fetch from 'isomorphic-unfetch' // 👈 can't use window.fetch anymore

const logic = kea({
  // ... skipping actions and reducers
  events: ({ actions }) => ({
    afterMount: [actions.fetchRepositories],
  }),

  listeners: ({ actions, props }) => ({
    fetchRepositories: async () => {
      try {
        const response = await fetch(`https://api.github.com/users/keajs/repos`)
        actions.setRepositories(await response.json())
      } catch (error) {
        actions.setFetchError(error.message)
      }
      props.resolve && props.resolve() // 👈 Resolved!
    },
  }),
})

function Github() {
  const { repositories } = useValues(logic)
  return (
    <ul>
      {repositories.map((repo) => (
        <li>{repo.full_name}</li>
      ))}
    </ul>
  )
}

Github.logic = logic // 👈 Attach the logic on the Github component

export default Github
```

## Sample app

Here is the Github API tutorial app, but adapted to work with Next.js
server rendering. All the changes are highlighted with a finger. 👈

```javascript
import React from 'react'
import {
  kea,
  actions,
  reducers,
  selectors,
  listeners,
  afterMount,
  useActions,
  useValues,
} from 'kea'
import fetch from 'isomorphic-unfetch' // 👈 can't use window.fetch anymore

const API_URL = 'https://api.github.com'

const logic = kea([
  actions({
    setUsername: (username) => ({ username }),
    setRepositories: (repositories) => ({ repositories }),
    setFetchError: (message) => ({ message }),
  }),

  reducers({
    username: [
      'keajs',
      {
        setUsername: (_, payload) => payload.username,
      },
    ],
    repositories: [
      [],
      {
        setUsername: () => [],
        setRepositories: (_, payload) => payload.repositories,
      },
    ],
    isLoading: [
      true,
      {
        setUsername: () => true,
        setRepositories: () => false,
        setFetchError: () => false,
      },
    ],
    error: [
      null,
      {
        setUsername: () => null,
        setFetchError: (_, payload) => payload.message,
      },
    ],
  }),

  selectors({
    sortedRepositories: [
      (selectors) => [selectors.repositories],
      (repositories) => repositories.sort((a, b) => b.stargazers_count - a.stargazers_count),
    ],
  }),

  afterMount(({ actions, values }) => {
    // Only load data on the client if it's not already there 👈
    if (values.repositories.length === 0 && !values.error) {
      actions.setUsername(values.username)
    }
  }),

  listeners(({ actions, props }) => ({
    setUsername: async ({ username }, breakpoint) => {
      if (!props.resolve) {
        // 👈 no need to debounce the server's response
        await breakpoint(300)
      }

      try {
        const url = `${API_URL}/users/${username}/repos?per_page=250`
        const response = await fetch(url)
        breakpoint()

        const json = await response.json()

        if (response.status === 200) {
          actions.setRepositories(json)
        } else {
          actions.setFetchError(json.message)
        }
      } catch (error) {
        actions.setFetchError(error.message)
      }

      props.resolve && props.resolve() // 👈 Resolved!
    },
  })),
])

// No difference here
function Github() {
  const { username, isLoading, repositories, sortedRepositories, error } = useValues(logic)
  const { setUsername } = useActions(logic)

  return (
    <div className="example-github-scene">
      <div style={{ marginBottom: 20 }}>
        <h1>Search for a github user</h1>
        <input value={username} type="text" onChange={(e) => setUsername(e.target.value)} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : repositories.length > 0 ? (
        <div>
          Found {repositories.length} repositories for user {username}!
          {sortedRepositories.map((repo) => (
            <div key={repo.id}>
              <a href={repo.html_url} target="_blank">
                {repo.full_name}
              </a>
              {' - '}
              {repo.stargazers_count} stars, {repo.forks} forks.
            </div>
          ))}
        </div>
      ) : (
        <div>{error ? `Error: ${error}` : 'No repositories found'}</div>
      )}
    </div>
  )
}

Github.logic = logic // 👈 Attach the logic on the Github component

export default Github
```
