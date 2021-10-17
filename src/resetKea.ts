import { resetContext } from 'kea'
import { loadersPlugin } from 'kea-loaders'
import { routerPlugin } from 'kea-router'

resetContext({
    plugins: [loadersPlugin, routerPlugin],
})
