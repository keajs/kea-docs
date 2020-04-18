---
id: listeners
title: Listeners
sidebar_label: Listeners
---

# Installation

`kea-listeners` are built in to kea. There's nothing to install if you're running Kea 2.0+.

# Sample usage

```javascript
kea({
    actions: () => ({
        openUrl: url => ({ url }),
        anotherAction: true,
        debouncedFetchResults: true,
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
