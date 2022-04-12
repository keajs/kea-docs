---
id: websockets
title: WebSockets
sidebar_label: WebSockets
---

:::note Thank You
This is a community plugin built by [@sanchezweezer](https://github.com/sanchezweezer/).
:::

Please help write this section or read more about [`kea-socket.io`](https://github.com/sanchezweezer/kea-socket.io) on github!

## Description

[`Socket.io`](https://socket.io/) binding for Kea store:

## Installation

First install the [`kea-socket.io`](https://github.com/sanchezweezer/kea-socket.io) package:

```shell
# if you're using yarn
yarn add kea-socket.io

# if you're using npm
npm install --save kea-socket.io
```

Then install the plugin:

```javascript
import socketPlugin from 'kea-socket.io'
// thunk or saga plugin needed to emit socket.io events
import thunkPlugin from 'kea-thunk'
import { resetContext } from 'kea'

resetContext({
  plugins: [thunkPlugin, socketPlugin],
})
```

## Configuration options

The plugin takes the following options:

```javascript
resetContext({
  plugins: [
    socketPlugin({
      // in case you want to replace this, e.g. for tests or non browser environments
      sockets: [socketIo('http://localhost:9066', { path: '/api/sockets' })],

      // added to all events names before all
      prefix: 'example_',

      // to change on witch events connector need to call error handle
      ERROR_EVENTS: ['error', 'api-error'],

      // to change the error handle, func({ error, logic, input, socket })
      // if func return === false, then event handle stop
      errorHandler: ({ error, logic, input, socket } = {}) => {
        console.error('[kea-socket.io] ' + error)
        console.error(socket)
        console.error(logic)
      },
      // to change mapping of events from socket to store, func({ name })
      mapSocketEventToStore: ({ name }) => name,

      // to add your own global funcs to sockets, funcs don't have any params
      emitterActions: {},
    }),
  ],
})
```

## Sample usage

```javascript
const someLogic = kea({
  path: () => ['scenes', 'something', 'foobar'],

  actions: {
    socket_testEvent: ({ payload }) => payload,
    change: (value) => ({ value }),
  },

  reducers: {
    persistedValue: [
      0,
      PropTypes.number,
      { persist: true },
      {
        change: (_, payload) => payload.value,
      },
    ],
  },

  thunks: ({ emitters, emitterActions }) => ({
    testEmit: () => {
      // emit event to socket with default nsp ('/')
      emitters.default.emit('message', 'hello world')
      emitterActions.disconnectAll()
    },
    socket_anotherTestEvent: ({ payload }) => {
      // this is data from socket event
      console.log(payload)
    },
  }),
})
```
