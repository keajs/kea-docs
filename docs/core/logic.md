---
sidebar_position: 1
---

# logic

All Kea code lives inside a `logic`, which is created by calling [`kea([])`](/docs/core/kea)

```ts
import { kea } from 'kea'

const logic = kea([])
```

<details>
  <summary>Why do we call it `logic`?</summary>
  <div>
    Well, we had to call it something and everything else was already taken. 😅
   
    More seriously, the name `logic` implies that calling `kea()` return complex objects,
    which not only contain a piece of your state, but also all the _logic_ that manipulates it.
   
    It's a useful convention, and I suggest sticking to it. Feel free to call your logic with
    names that make sense, such as `accountLogic`, `dashboardLogic`, etc.
  </div>
</details>