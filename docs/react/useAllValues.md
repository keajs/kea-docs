---
sidebar_position: 3
---

# useAllValues

Similar to [`useValues`](useValues), but selects all the values in the logic and stores their current state in an object.

```javascript
import { kea, useAllValues } from 'kea'

const logic = kea([])

function MyComponent() {
  const values = useAllValues(logic)

  return (
    <div>
      {values.counter} * 2 = {values.doubleCounter}
    </div>
  )
}
```
