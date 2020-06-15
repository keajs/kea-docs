---
id: github
title: Github API
sidebar_label: Github API
---

import { Github as Github1 } from './github/1-component/index.js'
import { Github as Github2 } from './github/2-logic/index.js'
import { Github as Github3 } from './github/3-almost/index.js'
import { Github as Github4 } from './github/4-event/index.js'
import { Github as Github5 } from './github/5-breakpoint/index.js'
import { Github } from './github/index.js'
import { Toggle } from './github/toggle.js'
import { Example } from './github/example.js'
import { Provider } from 'react-redux'
import { getContext, kea, useActions, useValues } from 'kea' 
import useBaseUrl from '@docusaurus/useBaseUrl';

<Provider store={getContext().store}>

In this step-by-step tutorial we are going to build a component that asks for a Github username
and then fetches all the repositories for that user, using the Github API.

To follow along, you must have a good understanding of React and you *should* have gone through
[the quickstart](/docs/introduction/quickstart) or [core concepts](/docs/guide/concepts) pages at 
least once.

The final result will look like this:

<Example>
    <Github id="first" />
</Example>

## 1. Creating the React Component

:::note
To code along, use this [codesandbox](https://codesandbox.io/s/kea-github-tutorial-kvcgb?file=/src/app.js).
:::

Now that you have seen the end result, let's build it, piece by piece.

The first thing we need is a React component, which has 1) one input field for the `username` 
and 2) a place to show the results.

Written with React hooks, it would look something like this:

```jsx
import React, { useState } from 'react'

function Github () {
    const [username, setUsername] = useState("keajs")

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
                Repos will come here for user <strong>{username}</strong>
            </div>
        </div>
    )
}
```

<Example>
    <Github1 />
</Example>


## 2. Save the `username` in Kea

That's great, but this isn't a tutorial on React hooks. 😊

Let's refer back to this illustration from the [What is Kea](/docs/introduction/what-is-kea) page:

<a href={useBaseUrl('img/introduction/how-does-kea-work.png')}><img alt="Redux Devtools with Inline Paths" src={useBaseUrl('img/introduction/how-does-kea-work.png')} style={{ maxWidth: 715, width: '100%' }} /></a>
<br /><br /> 

