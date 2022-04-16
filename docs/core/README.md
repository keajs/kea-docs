---
sidebar_position: 2
---

import useBaseUrl from '@docusaurus/useBaseUrl'

# Core

## How does Kea work?

<a href={useBaseUrl('img/introduction/how-does-kea-work.png')}>
  <img
    alt="Redux Devtools with Inline Paths"
    src={useBaseUrl('img/introduction/how-does-kea-work.png')}
    style={{ maxWidth: 715, width: '100%' }}
  />
</a>
<br />
<br />

Kea is built on top of Redux and leverages its underlying functional principles. Here's the typical flow:

- Every operation in your app starts with an **[action](/docs/core/actions)** (_increment counter_).
- These actions update **[reducers](/docs/core/reducers)** (_counter_) that hold the actual data.
- This data is stored in a global **state**, which is managed by Redux.
- You fetch **values** (_counter is 1_) through **[selectors](/docs/core/selectors)** (_find the counter in the state_) from this state.
- Actions may also trigger **[listeners](/docs/core/listeners)**, which are plain async functions that talk with externals APIs,
  read values or dispatch other actions.
- All related actions, reducers, selectors and listeners are grouped into a **logic** (_counterLogic_).
- React Components pull in values from a logic, and send back actions.
