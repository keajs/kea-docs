---
sidebar_position: 4
---

# listeners

## Running async code

Kea prohibits you from writing _impure_ code with side effects (e.g. API calls) in actions and reducers.
But what are you to do if you live in the real world like _most_ of us?

Enter listeners.

As the name implies, listeners _listen_ for dispatched actions and then run some code. Here's an example:

```javascript
const logic = kea([
  actions({
    loadUsers: true,
  }),

  listeners({
    loadUsers: async (payload) => {
      const users = await api.get('users')
      // do something with the users?
    },
  }),
])
```

When the `loadUsers` action is dispatched, we, _ahem,_ load the users.

The listener will get the action's `payload` as its first argument.

## Loading and storing data

:::note
You may want to use the [loaders](/docs/plugins/loaders) plugin to simplify the steps in this guide even further.
:::

### Storing results

In the example above, we built a listener that fetched a `users` array. However, what do we do with it next? Where do we store it?

Of course we store it in a `reducer` through an `action`... since there's literally no other way to store data in Kea.

```javascript
const logic = kea([
  actions({
    loadUsers: true,
    setUsers: (users) => ({ users }),
  }),

  reducers({
    users: [[], { setUsers: (_, { users }) => users }],
  }),

  listeners(({ actions }) => ({
    loadUsers: async () => {
      const users = await api.get('users')
      actions.setUsers(users)
    },
  })),
])
```

:::note this-Not-DRY Warning 
If you're used to lighter state management solution,
the above code might seem overly verbose to you. _"Why must we write `loadUsers` and `setUsers`
twice?"_ is a valid question. _"Why can't listeners just implicitly create a new action"_ might be another.

That's not how it works in Kea. Listeners just listen, and reducers reduce. You need to define their actions explicitly.

In the real world, you'd probably use the [loaders](/docs/plugins/loaders) plugin for this example, which does automatically 
create an action if one does not exist. However, we're learning here, and it's good to spell things out. 
:::

### Tracking loading

Let's also track the `loading` state in our logic.

Obviously we need a `loading` reducer to store this value, but what about the actions?

Well, here's one bad and _naïve_ way you could do it:

```javascript
// NB! This code follows bad patterns, don't do this.
const logic = kea([
  actions({
    loadUsers: true,
    setUsers: (users) => ({ users }),
    setLoading: (loading) => ({ loading }),
  }),

  reducers({
    users: [
      [],
      {
        setUsers: (_, { users }) => users,
      },
    ],
    loading: [
      false,
      {
        // DO NOT DO THIS
        setLoading: (_, { loading }) => loading,
      },
    ],
  }),

  listeners(({ actions }) => ({
    loadUsers: async () => {
      actions.setLoading(true) // DO NOT DO THIS
      const users = await api.get('users')
      actions.setUsers(users)
      actions.setLoading(false) // DO NOT DO THIS
    },
  })),
])
```

If you read the [`reducers`](/docs/core/reducers) chapter, you'll remember that it's an anti-pattern to only have
`setThis` and `setThat` actions that only update `this` or `that`.

The better approach to explicitly setting the `loading` state is to have it react to actions.

When do we start loading? When do we stop loading? When the `loadUsers` and `setUsers` actions are
called.

Let's build off of that:

```javascript
const logic = kea([
  actions({
    loadUsers: true,
    setUsers: (users) => ({ users }),
  }),

  reducers({
    users: [
      [],
      {
        setUsers: (_, { users }) => users,
      },
    ],
    loading: [
      false,
      {
        loadUsers: () => true,
        setUsers: () => false,
      },
    ],
  }),

  listeners(({ actions }) => ({
    loadUsers: async () => {
      const users = await api.get('users')
      actions.setUsers(users)
    },
  })),
])
```

That's already pretty sweet...

### Error handling

