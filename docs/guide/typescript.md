---
id: typescript
title: TypeScript
sidebar_label: TypeScript
---
import Gist from '../playground/gists/gist'

To get fully type your logic you have two options:

- Run `kea-typegen watch` to automatically generate types for your logic
- Use `MakeLogicType<Values, Actions>` with handmade interfaces for values and actions

Both options generate a logic type that looks something like this:

<Gist username="mariusandra" id="00babbdafdcd04488a0e78e876cb685a" />

This logic type is then impoerted and fed back into `kea()`:

```javascript
import { githubLogicType } from './githubLogicType'

export const githubLogic = kea<githubLogicType>({
  // ...
})
```


:::note Next steps
* Read about [Debugging](/docs/guide/debugging) to be even more productive when writing Kea code.  
:::