In Kea, everything starts with an [**action**](/docs/guide/concepts#actions). Every button press, every change in a textfield,
every network request and every response starts with an action.

In this case we need one action called `setUsername`, which takes one parameter, `username`.

This is how you would write a logic with such an action:

```jsx
import { kea } from 'kea'

const logic = kea({
    actions: {
        setUsername: (username) => ({ username })
    }
})
```

To store data you use a [**reducer**](/docs/guide/concepts#reducers). Reducers are functions that react to actions and change
their state if needed.

We need just one reducer, `username`, that reacts to the `setUsername` action and stores
its payload. This is how that looks like:   

```jsx
const logic = kea({
    actions: {
        setUsername: (username) => ({ username })
    },

    reducers: {
        username: ['keajs', {
            setUsername: (_, { username }) => username
        }]
    }
})
```

Finally, we need a way to read the `username` value and call the `setUsername` action in our
logic.

For this we use the `useValues` and `useActions` hooks:

```jsx
function Github () {
    const { username } = useValues(logic)
    const { setUsername } = useActions(logic)

    return <div />
}
``` 

Putting it all together, we end up with a component like this:

```jsx
import React from 'react'
import { kea, useActions, useValues } from 'kea'

const logic = kea({
    actions: {
        setUsername: (username) => ({ username })
    },

    reducers: {
        username: ['keajs', {
            setUsername: (_, payload) => payload.username
        }]
    }
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
                Repos will come here for user <strong>{username}</strong>
            </div>
        </div>
    )
}
```

Live demo:

<Example>
    <Github2 />
</Example>

Obviously for examples this simple, adding Kea feels like a lot of boilerplate compared to Hooks.

Luckily it won't stay this way for long!


## 3. Listen for the `setUsername` action

The next step is to use a [**listener**](/docs/guide/concepts#listeners) to listen for the `setUsername` action and run some code 
whenever it has been dispatched.

This is how that's written in Kea:

```jsx
const logic = kea({
    actions: {
        setUsername: (username) => ({ username })
    },
    
    reducers: {
        username: ['keajs', {
           setUsername: (_, payload) => payload.username
        }]
    },
    
    listeners: {
        setUsername: async ({ username }, breakpoint) => {
            // Code to run when the `setUsername` action was dispatched
        }
    }
})
```


## 4. Trigger the actual call

Next we must make a request to the Github API and ask for data about this user.

For this we'll make a simple `window.fetch` call:

```javascript
const API_URL = 'https://api.github.com'

const logic = kea({
    listeners: {
        setUsername: async ({ username }, breakpoint) => {
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            
            const response = await window.fetch(url)
            const json = await response.json()

            if (response.status === 200) {
                // we have the repositories in `json`
                // what to do with them?
            } else {
                // there is an error in `json.message`
                // what to do with it?
            }
        }
    }
})
```

## 5. Store the response of the call

Now that we got the list of repositories, what to do with them?

The answer: we store them in a few new reducers.

We're interested in 3 things:

1. Whether we're currently fetching any data: `isLoading`
2. The repositories that we have fetched: `repositories`
3. Any error that might have occurred: `error`

Because of the way Kea is set up (any reducer can react to any action), we can achieve all
of this by just adding two new actions (in addition to `setUsername`):

1. One to set the repositories: `setRepositories`
2. One to set the error message: `setFetchError`

Hooking them up gives the following result:

```jsx
const logic = kea({
    actions: {
        setUsername: (username) => ({ username }),
        setRepositories: (repositories) => ({ repositories }),
        setFetchError: (error) => ({ error })
    },
    
    reducers: {
        username: ['keajs', {
            setUsername: (_, { username }) => username
        }],
        repositories: [[], {
            setUsername: () => [],
            setRepositories: (_, { repositories }) => repositories
        }],
        isLoading: [false, {
            setUsername: () => true,
            setRepositories: () => false,
            setFetchError: () => false
        }],
        error: [null, {
            setUsername: () => null,
            setFetchError: (_, { error }) => error
        }]
    },
    
    listeners: {
        // ...
    }
})
```

Try to follow along and "connect the dots" to see what gets stored in which reducer when each of these
three actions is called.

The final step is to add `setRepositories` and `setFetchError` into the listener:

```javascript
const logic = kea({
    listeners: ({ actions }) => ({ // 👈 added { actions }
        setUsername: async ({ username }, breakpoint) => {
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            
            const response = await window.fetch(url)
            const json = await response.json()

            if (response.status === 200) {
                actions.setRepositories(json)       // 👈
            } else {
                actions.setFetchError(json.message) // 👈
            }
        }
    })    
})
```


## 6. Display the result

Finally, we also want to display the repositories to the user.

We fetch the new values (`isLoading`, `repositories`, `error`) with the same `useValues`
hook and put them into our JSX accordingly.

Here is one way to do it:

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
                            <a href={repo.html_url} target='_blank'>
                                {repo.full_name}
                            </a>
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

<Example>
    <Github3 />
</Example>


It *almost* works! Almost. Try changing the value in the textfield.

There are two issues we must still fix. One of them is rather obvious, the other one less so.

## 7. Fetch the repositories on first load

To load the repositories on page load, we can hook into the `afterMount` [event](/docs/guide/advanced#events) 
and run the `setUsername` action when the logic is mounted.

We pass the current `value` of `username` to the action as a bit of a cheat (we're setting the username
to what it already is), but it gets the job done: 

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

This is the result:

<Example>
    <Toggle><Github4 /></Toggle>
</Example>

## 8. Add breakpoints

There's still the second and less obvious problem to solve.

What if we type "microsoft" to the username field? 

Well, if you open up your [network inspector](https://developers.google.com/web/tools/chrome-devtools/network)
panel in Chrome's devtools (or Firefox... or Edge... or Safari... or Lynx?) you would see 9
different requests being made:

1. "m"
2. "mi" 
3. "mic" 
4. "micr" 
5. "micro" 
6. "micros" 
7. "microso" 
8. "microsof" 
9. "microsoft" 

What a waste. We only need the last one!

What's more, Github's API has a rate limit. If we do this long enough, we'll just get banned.

Luckily listeners come with one very cool feature: [breakpoints](/docs/guide/additional#breakpoints).

You might have noticed the second argument in the listener function is called `breakpoint`:

```javascript
const logic = kea({
    // ...
    
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, /* 👉 */ breakpoint /* 👈 */) => {
            //
        }
    })
})
```

The `breakpoint` function takes one argument: a number of milliseconds to wait.

But what is that exactly?

In essence, a `breakpoint` inside the `setUsername` listener tells your browser the following: 
*"in case another `setUsername` listener was started while I was waiting, stop now"*.

In practical terms, you can use it to debounce calls.

Calling `await breakpoint(300)` as the *first thing* in the `setUsername` listener pauses the request to
Github by 300 milliseconds. If another `setUsername` call was made in that time, the first one
terminates and only the second one starts, waiting another 300ms in case it too would be terminated:

```javascript
const API_URL = 'https://api.github.com'

const logic = kea({
    // ...
    
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            await breakpoint(300) // 👈 debounce for 300ms
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            const response = await window.fetch(url)
            
            const json = await response.json()
            
            if (response.status === 200) {
                actions.setRepositories(json)       
            } else {
                actions.setFetchError(json.message)
            }
        }
    })
})
```

That is so simple and so effective. With this code, when you type `microsoft` and you're fast enough,
only the last `t` will trigger the API call.

There is, however, one more and slightly subtler issue still in the code.

Suppose you type `micro`, pause for a second and then follow it up with `soft`.

We will make two API calls. One for `micro` and one for `microsoft`. In an ideal world with
unlimited fiber optic connections, both calls will complete in 11ms and feel instantaneous.

What if, however, on your spotty 3G the call for `micro` takes three seconds to complete, 
but the call to `microsoft` comes back immediately.

Remember, we paused for just a second.

Well, in this case the `username` textfield will show `microsoft`, but the list of repositories
will show the ones for the user `micro`.

How do we prevent this from happening?

With another breakpoint of course! This time we don't need an `async` in front of it:

```javascript
const API_URL = 'https://api.github.com'

const logic = kea({
    // ...
    
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            await breakpoint(300) 
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            const response = await window.fetch(url)
            
            // break if action was dispatched again while we were fetching
            breakpoint() // 👈
            
            const json = await response.json()
            
            if (response.status === 200) {
                actions.setRepositories(json)       
            } else {
                actions.setFetchError(json.message)
            }
        }
    })
})
```

This will make the app much nicer to use:

<Example>
    <Github5 />
</Example>

## 9. Finishing touches

There are two final things to make this example complete.

First, it would be nice to sort the list of repositories by the number of stars.

For this we can either 1) sort the list in the React component before rendering, 2) sort the list 
in the listener before handing it over to `setRepositories`... or use a 
[**selector**](/docs/guide/concepts#selectors) to sort it dynamically and automatically.

Obviously we'll do the latter. 🤪

Selectors take any number of reducers and other selectors as input and return a combined or modified
output.

The cool thing about selectors is that they are only recalculated when their input changes. This way
every new list of repositories is sorted only once. 

Here's how you would create a selector `sortedRepositories` that takes `repositories` as an input 
and returns a sorted array:

```jsx
const logic = kea({
    // ...
    selectors: {
        sortedRepositories: [
            (selectors) => [selectors.repositories],
            (repositories) => {
                return [...repositories].
                            sort((a, b) => b.stargazers_count - a.stargazers_count)
            }
        ]
    }
})
```

Please note that the [`Array.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) 
function mutates the array it sorts. Since we should never modify the input in a selector, 
we use `[...repositories]` to create a copy of the array before sorting it.

Now it's just a matter of replacing `repositories` in the component with `sortedRepositories`.

The second thing that would make this example complete has to do with network errors.

Basically, what if the following code:

```javascript
const response = await window.fetch(url)
```

... throws an `Error`?

In this case the listener will be abruptly terminated, `setRepositories` and `setFetchError` will
never be called and the page will be `isLoading` forever.

To prevent this, we must wrap our fetch call in a `try / catch` block:

```javascript
const API_URL = 'https://api.github.com'

const logic = kea({
    // ...
    
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            await breakpoint(300) 
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            
            // 👈 handle network errors
            let response
            try {
                response = await window.fetch(url)
            } catch (error) {
                actions.setFetchError(error.message)
                return  // 👈 nothing to do after, so return
            }
            
            // break if action was dispatched again while we were fetching
            breakpoint()
            
            const json = await response.json()
            
            if (response.status === 200) {
                actions.setRepositories(json)       
            } else {
                actions.setFetchError(json.message)
            }
        }
    })
})
```

:::note
We could have wrapped the entire listener in a `try / catch` block, but that would have
added an extra complication: under the hood breakpoints also just throw an error and we should
then use the `isBreakpoint` function to figure out wha type of error was just caught.
I opted to avoid it in the example above. See the [listeners](/docs/guide/additional#breakpoints) 
docs for more details.
::: 

## 10. Final result
Adding the finishing touches gives us this final masterpiece:

<Example>
    <Github id="last" />
</Example>

With this code:

```jsx
import React from 'react'
import { kea, useActions, useValues } from 'kea'

const API_URL = 'https://api.github.com'

const logic = kea({
    actions: {
        setUsername: (username) => ({ username }),
        setRepositories: (repositories) => ({ repositories }),
        setFetchError: (error) => ({ error })
    },
    
    reducers: {
        username: ['keajs', {
            setUsername: (_, { username }) => username
        }],
        repositories: [[], {
            setUsername: () => [],
            setRepositories: (_, { repositories }) => repositories
        }],
        isLoading: [false, {
            setUsername: () => true,
            setRepositories: () => false,
            setFetchError: () => false
        }],
        error: [null, {
            setUsername: () => null,
            setFetchError: (_, { error }) => error
        }]
    },
    
    selectors: {
        sortedRepositories: [
            (selectors) => [selectors.repositories],
            (repositories) => {
                return [...repositories].
                            sort((a, b) => b.stargazers_count - a.stargazers_count)
            }
        ]
    },

    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            await breakpoint(300) 
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            
            // 👈 handle network errors
            let response
            try {
                response = await window.fetch(url)
            } catch (error) {
                actions.setFetchError(error.message)
                return  // 👈 nothing to do after, so return
            }
            
            // break if action was dispatched again while we were fetching
            breakpoint()
            
            const json = await response.json()
            
            if (response.status === 200) {
                actions.setRepositories(json)       
            } else {
                actions.setFetchError(json.message)
            }
        }
    }),

    events: ({ actions, values }) => ({
        afterMount: () => {
            actions.setUsername(values.username)
        }
    })
})

function Github () {
    const { username, isLoading, sortedRepositories, error } = useValues(logic)
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
            ) : sortedRepositories.length > 0 ? (
                <div>
                    Found {sortedRepositories.length} repositories for user {username}!
                    {sortedRepositories.map(repo => (
                        <div key={repo.id}>
                            <a href={repo.html_url} target='_blank'>
                                {repo.full_name}
                            </a>
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

There's still one thing that's broken:

If a github user or organisation has more than 100 repositories, only the first 100 results will be 
returned. Github's API provides a way to ask for the next 100 results 
(the [`Link` headers](https://developer.github.com/v3/repos/#response), but resolving this is
outside the scope of this guide.

This will be the left as an exercise for the *ambitious* reader. That's you, right? 😉

:::note Next Steps
Read the [Core Concepts](/docs/guide/concepts) guide to get an in-depth understanding of how Kea works
and why it works the way it does.
:::

</Provider>
