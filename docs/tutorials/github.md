---
id: github
title: Github API
sidebar_label: Github API
---

:::warning
This page is still a work in progress: this tutorial has not been completed.
:::

import { GithubScene } from './github/index.js'
import { Provider } from 'react-redux'
import { getContext, kea, useActions, useValues } from 'kea' 

<Provider store={getContext().store}>

In this tutorial we are going to build a component that asks for an username
and then fetches all the repositories for that user on Github.

The final result will look like this:

:::note Final Result
<GithubScene />
:::

## 1. Input the username
Now that you have seen the end result, let's build it, piece by piece.
The first thing we want to do is to have an input field to enter the username and store it in kea:

```jsx
import { kea, useActions, useValues } from 'kea'

const logic = kea({
    actions: () => ({
        setUsername: (username) => ({ username })
    }),

    reducers: ({ actions }) => ({
        username: ['keajs', {
            [actions.setUsername]: (_, payload) => payload.username
        }]
    })
})

function Github () {
    const { username } = useValues(logic)
    const { setUsername } = useActions(logic)

    return (
        <div className='example-github-scene'>
            <div style={{marginBottom: 20}}>
                <h1>Search for a github user</h1>
                <input
                    value={username}
                    type='text'
                    onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
                Repos will come here...
            </div>
        </div>
    )
}
```

Live demo:

<div className='demo'>
 GithubInput /
</div>

## 2. Capture calls `setUsername` and trigger an API call

The next step is to listen for the `setUsername` action and run some code whenever it has been dispatched:

```jsx
const logic = kea({
    actions: () => ({
      setUsername: (username) => ({ username })
    }),
    
    reducers: ({ actions }) => ({
        username: ['keajs', {
          [actions.setUsername]: (_, payload) => payload.username
        }]
    }),
    
    listeners: ({ actions }) => ({
        [actions.setUsername]: ({ username }) => {
          // ...
        }
    })
})
```

## 3. Trigger the actual call
We must ask Github for data about this user.

For this we'll use the standard `window.Fetch` API. We also add 300 milliseconds
of debounce before actually making the call, to give the user time to add another keystroke:

```jsx
const API_URL = 'https://api.github.com'

const logic = kea({
  // ...

  listeners: ({ actions }) => ({
    [actions.setUsername]: async ({ username }, breakpoint) => {
      await breakpoint(300) // debounce for 300ms

      const url = `${API_URL}/users/${username}/repos?per_page=250`
      const response = await window.fetch(url)

      breakpoint() // break if action was dispatched again while we were fetching

      const json = await response.json()

      if (response.status === 200) {
        // we have the repositories in `json`
        // what to do with them?
      } else {
        // there is an error in `json.message`
        // what to do with it?
      }
    }
  })
})
```

## 4. Store the response of the call
Now that we get the repositories, where to put them?

The answer: in a few new reducers.

We're interested in 3 things:

1. Whether we're currently fetching and data: `isLoading`
2. The repositories that we have fetched: `repositories`
3. Any error that might have occurred: `error`

We can get all of this by just adding two new actions:

1. One to set the repositories: `setRepositories`
2. One to set the error message: `setFetchError`

Hooking them up gives the following result:

```jsx
const logic = kea({
  actions: () => ({
    setUsername: (username) => ({ username }),
    setRepositories: (repositories) => ({ repositories }),
    setFetchError: (message) => ({ message })
  }),

  reducers: ({ actions }) => ({
    username: ['keajs', {
      [actions.setUsername]: (_, payload) => payload.username
    }],
    repositories: [[], {
      [actions.setUsername]: () => [],
      [actions.setRepositories]: (_, payload) => payload.repositories
    }],
    isLoading: [false, {
      [actions.setUsername]: () => true,
      [actions.setRepositories]: () => false,
      [actions.setFetchError]: () => false
    }],
    error: [null, {
      [actions.setUsername]: () => null,
      [actions.setFetchError]: (_, payload) => payload.message
    }]
  }),

  listeners: ({ actions }) => ({
    // ...
  })
})
```

Now we just need to call the right actions from the worker:

```jsx
const API_URL = 'https://api.github.com'

const logic = kea({
  // ...

  listeners: ({ actions }) => ({
    [actions.setUsername]: async ({ username }, breakpoint) => {
      await breakpoint(300) // debounce for 300ms

      const url = `${API_URL}/users/${username}/repos?per_page=250`
      const response = await window.fetch(url)

      // break if the same action was dispatched again while we were fetching for fetch
      breakpoint()

      const json = await response.json()

      if (response.status === 200) {
        actions.setRepositories(json)         // <-- new
      } else {
        actions.setFetchError(json.message)   // <-- new
      }
    }
  })
})
```

## 5. Display the result
The last step is to display the repositories to the user. To do this we use the following code:

