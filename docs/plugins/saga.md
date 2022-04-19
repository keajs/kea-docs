# saga

Kea has support for sagas via the [`kea-saga`](https://github.com/keajs/kea-saga) plugin.

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
  plugins: [sagaPlugin],
})
```

## Usage

First, read the docs on the [redux-saga](https://redux-saga.js.org/) homepage to learn how sagas work.

Adding `kea-saga` will give you: `saga`, `cancelled`, `workers`, `takeEvery`, `takeLatest`.

```javascript
import { kea } from 'kea'
import { saga, cancelled } from 'kea-saga'

export default kea([
  // ... see the api docs for more

  saga(function* () {
    // saga started or component mounted
    console.log(this)
  }),

  cancelled(function* () {
    // saga cancelled or component unmounted
  }),

  workers({
    *dynamicWorker(action) {
      const { id, message } = action.payload // if from takeEvery/takeLatest
      // reference with workers.dynamicWorker
    },
    longerWayToDefine: function* () {
      // another way to define a worker
    },
  }),

  takeEvery(({ actions, actionCreators, values, workers }) => ({
    simpleAction: function* () {
      // inline worker

      // one way to dispatch an action
      actions.actionWithStaticPayload()

      // another way to dispatch an action
      yield put(actionCreators.actionWithStaticPayload())

      // yet another way to dispatch an action
      yield put(this.actionCreators.actionWithStaticPayload())

      // one way to read a value
      const someValue = values.someValue

      // another way to read a value
      const someValueAgain = this.values.someValue

      // yet another way to read a value
      const someValueOnceAgain = yield this.get('someValue')
    },
    [actions.simpleAction]: function* () {
      // another way to define an inline worker
    },
    actionWithDynamicPayload: workers.dynamicWorker,
  })),

  takeLatest(({ actions, workers }) => ({
    actionWithStaticPayload: function* () {
      // inline worker
    },
    actionWithManyParameters: workers.dynamicWorker,
  })),
])
```

### saga: `function * () {}`

Saga that is started whenever the component is mounted.

```javascript
// Input
const logic = kea([
  saga(function* () {
    // saga started or component mounted
    console.log(this)
  }),
])
```

### cancelled: `function * () {}`

Saga that is started whenever the component is unmounted or the saga exported from this component is cancelled.

```javascript
const logic = kea([
  cancelled(function* () {
    // saga cancelled or component unmounted
  }),
])
```

### takeEvery: `({ actions }) => ({})`

Run the following workers every time the action is dispatched

```javascript
const logic = kea([
  takeEvery(({ actions, workers }) => ({
    [actions.simpleAction]: function* () {
      // inline worker
    },
    [actions.actionWithDynamicPayload]: workers.dynamicWorker,
  })),
])
```

### takeLatest: `({ actions }) => ({})`

Run the following workers every time the action is dispatched, cancel the previous worker if still
running

```javascript
const logic = kea([
  takeLatest(({ actions, workers }) => ({
    [actions.simpleAction]: function* () {
      // inline worker
    },
    [actions.actionWithDynamicPayload]: workers.dynamicWorker,
  })),
])
```

#### workers: `{}`

An object of workers which you may reference in other sagas.

```javascript
import { workers } from 'kea-saga'

// Input
const logic = kea([
  workers({
    *dynamicWorker(action) {
      const { id, message } = action.payload // if from takeEvery/takeLatest
      // reference with workers.dynamicWorker
    },
    longerWayToDefine: function* () {
      // another worker
    },
  }),
])

// Output
logic.workers ==
  {
    dynamicWorker: function* (action) {
      const { id, message } = action.payload // if from takeEvery/takeLatest
      // reference with workers.dynamicWorker
    }.bind(logic),

    longerWayToDefine: function* () {
      // another worker
    }.bind(logic),
  }
```
