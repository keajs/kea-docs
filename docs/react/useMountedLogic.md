---
sidebar_position: 2
---
# useMountedLogic

Assure that the logic is mounted when the component renders and is unmounted when the component is
destroyed.

This hook is not needed if you use any of the other hooks.

```javascript
import { kea, useMountedLogic } from 'kea'

const logic = kea([])

function MyComponent() {
  useMountedLogic(logic)

  return <div>Logic is now mounted!</div>
}
```
