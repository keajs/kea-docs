---
id: react
title: Using with React
sidebar_label: Using with React
---

* useActions
* useValues
* useMountedLogic
* logic(Component)
* connect

...

```jsx
function SuperCounter () {
    const { increment } = useActions(logic)
    const { counter } = useValues(logic)

    return (
        <div>
            Counter: {counter}<br/>
            <button onClick={() => increment(100)}>Add 100 😕</button>
            <button onClick={() => increment(999)}>Add 999 🤩</button>
        </div>
    )
}
```

