---
slug: kea-test-utils
title: "Live-Replay Logic Testing"
author: Marius Andra
author_title: Kea Core Team, Software Engineer at PostHog
author_url: https://github.com/mariusandra
author_image_url: https://avatars1.githubusercontent.com/u/53387?v=4
tags: [kea, opinion, data-first]
---

Big news, **we have a brand new logic testing framework!**

Read all about it in the updated [Testing guide](/docs/guide/testing)!

Here's a teaser:

```tsx
import { expectLogic } from 'kea-test-utils'

it('setting search query loads remote items', async () => {
    await expectLogic(logic, () => {
        logic.actions.setSearchQuery('event')
    })
        .toDispatchActions(['setSearchQuery', 'loadRemoteItems'])
        .toMatchValues({
            searchQuery: 'event',
            remoteItems: expect.objectContaining({
                count: 56, // old values from initial load
            }),
            remoteItemsLoading: true,
        })
        .toDispatchActions(['loadRemoteItemsSuccess'])
        .toMatchValues({
            searchQuery: 'event',
            remoteItems: expect.objectContaining({
                count: 3, // got new results
                results: expect.arrayContaining([expect.objectContaining({ name: 'event1' })]),
            }),
            remoteItemsLoading: false,
        })
})
```

Oh, and Kea 2.5 is out as well, featuring `logic.isMounted()` and a bunch of fixes from the 2.4 series.