```jsx
function Github () {
  const { username, isLoading, repositories, error } = useValues(logic)
  const { setUsername } = useActions(logic)

  return (
    <div className='example-github-scene'>
      <div style={{marginBottom: 20}}>
        <h1>Search for a github user</h1>
        <input
          value={username}
          type='text'
          onChange={e => setUsername(e.target.value)} />
      </div>
      {isLoading ? (
        <div>
          Loading...
        </div>
      ) : repositories.length > 0 ? (
        <div>
          Found {repositories.length} repositories for user {username}!
          {repositories.map(repo => (
            <div key={repo.id}>
              <a href={repo.html_url} target='_blank'>{repo.full_name}</a>
              {' - '}
              {repo.stargazers_count} stars, {repo.forks} forks.
            </div>
          ))}
        </div>
      ) : (
        <div>
          {error ? `Error: ${error}` : 'No repositories found'}
        </div>
      )}
    </div>
  )
}
```

Giving us the following result:

<div className='demo'>
GithubAlmost /
</div>
It works! Almost...


## 6. Last steps
What's still missing?

Well, for starters it would be nice if it would fetch all the respositories on page load.

Also, it would be great to sort the repositories by the number of stars

Let's fix these points!

First, to load the repositories on page load, we can use kea's mount events and run an action whenever the logic is mounted:

```jsx
const logic = kea({
  // listeners: ...

  events: ({ actions, values }) => ({
    afterMount: () => {
      actions.setUsername(values.username)
    }
  })
})
```

To stort the results we can create a selector that takes `repositories` as input and outputs a sorted array:

```jsx
const logic = kea({
  // ...
  selectors: ({ selectors }) => ({
    sortedRepositories: [
      () => [selectors.repositories],
      (repositories) => {
        return repositories.sort((a, b) => b.stargazers_count - a.stargazers_count)
      }
    ]
  })
})
```

Now all that's left to do is to replace `repositories` with `sortedRepositories` in your component.

Because the selectors are made with `reselect` under the hood, you can be sure that they will only be
recalculated (resorted in this case) when the original input (repositories) change, not between other renders.

## 7. Final result
Adding the finishing touches gives us this final masterpiece:

<div className='demo'>
GithubFull /
</div>
With this code:

```jsx
import React from 'react'
import { kea, useActions, useValues } from 'kea'

const API_URL = 'https://api.github.com'

const logic = kea({
  actions: () => ({
    setUsername: (username) => ({ username }),
    setRepositories: (repositories) => ({ repositories }),
    setFetchError: (message) => ({ message })
  }),

  reducers: ({ actions }) => ({
    username: ['keajs', {
      [actions.setUsername]: (_, payload) => payload.username
    }],
    repositories: [[], {
      [actions.setUsername]: () => [],
      [actions.setRepositories]: (_, payload) => payload.repositories
    }],
    isLoading: [true, {
      [actions.setUsername]: () => true,
      [actions.setRepositories]: () => false,
      [actions.setFetchError]: () => false
    }],
    error: [null, {
      [actions.setUsername]: () => null,
      [actions.setFetchError]: (_, payload) => payload.message
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedRepositories: [
      () => [selectors.repositories],
      (repositories) => repositories.sort(
                          (a, b) => b.stargazers_count - a.stargazers_count)
    ]
  }),

  events: ({ actions, values }) => ({
    afterMount: () => {
      actions.setUsername(values.username)
    }
  }),

  listeners: ({ actions }) => ({
    [actions.setUsername]: async ({ username }, breakpoint) => {
      await breakpoint(300) // debounce for 300ms

      const url = `${API_URL}/users/${username}/repos?per_page=250`
      const response = await window.fetch(url)

      // break if the same action was dispatched again while we were fetching for fetch
      breakpoint()

      const json = await response.json()

      if (response.status === 200) {
        actions.setRepositories(json)         // <-- new
      } else {
        actions.setFetchError(json.message)   // <-- new
      }
    }
  })
})

export function GithubScene () {
  const { username, isLoading, repositories,
          sortedRepositories, error } = useValues(logic)
  const { setUsername } = useActions(logic)

  return (
    <div className='example-github-scene'>
      <div style={{marginBottom: 20}}>
        <h1>Search for a github user</h1>
        <input value={username}
              type='text'
              onChange={e => setUsername(e.target.value)} />
      </div>
      {isLoading ? (
        <div>
          Loading...
        </div>
      ) : repositories.length > 0 ? (
        <div>
          Found {repositories.length} repositories for user {username}!
          {sortedRepositories.map(repo => (
            <div key={repo.id}>
              <a href={repo.html_url} target='_blank'>{repo.full_name}</a>
              {' - '}{repo.stargazers_count} stars, {repo.forks} forks.
            </div>
          ))}
        </div>
      ) : (
        <div>
          {error ? `Error: ${error}` : 'No repositories found'}
        </div>
      )}
    </div>
  )
}
```

There's still one thing that's broken:

If a github user or organisation has more than 100 repositories, only the first 100 results will be returned.
Github's API provides a way to ask for the next 100 results (the <a href='https://developer.github.com/v3/repos/#response'>`Link` headers</a>), but as resolving this is
outside the scope of this guide, it will be left as an exercise for the reader ;).

</Provider>
