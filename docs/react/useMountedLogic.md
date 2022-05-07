---
sidebar_position: 2
---

# useMountedLogic

Assure that the logic is mounted when the component renders and is unmounted when the component is
destroyed.

This hook is not needed if you use any of the other hooks like `useActions` or `useValues`, which use it internally.

```javascript
import { kea, useMountedLogic } from 'kea'

const logic = kea([])

function MyComponent() {
  // use as is to make sure the logic is mounted
  useMountedLogic(logic)

  // returns the built logic, with props from BindLogic if available
  const builtLogic = useMountedLogic(logic)

  // make sure a built logic with specific props is mounted
  useMountedLogic(logic({ id: 123 }))

  return <div>Logic is now mounted!</div>
}
```
