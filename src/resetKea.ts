import { resetContext } from 'kea'
import { loadersPlugin } from 'kea-loaders'
import { routerPlugin } from 'kea-router'

resetContext({
    plugins: [
        loadersPlugin,
        routerPlugin({
            // The browser History API or something that mocks it
            // Defaults to window.history in the browser and a mock memoryHistory otherwise
            history: (typeof window !== 'undefined' ? window.history : {}) as any,

            // An object with the keys { pathname, search, hash } used to
            // get the current location. Defaults to window.location in the browser and
            // an empty object otherwise.
            location: (typeof window !== 'undefined' ? window.location : {}) as any,
        }),
    ],
})
