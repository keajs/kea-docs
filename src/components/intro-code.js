import React from 'react'
import { kea, useActions, useValues } from 'kea'

const introCodeLogic = kea({
    actions: {
        expand: (code) => ({ code }),
        shrink: (code) => ({ code }),
    },
    reducers: {
        expanded: [
            {},
            {
                expand: (state, { code }) => ({ ...state, [code]: true }),
                shrink: (state, { code }) => {
                    const { [code]: _discard, ...rest } = state
                    return rest
                },
            },
        ],
    },
})

function Expand({ code }) {
    const { expand } = useActions(introCodeLogic)
    return <button className='expand' onClick={() => expand(code)}>+</button>
}

function Shrink({ code }) {
    const { shrink } = useActions(introCodeLogic)
    return <button className='shrink' onClick={() => shrink(code)}>-</button>
}

function L({ children }) {
    const { expanded } = useValues(introCodeLogic)

    if (typeof children !== 'string') {
        return children
    }

    const rules = {
        '//.*': 'gray',
        '[a-zA-Z_-]+: \\(': (str) => (
            <span>
                <span style={{ color: 'brown' }}>{str.substring(0, str.length - 2)}</span>
                {' ('}
            </span>
        ),
        '[a-zA-Z_-]+:': 'purple',
        '"[^"]+"': 'green',
        "'[^']+'": 'green',
        'const|function': 'blue',
        '[{}()]': 'black',
        '[0-9]': 'blue',
        '#[[a-zA-Z]+]#': (str) => {
            const code = str.substring(2, str.length - 2)
            return expanded[code] ? <Shrink code={code} /> : <Expand code={code} />
        },

        kea: 'green',
        '[a-zA-Z_-]+': 'black',
    }

    function split(element, recursion = 0, counter = 1) {
        if (typeof element !== 'string' || recursion > 3 || element.trim() === '') {
            return element
        }
        for (const [rule, colorOrFunction] of Object.entries(rules)) {
            const parts = element.split(new RegExp(`(${rule})`))
            if (parts.length > 1)
                return parts
                    .map((splitPart, index) => {
                        const newCounter = counter * 100 + index
                        if (index % 2 === 0) {
                            return split(splitPart, recursion + 1, newCounter)
                        } else {
                            if (typeof colorOrFunction === 'function') {
                                return <span key={`${newCounter}`}>{colorOrFunction(splitPart)}</span>
                            }
                            return (
                                <span key={`${newCounter}`} style={{ color: colorOrFunction }}>
                                    {splitPart}
                                </span>
                            )
                        }
                    })
                    .flat(Infinity)
        }
        return element
    }

    return <div className={`code-line`}>{split(children)}</div>
}

export function IntroCode() {
    const { expanded } = useValues(introCodeLogic)

    return (
        <>
            <L>{'// keep your state in Kea'}</L>
            {expanded?.logic ? (
                <>
                    <L>{'const logic = kea({ #[logic]#'}</L>
                    <L>{'    '}</L>
                    <L>{'    // everything starts with an action'}</L>
                    {expanded?.logicActions ? (
                        <>
                            <L>{'    actions: { #[logicActions]#'}</L>
                            <L>{'        // some actions are simple'}</L>
                            <L>{'        reset: true,'}</L>
                            <L>{'        capitalize: true,'}</L>
                            <L>{'        '}</L>
                            <L>{'        // some carry a payload'}</L>
                            <L>{'        setUsername: (username) => ({ username }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // some take multiple args and defaults'}</L>
                            <L>{'        openPage: (page, perPage = 50) => ({ page, perPage }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // actions do not modify data nor call any API.'}</L>
                            <L>{'        // they are pure functions'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    actions: { #[logicActions]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // the payload of an action can be stored in a reducer'}</L>
                    {expanded?.logicReducers ? (
                        <>
                            <L>{'    reducers: { #[logicReducers]#'}</L>
                            <L>{'        // syntactic sugar over standard redux reducers'}</L>
                            <L>{'        username: ['}</L>
                            <L>{'            "keajs", // the default value'}</L>
                            <L>{'            {'}</L>
                            <L>{'                // update the value when any of these actions is dispatched'}</L>
                            <L>{'                // actionName: (state, payload) => newState'}</L>
                            <L>{'                setUsername: (_, { username }) => username,'}</L>
                            <L>{'                capitalize: (state) => state.toUpperCase(),'}</L>
                            <L>{'                reset: () => "keajs",'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        page: ['}</L>
                            <L>{'            1,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setPage: (_, { page }) => page,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        perPage: ['}</L>
                            <L>{'            50,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setPage: (_, { perPage }) => perPage,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        // reducers are pure functions as well'}</L>
                            <L>{'        // you may not dispatch other actions nor call any API in them'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    reducers: { #[logicReducers]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // combine and memoize values'}</L>
                    <L>{'    selectors: { #[logicSelectors]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // run random javascript on actions'}</L>
                    <L>{'    listeners: { #[logicListeners]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // data that needs to be loaded from somewhere'}</L>
                    <L>{'    loaders: { #[logicLoaders]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // location.href change triggers an action'}</L>
                    <L>{'    urlToAction: { #[logicUrlToAction]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // change location.href when an action fires'}</L>
                    <L>{'    actionToUrl: { #[logicActionToUrl]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // lifecycles: afterMount and beforeUnmount'}</L>
                    <L>{'    events: { #[logicEvents]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'})'}</L>
                </>
            ) : (
                <L>{'const logic = kea({ #[logic]# })'}</L>
            )}
            <L>{''}</L>
            <L>{'// and your views in React'}</L>
            <L>{'function Component() { #[component]# }'}</L>
        </>
    )
}
