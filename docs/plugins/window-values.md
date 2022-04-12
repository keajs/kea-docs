# window-values

The [kea-window-values](https://github.com/keajs/kea-window-values) plugin
lets you sync `window.whatever` with `values.anything`.

Values are synced on window `scroll` and `resize` events.

## Installation

```javascript
import { windowValuesPlugin } from 'kea-window-values'

resetContext({
  plugins: [windowValuesPlugin({ window: window })],
})
```

## Usage

```javascript
const logic = kea({
  windowValues: {
    isSmallScreen: (window) => window.innerWidth < 640,
    isRetina: (window) => window.devicePixelRatio > 2,
    scrollBarWidth: (window) => window.innerWidth - window.body.clientWidth,
  },
})

// later in your app
if (logic.values.isSmallScreen) {
  console.log('Screen width under 640px')
}
```
