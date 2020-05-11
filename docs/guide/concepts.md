---
id: concepts
title: Core Concepts
sidebar_label: Core Concepts
---

:::note
This doc describes the core parts of Kea. After reading this, you'll know 80% of everything you 
need to know. Then follow up with [Additional Concepts](/docs/guide/more) to learn the rest.
:::

## Logic

All Kea code lives inside a `logic`, which is created by calling `kea()`

```javascript
import { kea } from 'kea'

const logic = kea({ ... })
```

Why do we call it `logic`? 

Well, we had to call it something and everything else was already taken. 😅

More seriously, the name `logic` implies that calling `kea()` return complex objects, 
which not only contain a piece of your state, but also all the *logic* that manipulates it.  

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

To call `addToCounter` in a React component you use the `useActions` hook:

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

:::note
Calling `logic.actions.addToCounter(1000)` dispatches the action directly. If you only want to *create*
the action object without dispatching it, use `logic.actionCreators.addToCounter(1000)` 
:::

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

:::note
In truth, you don't really *have to* convert the action arguments into objects for the payload.
However I've found that it really helps if every payload *is* an object. Otherwise you'll 
have about 50% of your payloads be objects like `{ id, name }` and the other 50% just scalars `id`.

It'll be especially confusing, if you have one reducer (e.g. `todos`) and for some actions (`removeTodo`) 
the payload is just `id`, but for others (`editTodo`) it's `{ id, todo }`. I've found that keeping to a 
convention where payloads are *always* objects [removes one thing you need to think about](https://medium.com/marius-andra-blog/two-strategies-for-writing-better-code-1be0dc240698) 
and makes for cleaner code. Repeating *"Was it an object or was it a just an id? I'd better check to make sure I don't 
make a mistake here."* many times a day can get tiring.

In addition to this, what starts out as an action with just one argument (`removeTodo: id => id`)
will sometimes get a few optional arguments (`removeTodo: (id, undo = false) => ({ id, undo })`).
Having to then refactor every reducer/listener to use `id = payload.id` instead of `id = payload` is 
not going to be fun. Just stick to having all payloads as objects.   
:::


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

Casual readers of other lightweight state management libraries might
protest that you need to write the name of the action (`increment`) twice to get the job done: 
once in `actions` and once in `reducers`. *Think of the extra keystrokes* I hear them say.

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
(See [Connecting Logic Together](/docs/guide/advanced#connecting-logic-together) in Advanced Concepts)

Most of the time you want your actions and reducers to mix together freely, like they're attending
a music festival in a pre-pandemic world.

If, however, you find yourself constantly writing code that has actions such as `setName`, `setPrice`, 
`setLoading` and `setError` with corresponding reducers `name`, `price`, `loading` and `error`
and a 1:1 mapping between them, you're probably following an anti-pattern and doing something wrong.

You'll see a more complete example to illustrate this point in the next section about listeners.

One last thing, just like actions, reducers as well are [pure functions](https://en.wikipedia.org/wiki/Pure_function).
That means no matter how many times you call a reducer with the same input (same `state` and `payload`),
it should always give the same output.

More importantly, **reducers must never modify their inputs**. In practice this means that
instead of adding an element to an array via `state.push(newThing)`, you instead create and return a new
array that contains this new element with `[...state, newThing]`.

For example, here's todo list that stores strings in an array:
  
```javascript
const todosLogic = kea({
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
                return state.map((t, i) => i === index ? todo : t)
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

To use the values stored in reducers in React, use the `useValues` hook:

```jsx
import React from 'react'
import { useValues } from 'kea'

function Todos() {
    const { todos } = useValues(todosLogic)

    return <ul>{todos.map(todo => <li>{todo}</li>)}</ul>
}
```


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
        loadUsers: async (payload) => {
            const users = await api.get('users')
            // do something with the users?
        } 
    })
})
```

When the `loadUsers` action is dispatched, we, *ahem,* load the users.

The listener will get the action's `payload` as its first argument, but we will ignore it in this case. 

Q: What should we do with the `users` once we have them? <br/>
A: We store them in a `reducer` through an `action` of course!

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

If you're used to React Hooks or other lightweight state management solution, 
then the above code might seem overly verbose to you. *"Why must we write `loadUsers` and `setUsers` 
twice?"* is a valid question. *"Why can't listeners just implicitly create a new action"* might be another.

There's a point to being this explicit. If you're following good patterns, it often makes 
sense to use the actions that you're listening to in a reducer or vice-versa, usually to track
second or third order state.

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

The following code demonstrates this well. Please note that for aesthetics, I renamed `loading` 
from before to `usersLoading` and `setUsers` to `loadUsersSuccess`:

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


There are a few other cool things you can do with listeners:

1. Listeners have built-in support for debouncing and handling out-of-order network requests through `breakpoints`
2. You can share listeners between actions with `sharedListeners`
3. Any other logic called inside listeners will `autoConnect` to your logic

Please read the [listeners](/docs/effects/listeners) side-effect page to learn more about these features. 

## Loaders

The pattern above is so common that there's a way to abstract it even further.

Using the [kea-loaders plugin](/docs/plugins/loaders), the above code can be simplified to this:

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

See the [documentation for kea-loaders](/docs/plugins/loaders) to find out more.

## Selectors

Selectors combine multiple reducers into one combined value.
They are powered by [reselect](https://github.com/reduxjs/reselect) under the hood.

Let's take this example:

```javascript
const logic = kea({
    actions: () => ({
        setMonth: (month) => ({ month }),
        setRecords: (records) => ({ records })
    }),
    reducers: () => ({
        month: ['2020-04', {
            setMonth: (_, { month }) => month
        }],
        records: [[], {
            setRecords: (_, { records }) => records
        }]  
    })
})
``` 

It's a pretty simple logic that just stores two values, `records` and `month`. Our pointy-haired
boss now tasked us with showing all records that belong to the selected month. How do we do this? 

A *naïve* solution in pure react would look like this: 

```jsx
fuction RecordsForThisMonth() {
    const { month, records } = useValues(logic)
    const recordsForSelectedMonth = records.filter(r => r.month === month)

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)</ul>
}
```

At the end of the day this gets the job done, but there's an obvious problem here: performance.
Every time we render this component, we have to do all the work of filtering the records.

What if we could pre-calculate this list?

If you've read the React docs, you know that [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo)
is the answer:


```jsx
fuction RecordsForThisMonth() {
    const { month, records } = useValues(logic)

    // DO NOT do this!
    const recordsForSelectedMonth = useMemo(() => {
        return records.filter(r => r.month === month)
    }, [records, month])

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)</ul>
}
```

This works, but it introduces another, more subtle problem: it breaks 
the [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) principle.

With Kea, your React components should be pretty dumb. They should not know the internal structure
of your `records` array. Instead they should just fetch the values they need directly from `logic`.

This means we have to move this filtering of `records` into the `logic` itself.
That's where selectors come in:

```javascript
const logic = kea({
    actions: () => ({
        setMonth: (month) => ({ month }),
        setRecords: (records) => ({ records })
    }),
    reducers: () => ({
        month: ['2020-04', {
            setMonth: (_, { month }) => month
        }],
        records: [[], {
            setRecords: (_, { records }) => records
        }]  
    }),
    selectors: ({ selectors }) => ({
        recordsForSelectedMonth: [
            () => [selectors.month, selectors.records],
            (month, records) => {
                return records.filter(r => r.month === month)
            }
        ]
    })
})
``` 

Then get the value of `recordsForSelectedMonth` directly in your component:

```jsx
fuction RecordsForThisMonth() {
    const { recordsForSelectedMonth } = useValues(logic)

    return <ul>{recordsForSelectedMonth.map(r => <li>{r.name}</li>)</ul>
}
```

A few things to keep in mind with selectors:

* All reducers automatically get a selector with the same name. Thus you can directly
  use the values of reducers as the input in new selectors, like we did above with
  `selectors.month` and `selectors.records`.
* Selectors are recalculated only if the value of their inputs changes. In the example above,
  no matter how often your components ask for `recordsForSelectedMonth`, they will get
  a cached response as long as `month` and `records` haven't changed since last time.
* The order of selectors doesn't matter. If you add another selector called
  `sortedRecordsForSelectedMonth`, it can be defined either before or after `recordsForSelectedMonth`.
  As long as you don't have circular dependencies, the order doesn't matter.

At the end of the day, `selectors` themselves are simple functions, which just take as input
the redux store's current state, traverse it and return the value you're looking for:

```javascript
logic.selector = state => state.path.to.logic
logic.selectors.month = state => logic.selector(state).month

logic.selectors.month(store.getState()) === '2020-04'
```

It is good practice to have as many selectors as possible, each of which sort or filter the *raw* data
stored in your reducers further than the last.

It is bad practice to have listeners do this filtering. For example, you should **not** write code,
where on the action `selectUser(id)`, you run a listener that takes the stored value of `users`,
filters it to finds the selected user and then calls another action `setUser` to store this value
in the `user` reducer.

Such an approach will violate the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)
principle. You will end up with two copies of this one user in your store. If you change something in `user`, 
should you also change the same data in `users`?

Instead, on `selectUser(id)`, store `selectedUserId` in a reducer. Then create a new selector `user`
that combines `selectedUserId` and `users` to dynamically find the selected user.

You'll have a lot less bugs this way. 😉

## Values

The last of Kea's core concepts is `values`. You have already seen used with
`useValues` in React components:

```javascript
const { month } = useValues(logic)
```

Values are just a shorthand for accessing selectors with the store's latest state already applied.

Basically: 

```javascript
logic.values.month === logic.selectors.month(store.getState()) 
```

That's it.

In practice, other than in React via `useValues`, you also access `values` in listeners. For example:

```jsx
const logic = kea({
    // ... actions and reducers skipped

    listeners: ({ actions, values }) => ({
        fetchDetails: async () => {
            const details = await api.fetchDetails(values.username)
            actions.setDetails(details)
        }
    })
})
```

<br />

:::note Next steps
* Try building something. Read the [Github API](/docs/tutorials/github) tutorial to get your
  hands dirty.
* Read the [additional concepts](/docs/guide/more) page to learn other useful concepts.
:::