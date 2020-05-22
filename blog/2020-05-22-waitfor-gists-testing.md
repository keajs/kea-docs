---
id: waitfor-gists-testing
title: "New stuff: Gists, WaitFor, Testing"
author: Marius Andra
author_title: Kea Core Team
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea]
---

Few more things got released all at once:

## Funny Gists

I added [a playground page](/docs/playground/gists) with three interesting
code snippets for Kea:

- A quick [Kea GraphQL client](/docs/playground/gists#kea-graphql)
- A plugin to measure the [window's dimensions](/docs/playground/gists#kea-dimensions)
- A rough sketch of the [Kea DevTools](/docs/playground/gists#kea-devtools)

They are all too rough to be released as official plugins yet, but can already help
in some situations. 

If you have the time, feel free to contribute new gists or improve on the existing ones!

## WaitFor

The [`kea-waitfor`](/docs/plugins/waitfor) plugin lets you `await` for actions.

It's great if you're writing tests and want to wait for something to happen
before leaving the test

```javascript
import { kea } from 'kea'
import { waitForAction } from 'kea-waitfor'

const logic = kea({
    actions: () => ({
        setValue: value => ({ value }),
        valueWasSet: value => ({ value })
    }),
    
    listeners: ({ actions }) => ({
        setValue: async ({ value }) => {
            await delay(300)
            actions.valueWasSet(value)
        }
    })
})

logic.mount()
logic.actions.setValue('hamburger')
const { value } = await waitForAction(logic.actions.valueWasSet)

console.log(value) 
// --> 'hamburger'
```

There's also a [`waitForCondition`](/docs/plugins/waitfor#waitforcondition) that lets you ask custom questions from the dispatched
actions.

```javascript
const { value } = await waitForCondition(action => {
    return action.type === logic.actions.valueWasSet.toString() && 
           action.payload.value === 'cheeseburger'
})
```

In addition, the [plugin documentation includes examples](/docs/plugins/waitfor#wait-for-many-events) for waiting for different cominations of actions:
- Wait for all to be dispatched
- Wait for the first one of many (race)
- Timeout on the waiting

## Testing docs

Inspired by a [Github Issue](https://github.com/keajs/kea/issues/107), I wrote
a quick doc about [unit testing kea logic](/docs/guide/testing). Feedback and contributions are very welcome! 
