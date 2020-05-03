---
id: sagas
title: Sagas
sidebar_label: Sagas
---

Kea has first class support for sagas via the [`kea-saga`](https://github.com/keajs/kea-saga) plugin.

Read more about Sagas on the [redux-saga](https://redux-saga.js.org/) homepage.

:::note Breaking changes with 1.0
If you're upgrading from 0.x, please 
[read this](https://github.com/keajs/kea-saga/blob/master/CHANGELOG.md#a-note-regarding-sagas-and-actions) 
regarding the breaking change of automatically binding actions to dispatch in Kea.
:::

## Installation

First install the [`kea-saga`](https://github.com/keajs/kea-saga) and [`redux-saga`](https://github.com/redux-saga/redux-saga) packages:

```shell
# if you're using yarn
yarn add kea-saga redux-saga

# if you're using npm
npm install --save kea-saga redux-saga
```

Then you install the plugin:

```javascript
import sagaPlugin from 'kea-saga'
import { resetContext } from 'kea'

resetContext({
    createStore: true,
    plugins: [sagaPlugin],
})
```

## Usage

First, read the docs on the [redux-saga](https://redux-saga.js.org/) homepage to learn how sagas work.

Adding `kea-saga` will give your logic stores access to the keys: `start`, `stop`, `takeEvery`, `takeLatest`, `workers`, `sagas`.

```javascript
import { kea } from 'kea'

export default kea({
    // ... see the api docs for more

    start: function* () {
        // saga started or component mounted
        console.log(this)
    },

    stop: function* () {
        // saga cancelled or component unmounted
    },

    takeEvery: ({ actions, workers }) => ({
        simpleAction: function* () {
            // inline worker

            // one way to dispatch an action
            actions.actionWithStaticPayload() 

            // anoter way to dispatch an action
            yield put(actionCreators.actionWithStaticPayload()) 
         
            // one way to read a value
            const someValue = values.someValue

            // anoether way to read a value
            const someValueAgain = yield this.get('someValue')
        },
        [actions.simpleAction]: function* () {
            // another way to define an inline worker
        },
        actionWithDynamicPayload: workers.dynamicWorker,
    }),

    takeLatest: ({ actions, workers }) => ({
        actionWithStaticPayload: function* () {
            // inline worker
        },
        actionWithManyParameters: workers.dynamicWorker,
    }),

    workers: {
        *dynamicWorker(action) {
            const { id, message } = action.payload // if from takeEvery/takeLatest
            // reference with workers.dynamicWorker
        },
        longerWayToDefine: function* () {
            // another way to define a worker
        },
    },

    sagas: [saga1, saga2],
})
```

### start: `function * () {}`

Saga that is started whenever the component is connected or the saga exported from this 
component starts

Note: sagas are started before your _wrapped component's_ `componentDidMount`. Actions 
dispatched before this lifecycle method will not be seen inside `start`.

```javascript
 // Input
start: function * () {
  // saga started or component mounted
  console.log(this)
}

// Output
myRandomSceneLogic.saga == function * () {
  // saga started or component mounted
  console.log(this)
  // => { 
  //      actionCreators, 
  //      actions, 
  //      workers, 
  //      values, 
  //      path, 
  //      key, 
  //      get: function * (), 
  //      fetch: function * () 
  //    }
}
```

### stop: `function * () {}`

Saga that is started whenever the component is disconnected or the saga exported from this 
component is cancelled

This function is called right before your _wrapped component's_ `componentWillUnmount` 
lifecycle method.

```javascript
// Input
stop: function * () {
  // saga cancelled or component unmounted
}

// Output
myRandomSceneLogic.saga == function * () {
  try {
    // start()
  } finally {
    if (cancelled()) {
      // saga cancelled or component unmounted
    }
  }
}
```

### takeEvery: `({ actions }) => ({})`

Run the following workers every time the action is dispatched

Note: sagas are started before your wrapped component's `componentDidMount`. Actions dispatched 
before this lifecycle method will not be seen by `takeEvery`.

```javascript
// Input
takeEvery: ({ actions, workers }) => ({
    [actions.simpleAction]: function* () {
        // inline worker
    },
    [actions.actionWithDynamicPayload]: workers.dynamicWorker,
})

// Output
myRandomSceneLogic.saga ==
    function* () {
        // pseudocode
        yield fork(function* () {
            yield [
                takeEvery(
                    actions.simpleAction.toString(),
                    function* () {
                        // inline worker
                    }.bind(this)
                ),
                takeEvery(actions.actionWithDynamicPayload.toString(), workers.dynamicWorker.bind(this)),
            ]
        })
    }
```

### takeLatest: `({ actions }) => ({})`

Run the following workers every time the action is dispatched, cancel the previous worker if still 
running

Note: sagas are started before your wrapped component's `componentDidMount`. Actions dispatched 
before this lifecycle method will not be seen by `takeLatest`.

```javascript
// Input
takeLatest: ({ actions, workers }) => ({
    [actions.simpleAction]: function* () {
        // inline worker
    },
    [actions.actionWithDynamicPayload]: workers.dynamicWorker,
})

// Output
myRandomSceneLogic.saga ==
    function* () {
        // pseudocode
        yield fork(function* () {
            yield [
                takeLatest(
                    actions.simpleAction.toString(),
                    function* () {
                        // inline worker
                    }.bind(this)
                ),
                takeLatest(actions.actionWithDynamicPayload.toString(), workers.dynamicWorker.bind(this)),
            ]
        })
    }
```

#### workers: `{}`

An object of workers which you may reference in other sagas.

```javascript
// Input
workers: {
  * dynamicWorker (action) {
    const { id, message } = action.payload // if from takeEvery/takeLatest
    // reference with workers.dynamicWorker
  },
  longerWayToDefine: function * () {
    // another worker
  }
}

// Output
myRandomSceneLogic.workers == {
  dynamicWorker: function (action) *
    const { id, message } = action.payload // if from takeEvery/takeLatest
    // reference with workers.dynamicWorker
  }.bind(myRandomSceneLogic),

  longerWayToDefine: function () * {
    // another worker
  }.bind(myRandomSceneLogic)
}
```

### sagas: `[]`

Array of sagas that get exported with this component's saga

```javascript
// Input
sagas: [saga1, saga2]

// Output
myRandomSceneLogic.saga ==
    function* () {
        yield fork(saga1)
        yield fork(saga2)

        // start() ...
    }
```
