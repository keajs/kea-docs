---
id: listeners
title: Listeners
sidebar_label: Listeners
---

:::note Do this first
Read the [listeners section](/docs/guide/concepts#listeners) in the 
[Core Concepts](/docs/guide/concepts) page to get a detailed explanation of how to use listeners.
Then come back here to read about `sharedListeners`, `breakpoints` and other advanced features
of listeners.
:::

## Installation

`kea-listeners` is built in to kea. There's nothing to install if you're using Kea 2.0+.

## Usage

Here is everything you can do with `listeners` and `sharedListeners`:

```javascript
const logic = kea({
    actions: () => ({
        openUrl: url => ({ url }),
        anotherAction: true,
        debouncedFetchResults: username => ({ username }),
        oneActionMultipleListeners: true,
        // ...
    }),

    listeners: ({ actions, values, store, sharedListeners }) => ({
        // action that conditionally calls another action
        openUrl: ({ url }) => {
            // get the value from the reducer 'url'
            const currentUrl = values.url

            if (url !== currentUrl) {
                actions.reallyOpenTheUrl(url)
            }
        },

        // listen to any redux action, not just local kea actions
        LOCATION_CHANGE: (payload) => {
            // do something with the regular redux action
            console.log(payload)
            store.dispatch({
                type: 'REDUX_ACTION',
                payload: { redux: 'cool' },
            })
        },

        // two listeners with one shared action
        [actions.anotherAction]: sharedListeners.sharedActionListener,

        [otherLogic.actions.yetAnotherAction]: 
                                 sharedListeners.sharedActionListener,

        // Debounce for 300ms before making an API call
        // Break if this action was called again while we were sleeping
        debouncedFetchResults: async ({ username }, breakpoint) => {
            // If the same action gets called again while this waits, we 
            // will throw an exception and catch it immediately, 
            // effectively cancelling the operation.
            await breakpoint(300)

            // Make an API call
            const user = await API.fetchUser(username)

            // if during the previous fetch this listener was called 
            // again, then break here
            breakpoint()

            // save the result
            actions.userReceived(user)
        },

        // you can also pass an array of functions
        oneActionMultipleListeners: [
            (payload, breakpoint, action) => {
                /* ... */
            },
            sharedListeners.doSomething,
            sharedListeners.logAction,
        ],
    }),

    // if multiple actions must trigger similar code, use sharedListeners
    sharedListeners: ({ actions, values, store }) => ({
        // all listeners and sharedListeners also get a third parameter:
        // - action = the full dispatched action
        sharedActionListener: (payload, breakpoint, action) => {
            if (action.type === actions.anotherAction.toString()) {
                // handle this case separately
            }
            // do something common for both
            console.log(action)
        },
        doSomething: () => {
            console.log('did something')
        },
        logAction: (_, __, action) => {
            console.log('action dispatched', action)
        }  
    }),
})
```

## Breakpoints

Listeners have a powerful trick up their sleeve: `breakpoint`s!

You use them to handle two very common scenarios:

1. **Debouncing.** Suppose we have a textfield for a `username` and you want to fetch the
   github repositories for whatever is typed in there. If the user types `"keajs"`, you will
   actually make five requests (`"k"`, `"ke"`, ...), while only the last one (`"keajs"`) matters.
   It's smarter to wait a few hundred milliseconds before making a request in case the user enters
   another character.

2. **Out-of-order network requests.** In the example above, suppose we intend to search for `"keajs"`.
   We type `"ke"` and pause for a moment. A network request gets sent to fetch the repositories for
   the user `"ke"`. We then complete the string into `"keajs"` and make another request.
   What happens if the first request for `"ke"` is slow and comes back after the request for
   `"keajs"` has already finished? Without tracking this explicitly, we might incorrectly override
   the list of repositories and show whatever network request finished last, no matter what
   username is in the searchfield. 

Breakpoints solve both of those scenarios. They are passed as the second argument to listeners,
after the `payload`. 

```javascript
kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            // do something
        }
    })
})       
```

If you call `await breakpoint(delay)`, the code will pause for `delay` milliseconds before
resuming. In case the action you're listening to gets dispatched again during this delay,
the listener for the old action will terminate. The new one will keep running. 

In case the logic unmounts during this delay, the listener will just terminate.

```javascript
kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            // pause for 100ms and break if `setUsername` 
            // was called again during this time
            await breakpoint(100)
            
            // do something
        }
    })
})       
```

If you call `breakpoint()` without any arguments (and without `await`), there will be no pause.
It'll just check if the listener was called again or the logic was unmounted and terminate if that's 
the case. You can use this version of `breakpoint()` after long running calls and network requests 
to avoid those "out of order" errors.

Here's an example that uses both types of breakpoints:

```javascript
const API_URL = 'https://api.github.com'

kea({
    // ... actions, reducers omitted 

    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            const { setRepositories, setFetchError } = actions
            
            await breakpoint(100) // debounce for 100ms
            
            const url = `${API_URL}/users/${username}/repos?per_page=250`
            const response = await window.fetch(url)
            
            // break if `setUsername` was called again while we were fetching or if
            // the logic was unmounted, e.g. by the user moving to a different page
            breakpoint() 
            
            const json = await response.json()
            
            if (response.status === 200) {
                setRepositories(json)
            } else {
                setFetchError(json.message)
            }
        }
    })
})
```

Under the hood breakpoints just `throw` exceptions.

In case you must call a breakpoint from within a `try / catch` block, use the `isBreakpoint`
function to check if the caught exception was from a breakpoint or not:

```javascript
import { kea, isBreakpoint } from 'kea'

kea({
    listeners: ({ actions }) => ({
        setUsername: async ({ username }, breakpoint) => {
            try {
                const response = await api.getResults(username)
                breakpoint()
                actions.setRepositories(response)
            } catch (error) {
                if (isBreakpoint(error)) {
                    throw error // pass it along
                }
                actions.setFetchError(json.message)
            }
        }
    })
})
```

## Auto-Connect

Listeners support `autoConnect`. This means that if inside one listener you access
properties on another `logic`, it will be mounted automatically and unmounted together with your logic.

Read more about it in the [Kea 2.0 announcement blog post](/blog/kea-2.0#auto-connect) or in the
[Advanded Concepts](/docs/guide/advanced#automatic-connections) guide. 

There is a slight caveat for when you want to manually `.mount()` and `unmount` a logic
inside listeners, *without* that logic being automatically connected. Read more about it in 
[Using without React](/docs/guide/standalone#calling-mount-inside-listeners-with-autoconnect-true) section.