---
sidebar_position: 4
---

# useAllValues

Similar to [`useValues`](useValues), but eagerly selects all the values in the logic and stores their current state in an object.

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