... but what if our API is [running off a potato](https://www.google.com/search?q=raspberry+pi+potato)
and occasionally throws an error (e.g. timeout)?

Currently if that happens, `setUsers` will never be dispatched and we'll be `loading` forever!
Surely that's _sub-optimal_ and we can do better!

When we add a third reducer to track the `error`, the beauty of explicitly declaring actions and
having reducers and listeners react to them suddenly becomes clear. 😍

The following code demonstrates this well. Please note that for aesthetics, I renamed `loading`
from before to `usersLoading` and `setUsers` to `loadUsersSuccess`:

```javascript
const logic = kea([
  actions({
    loadUsers: true,
    loadUsersSuccess: (users) => ({ users }),
    loadUsersFailure: (error) => ({ error }),
  }),

  reducers({
    users: [
      [],
      {
        loadUsersSuccess: (_, { users }) => users,
      },
    ],
    usersLoading: [
      false,
      {
        loadUsers: () => true,
        loadUsersSuccess: () => false,
        loadUsersFailure: () => false,
      },
    ],
    usersError: [
      null,
      {
        loadUsers: () => null,
        loadUsersFailure: (_, { error }) => error,
      },
    ],
  }),

  listeners(({ actions }) => ({
    loadUsers: async () => {
      try {
        const users = await api.get('users')
        actions.loadUsersSuccess(users)
      } catch (error) {
        actions.loadUsersFailure(error.message)
      }
    },
  })),
])
```

It's like a little matrix of values and their transformations, as code. 

In the real world, you would use the [loaders](/docs/plugins/loaders) plugins instead of writing the code above. 
Remember, Kea is built to help you [abstract away all the boring parts](/docs/meta/kea#logic-builders).

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
kea([
  listeners(({ actions }) => ({
    setUsername: async ({ username }, breakpoint) => {
      // do something
    },
  })),
])
```

If you call `await breakpoint(delay)`, the code will pause for `delay` milliseconds before
resuming. In case the action you're listening to gets dispatched again during this delay,
the listener for the old action will terminate. The new one will keep running.

In case the logic unmounts during this delay, the listener will just terminate.

```javascript
kea([
  listeners(({ actions }) => ({
    setUsername: async ({ username }, breakpoint) => {
      // pause for 100ms and break if `setUsername`
      // was called again during this time
      await breakpoint(100)

      // do something
    },
  })),
])
```

If you call `breakpoint()` without any arguments (and without `await`), there will be no pause.
It'll just check if the listener was called again or the logic was unmounted and terminate if that's
the case. You can use this version of `breakpoint()` after long running calls and network requests
to avoid those "out of order" errors.

Here's an example that uses both types of breakpoints:

```javascript
const API_URL = 'https://api.github.com'

kea([
  // ... actions, reducers omitted

  listeners(({ actions }) => ({
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
    },
  })),
])
```

Under the hood breakpoints just `throw` exceptions.

In case you must call a breakpoint from within a `try / catch` block, use the `isBreakpoint`
function to check if the caught exception was from a breakpoint or not:

```javascript
import { kea, isBreakpoint } from 'kea'

kea([
  listeners(({ actions }) => ({
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
    },
  })),
])
```

## Shared listeners

If multiple `listeners` need to run the same code, you can:

1. Have all of them call a common action, which you then handle with another listener:

```javascript
const logic = kea([
  actions({
    firstAction: true,
    secondAction: true,
    commonAction: true,
    // ...
  }),

  listeners(({ actions, values }) => ({
    // two listeners with one shared action
    firstAction: actions.commonAction,
    secondAction: () => {
      actions.commonAction()
    },

    // you can also pass an array of functions
    commonAction: () => {
      // do something common
    },
  })),
])
```

This however dispatches a separate action, which is then listened to.

2. If you want to share code between listeners without dispatching another action, use `sharedListeners`:

```javascript
const logic = kea([
  actions({
    anotherAction: true,
    debouncedFetchResults: (username) => ({ username }),
    oneActionMultipleListeners: true,
    // ...
  }),

  // if multiple actions must trigger similar code, use sharedListeners
  sharedListeners(({ actions }) => ({
    // all listeners and sharedListeners also get a third parameter:
    // - action = the full dispatched action
    doSomething: (payload, breakpoint, action) => {
      if (action.type === actions.anotherAction.toString()) {
        console.log(action)
      }
    },
    logAction: (_, __, action) => {
      console.log('action dispatched', action)
    },
  })),
  
  listeners(({ actions, values, store, sharedListeners }) => ({
    // two listeners with one shared action
    anotherAction: sharedListeners.doSomething,

    // you can also pass an array of functions
    oneActionMultipleListeners: [
      (payload, breakpoint, action) => {
        /* ... */
      },
      sharedListeners.doSomething,
      sharedListeners.logAction,
    ],
  })),
])
```

That function will be called directly, without an action being dispatched in the middle.

You might still prefer to explicitly dispatch an action, as that level of abstraction may
be better suited for the task at hand. You can use the shared action in a reducer for example.
