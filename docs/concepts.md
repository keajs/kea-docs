---
id: concepts
title: The Concepts of Kea
sidebar_label: Concepts
---

This doc describes the different parts of Kea and how to they all fit together.

## Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`? 

Well, we had to call it something and everything else was already taken 😅.

More seriously, the name `logic` implies that calling `kea()` return complex objects, 
which not only contain a piece of your state, but also all the logic that will manipulate it.  

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

Actions themselves are simple and [pure functions](https://en.wikipedia.org/wiki/Pure_function). The only 
thing they must do is to convert their arguments into a `payload` object. See here:

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

The action then converts it to a `payload` of `{ amount: 1000 }`. This payload will later be used in
reducers, listeners and other friendly plugins.

Since kea actions are [compatible with Redux](https://redux.js.org/basics/actions), calling
`addCounter(1000)` actually creates and dispatchs an object that also has a `type` key and looks 
something like this:

```javascript
addToCounter(1000) === { type: 'add to counter', payload: { amount: 1000 } }
```

There's one shorthand that can be useful. In case your actions take no arguments, just pass `true`
(or anything that's not a function) instead of an arguments-to-payload serializer:

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

The `payload` will then be `{ value: true }`... but you'll just ignore it anyway, won't you? 🤔


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
code.

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

This example is contrived of course, but should illustrate the point nicely. 

In general, you want your actions and reducers to mix together freely. 
If you find yourself constantly writing code that has actions such as `setName`, `setPrice`, 
`setLoading` and `setError` with corresponding reducers `name`, `price`, `loading` and `error`
that only react to one action, you're probably following an anti-pattern and doing something wrong.

You'll see a better example to illustrate this point in the next section about listeners.

One last thing, just like actions, reducers as well are [pure functions](https://en.wikipedia.org/wiki/Pure_function).
That means no matter how many times you call a reducer with the same input, it should always
give the same output.

More importantly, **reducers must never modify their inputs**. In practice this means that for example
instead of adding an element to an array via `state.push(newThing)`, you instead create and return a new
array that contains this new element with `[...state, newThing]`. 

For example, a simple todo list that stores strings in an array:
  
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

The other thing you can't do in a reducer is to dispatch an action as a response to another action.
For this you use listeners.

## Listeners

Kea prohibits you from writing impure code with side effects (e.g. API calls) in actions and reducers. 
So what are you to do if you live in the real world like most of us?  

Enter listeners.

As the name implies, listeners *listen* for actions and then run some code. Here's an example:

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

    reducers: () => ({
        users: [[], {
            setUsers: (_, { users }) => users
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

If you're used to React Hooks or some other [easy](https://easy-peasy.now.sh/) state management solution, 
then the above code might seem overly verbose to you. *"Why must we write `loadUsers` and `setUsers` 
twice?"* I might hear some of you ask.

There's a point to being this explicit. If you're following good patterns, it often makes 
sense to use the actions that you're listening to in a reducer or vice-versa, mainly to track
second order effects.

To illustrate this point, let's try adding a `loading` state to our logic.

Here's one bad and *naïve* way you could do it. 

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

If you read the `reducers` section above, you'll know that it's an anti-pattern to only have
`setThis` and `setThat` actions which do nothing more that to update `this` or `that`.

Let's clean this up. Instead of explicitly setting state, let's instead react to actions.

Remember that we start `loading` when the `loadUsers` action is dispatched and we stop `loading` 
when the `setUsers` action gets dispatched. Let's build off of that:

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

That's already pretty sweet. But what if we get an error instead?

I would suggest you follow this pattern then:

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

Please note that for consistency, I renamed some other variables here.


## Loaders

The pattern above is so common that there's a way to abstract it even further.

Using the kea-loaders plugin, the above code will look like this:

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

...

```jsx
function SuperCounter () {
    const { increment } = useActions(logic)
    const { counter } = useValues(logic)

    return (
        <div>
            Counter: {counter}<br/>
            <button onClick={() => increment(100)}>Add 100 😕</button>
            <button onClick={() => increment(999)}>Add 999 🤩</button>
        </div>
    )
}
```

