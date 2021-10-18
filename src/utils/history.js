import { createMemoryHistory } from 'history'

export const history = createMemoryHistory()
history.pushState = history.push
history.replaceState = history.replace
