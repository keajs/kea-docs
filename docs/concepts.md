---
id: concepts
title: Core Concepts
sidebar_label: Core Concepts
---

This doc describes the different parts of Kea and how to they all fit together.
After reading this, you'll know 80% of what there is to know about Kea.

Then read the sections [advanced concepts](/docs/advanced) and [using with React](/docs/react) to
get the remaining 20%. 

## Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`? 

Well, we had to call it something and everything else was already taken. 😅

More seriously, the name `logic` implies that calling `kea()` return complex objects, 
which not only contain a piece of your state, but also all the logic that manipulates it.  

It's a useful convention and we suggest sticking to it. Feel free to call your logic with
names that make sense, such as `accountLogic`, `dashboardLogic`, etc.


## Actions

The first thing you do in a logic is to define some actions:

```javascript
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }),
        keyPressed: (keyCode) => ({ keyCode }),
        setName: (name) => ({ name }),
        submitForm: (values, page) => ({ values, page }),
    })
})
```

Actions are the entry points to **all operations** in your logic.
Every state manipulation, every side effect, every drunk dial at four in the morning starts 
with an action.

Yet despite all this power, actions themselves do practically nothing. They just *signal intent*.
Everything else happens as a *reaction* to an action.

A helpful mental model to understand actions is the one 
of [events](https://en.wikipedia.org/wiki/Event_(computing)) in computer programming.

For example, every key press on your keyboard dispatches a `keyPress` event with a `keyCode`. It's then up to 
your operating system to listen to them and convert them to the 1970's steampunk sci-fi
novel you hope to finish one day.

Actions themselves are simple and [pure functions](https://en.wikipedia.org/wiki/Pure_function). The *only 
thing* they are allowed to do is to convert their arguments into a `payload` object. See here:

```jsx
const logic = kea({
    actions: () => ({
        // take in `amount`, give back `{ amount }`
        addToCounter: (amount) => ({ amount })
    })
})
```

Let's skip ahead a few steps and call `addToCounter` in a React component.
 
For this you use the `useActions` hook like so:

```jsx
import React from 'react'
import { kea, useActions } from 'kea'

const logic = kea({ ... }) // code from above

function BigButton () {
    const { addToCounter } = useActions(logic)

    return (
        <button onClick={() => addToCounter(1000)}>
            Add one thousand! 🤩
        </button>
    )
}
```

In the code above, clicking the button calls `addToCounter` with one argument, `1000`. 

The action then converts it to a `payload` of `{ amount: 1000 }`, which will later be used in
reducers, listeners and other friendly plugins.

Since kea actions are [compatible with Redux](https://redux.js.org/basics/actions), calling
`addCounter(1000)` actually creates and dispatchs an object that also has a `type` key and looks 
something like this:

```javascript
addToCounter(1000) === { type: 'add to counter', payload: { amount: 1000 } }
```

There's one shorthand that can be useful. In case your actions take no arguments (e.g. `loadUsers`), 
just pass `true`, or anything else that's not a function, instead of an arguments-to-payload serializer:

```jsx
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }),
        addOneThousand: true,
        loadUsers: true,
        takeOutGarbage: false
    })
})
```

The `payload` then will be `{ value: true }`... but you'll just ignore it anyway, won't you? 🤔

One more thing. It's **strongly** recommended to *always* return an object 
as a payload from your actions:
 
```jsx
const logic = kea({
    actions: () => ({
        addToCounter: (amount) => ({ amount }), // ❤️ DO this!
        badBadAddToCounter: amount => amount    // 💔 DO NOT do this!
    })
})
```

While it may not feel like such a big deal, knowing that the payload is *always* an object
will save you a lot of worry later on. This is experience talking here. 😉

## Reducers

Reducers store your data and change it in response to actions. 
They are based on the [reducer](https://redux.js.org/basics/reducers) concept from Redux.

Here's an example of a basic counter:

```javascript
const logic = kea({
    actions: () => ({
        increment: (amount) => ({ amount }),
        setCounter: (counter) => ({ counter }),
        reset: true
    }),
    reducers: () => ({
        counter: [0, { 
            increment: (state, { amount }) => state + amount,
            setCounter: (_, { counter }) => counter,
            reset: () => 0
        }]
    })
})
```

When defining reducers in kea you write [pure functions](https://en.wikipedia.org/wiki/Pure_function) 
that take two arguments: the current `state` of the reducer and the `payload` of the action that was 
just dispatched. You then combine the two and return a new state.

In the example above we have three actions: `increment`, `setCounter` and `reset`. We also have a 
reducer called `counter` that will update its value in response to those actions.
It will be `0` by default.

Please note that the *only way* to change the value of `counter` is by dispatching actions and reacting
to them. You can't just jump in there and call `reducers.counter += 1` somewhere. All data manipulation 
*must* always go through an action.

While this may *feel* limiting at first, there is method to madness here. Pushing all state changes
through actions makes for stable and predictable apps that run better, crash less often and
even do your laundry. We all want that, don't we?

Casual readers of other [easy](https://easy-peasy.now.sh/) state management libraries might
protest that you need to write the name of the action twice to get the job done. *Think of the extra
keystrokes* I hear them say.

There's method to this madness as well. First, you should always optimise for [read-time convenience
over write-time convenience](https://medium.com/marius-andra-blog/two-strategies-for-writing-better-code-1be0dc240698).
Second, being explicit with the relationships between actions and reducers makes for very composable
code. This is best illustrated with an example.

Suppose we extend this logic and also store a `name`. We still want the page to have a global `reset`
button that clears both pieces of data. The code would look like this:

```javascript
const logic = kea({
    actions: () => ({
        setName: (name) => ({ name }),
        increment: (amount) => ({ amount }),
        setCounter: (counter) => ({ counter }),
        reset: true
    }),
    reducers: () => ({
        counter: [0, { 
            increment: (state, { amount }) => state + amount,
            setCounter: (_, { counter }) => counter,
            reset: () => 0
        }],
        name: ['', {
            setName: (_, { name }) => name,
            reset: () => ''
        }]
    })
})
```

This example is contrived of course, but should illustrate the point about composability. 
You can have any reducer depend on any action, even ones defined in other logic files! 
(More on that later)

Most of the time you want your actions and reducers to mix together freely, like they're still
living in 2019 without a care in the world.

If, however, you find yourself constantly writing code that has actions such as `setName`, `setPrice`, 
`setLoading` and `setError` with corresponding reducers `name`, `price`, `loading` and `error`
and a 1:1 mapping between them, you're probably following an anti-pattern and doing something wrong.

You'll see a more complete example to illustrate this point in the next section about listeners.

One last thing, just like actions, reducers as well are [pure functions](https://en.wikipedia.org/wiki/Pure_function).
That means no matter how many times you call a reducer with the same input, it should always
give the same output.

More importantly, **reducers must never modify their inputs**. In practice this means that
instead of adding an element to an array via `state.push(newThing)`, you instead create and return a new
array that contains this new element with `[...state, newThing]`.

For example, here's todo list that stores strings in an array:
  
```javascript
const logic = kea({
    actions: () => ({
        addTodo: (todo) => ({ todo }),
        removeTodo: (index) => ({ index }),
        updateTodo: (index, todo) => ({ index, todo }),
    }),
    reducers: () => ({
        // defaults to [], an empty array
        todos: [[], { 
            addTodo: (state, { todo }) => {
                // make a new array and add `todo` at the end
                return [...state, todo]
            },
            removeTodo: (state, { index }) => {
                // filter out the `todo` at the given `index`
                return state.filter((todo, i) => i !== index)
            },
            updateTodo: (state, { index, todo }) => {
                // swap out the `todo` in the array at the given `index`
                return state.map((t, i) => i === index ? todo : n)
            }   
        }]
    })
})
```

This may seem weird and slow at first, but writing *immutable* code like this greatly improves
performance in React. If you really do want to write mutable code,
feel free to wrap your reducers with [immer](https://github.com/immerjs/immer).   

The other thing you can't do in a reducer is to dispatch an action as a response to another action
or to call an API endpoint. For this you use listeners.

## Listeners

Kea prohibits you from writing impure code with side effects (e.g. API calls) in actions and reducers. 
But what are you to do if you live in the real world like *most* of us?  

Enter listeners.

As the name implies, listeners *listen* for dispatched actions and then run some code. Here's an example:

```javascript
const logic = kea({
    actions: () => ({
        loadUsers: true,
    }),

    listeners: () => ({
        loadUsers: async () => {
            const users = await api.get('users')
            // do something with the users?
        } 
    })
})
```

When the `loadUsers` action is dispatched, we, *ahem,* load the users.

Q: What should we do with the `users` once we have them? <br/>
A: We store them in a `reducer` of course!

```javascript
const logic = kea({
    actions: () => ({
        loadUsers: true,
        setUsers: (users) => ({ users })
    }),

    listeners: ({ actions }) => ({
        loadUsers: async () => {
            const users = await api.get('users')
            actions.setUsers(users)
        } 
    }),

    reducers: () => ({
        users: [[], {
            setUsers: (_, { users }) => users
        }]  
    })
})
```

If you're used to React Hooks or some other [easy](https://easy-peasy.now.sh/) state management solution, 
then the above code might seem overly verbose to you. *"Why must we write `loadUsers` and `setUsers` 
twice?"* I might hear some of you ask.

There's a point to being this explicit. If you're following good patterns, it often makes 
sense to use the actions that you're listening to in a reducer or vice-versa, usually to track
second or third order states.

To illustrate this point, let's track the `loading` state in our logic.
Obviously we need a `loading` reducer to store this value, but what about the actions?

Well, here's one bad and *naïve* way you could do it:

```javascript
// NB! This code follows bad patterns, don't do this.
const logic = kea({
    actions: () => ({
        loadUsers: true,
        setUsers: (users) => ({ users }),
        setLoading: (loading) => ({ loading })
    }),

    reducers: () => ({
        users: [[], {
            setUsers: (_, { users }) => users
        }],
        loading: [false, { // DO NOT DO THIS
            setLoading: (_, { loading }) => loading
        }]      
    }),

    listeners: ({ actions }) => ({
        loadUsers: async () => {
            actions.setLoading(true) // DO NOT DO THIS
            const users = await api.get('users')
            actions.setUsers(users)
            actions.setLoading(false) // DO NOT DO THIS
        } 
    })
})
```

If you read the `reducers` section above, you'll remember that it's an anti-pattern to only have
`setThis` and `setThat` actions that only update `this` or `that`.

The better approach to explicitly setting the `loading` state is to have it react to actions.

When do we start loading? When do we stop loading? When the `loadUsers` and `setUsers` actions are
called.

Let's built off of that:

```javascript
const logic = kea({
    actions: () => ({
        loadUsers: true,
        setUsers: (users) => ({ users }),
    }),

    reducers: () => ({
        users: [[], {
            setUsers: (_, { users }) => users
        }],
        loading: [false, {
            loadUsers: () => true,
            setUsers: () => false,
        }]      
    }),

    listeners: ({ actions }) => ({
        loadUsers: async () => {
            const users = await api.get('users')
            actions.setUsers(users)
        } 
    })
})
```

That's already pretty sweet... but what if our API is [running off a potato](https://www.google.com/search?q=raspberry+pi+potato) 
and occasionally throws an error (e.g. timeout)? 

Currently if that happens, `setUsers` will never be dispatched and we'll be `loading` forever!
Surely that's *sub-optimal* and we can do better!

When we add a third reducer to track the `error`, the beauty of explicitly declaring actions and
having reducers and listeners react to them suddenly becomes clear. 😍

The following code demonstrates this well:

```javascript
const logic = kea({
    actions: () => ({
        loadUsers: true,
        loadUsersSuccess: (users) => ({ users }),
        loadUsersFailure: (error) => ({ error }),
    }),

    reducers: () => ({
        users: [[], {
            loadUsersSuccess: (_, { users }) => users
        }],
        usersLoading: [false, {
            loadUsers: () => true,
            loadUsersSuccess: () => false,
            loadUsersFailure: () => false
        }],
        usersError: [null, {
            loadUsers: () => null,
            loadUsersFailure: (_, { error }) => error
        }]      
    }),

    listeners: ({ actions }) => ({
        loadUsers: async () => {
            try {
                const users = await api.get('users')
                actions.loadUsersSuccess(users)
            } catch (error) {
                actions.loadUsersFailure(error.message)            
            }   
        } 
    })
})
```

Please note that for aesthetics, I renamed `loading` to `usersLoading` and 
`setUsers` to `loadUsersSuccess`.


## Loaders

The pattern above is so common that there's a way to abstract it even further.

Using the kea-loaders plugin, the above code can be simplified to this:

```javascript
const logic = kea({
    loaders: () => ({
        users: [[], {
            loadUsers: async () => await api.get('users')
        }]
    })
})
```

The code above is identical to the block before it. It also creates three reducers: 
`users`, `usersLoading` and `usersError`, along with three actions: `loadUsers`,
`loadUsersSuccess` and `loadUsersFailure`.

## Selectors
- are basically computed properties
- every reducer gets a selector automatically

## Values
- shorthand for calling selectors on the current store state
- used in listeners


TODO: continue writing here...