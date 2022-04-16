---
sidebar_position: 0
---
# useActions

Assure the logic is mounted and fetch actions from the logic. 

```javascript
import { kea, useActions } from 'kea'

const logic = kea([ ... ])

function MyComponent () {
  const { increment } = useActions(logic)

  return <button onClick={increment}>Increment</button>
}
```

