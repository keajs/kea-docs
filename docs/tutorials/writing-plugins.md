---
id: writing-plugins
title: Writing plugins
---

:::warning
This page is still a work in progress: this tutorial has not been completed.
:::

:::tip

NB! See the [plugins API page](/docs/api/plugins) for a list of everything that plugins can do.

:::

In this guide we will write a simple plugin called "requests" that takes as input an action and creates 3 actions for different states of this action. Something like this:

```javascript
// this input:
kea({
  requests: () => ({
    fetchArticle: (id) => api.fetchArticle(id)
    fetchComments: (id) => api.fetchComments(id),
    postComment: (id, comment) => api.postComment(id, comment)
  })
})

// will be converted to this output:
kea({
  actions: () => ({
    fetchArticle: (id) => ({ id }),
    fetchArticleSuccess: (request, response) => ({ request, response }),
    fetchArticleFailure: (error) => ({ error })

    fetchComments: (id) => ({ id }),
    fetchCommentsSuccess: (request, response) => ({ request, response }),
    fetchCommentsFailure: (error) => ({ error })

    postComment: (id, comment) => ({ id, comment }),
    postCommentSuccess: (request, response) => ({ request, response }),
    postCommentFailure: (error) => ({ error })
  })
})
```

The first step in authoring a plugin is to create a blank plugin and add it to the plugins array in `resetContext`.

Here's a sample skeleton structure for a plugin, extracted from the code on the [plugins API page](https://kea.js.org/api/plugins). See that page for all that you can do with plugins.

```javascript
const requestsPlugin = (/* { options } */) => ({
  // Required: name of the plugin
  name: 'requests'

  // default values for output in logic,
  // also used to register keys that the plugin exports on the logic
  defaults: () => ({
  }),

  // when are the build steps run
  // (skip this and they are appended to the end)
  buildOrder: {
  },

  // steps that are performed when building the logic
  buildSteps: {
  }

  // various other events that the plugin can hook into
  events: {
  }
})


// later:
resetContext({
  createStore: true,
  plugins: [ requestsPlugin ]
})
```

This time we're only interested in the `afterLogic` event. We will take the input from our "requests" object and extend the logic with the actions that we generate from it.

```javascript
const requestsPlugin = (/* { options } */) => ({
  name: 'requests'

  events: {
    afterLogic (logic, input) {
      // skip if there are no requests in the input
      if (!input.requests) {
        return
      }

      // run the requests function with the already created logic as an input,
      // so it can do ({ actions, ... }) => ({ ... })
      const requests = input.requests(logic)

      // TODO: convert requests into newActions
      let newActions = {}

      // extend the logic with these actions
      logic.extend({
        actions: () => newActions
      })
    }
  }
})
```

:::note

This documentation is still a work in progress... but I hope you can imagine what happens next :)

:::
