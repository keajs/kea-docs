---
id: listeners
title: Listeners
sidebar_label: Listeners
---

:::note
Read more about listeners in the [Core Concepts](/docs/concepts#listeners) page.

Read more about using breakpoints in listeners in the [Advanced Concepts](/docs/advanced#breakpoints-in-listeners) 
page.
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

        // listen to any redux action type, not just ones defined in this logic
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
        [otherLogic.actions.yetAnotherAction]: sharedListeners.sharedActionListener,

        // Debounce for 300ms before making an API call
        // Break if this action was called again while we were sleeping
        debouncedFetchResults: async ({ username }, breakpoint) => {
            // If the same action gets called again while this waits, we will throw an exception
            // and catch it immediately, effectively cancelling the operation.
            await breakpoint(300)

            // Make an API call
            const user = await API.fetchUser(username)

            // if during the previous fetch this action was called again, then break here
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

## Auto-Connect

Listeners support `autoConnect`. This means that if inside one listener you access
properties on another `logic`, it will be mounted automatically and unmounted together with your logic.

Read more about it in the [Kea 2.0 announcement blog post](/blog/kea-2.0#auto-connect) 

There is a slight caveat for when you want to manually `.mount()` and `unmount` a logic
inside listeners, *without* that logic being automatically connected. Read more about it in 
[Advanced Concepts](/docs/advanced#calling-mount-inside-listeners-with-autoconnect-true).