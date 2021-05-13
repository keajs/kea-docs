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
    return (
        <button className="expand" onClick={() => expand(code)}>
            +
        </button>
    )
}

function Shrink({ code }) {
    const { shrink } = useActions(introCodeLogic)
    return (
        <button className="shrink" onClick={() => shrink(code)}>
            -
        </button>
    )
}

function L({ children }) {
    const { expanded } = useValues(introCodeLogic)

    if (typeof children !== 'string') {
        return children || ''
    }

    const rules = {
        '//.*': 'gray',
        '[a-zA-Z_-]+: \\(': (str) => (
            <span>
                <span style={{ color: 'brown' }}>{str.substring(0, str.length - 2)}</span>
                {' ('}
            </span>
        ),
        '[a-zA-Z_-]+: async': (str) => (
            <span>
                <span style={{ color: 'brown' }}>{str.substring(0, str.length - 5)}</span>
                <span style={{ color: 'blue' }}>{'async'}</span>
            </span>
        ),
        '[a-zA-Z_-]+:': 'purple',
        '"[^"]+"': 'green',
        "'[^']+'": 'green',
        'const|function|async|await': 'blue',
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

    const commentMarginExtra = children.match(/ *\/\//) ? 52 : 20
    const numberOfSpaces = children.replace(/^( *)[^ ]*.*$/, '$1').length
    const style = { marginLeft: numberOfSpaces * 4 + commentMarginExtra, textIndent: -commentMarginExtra }

    return (
        <div className={`code-line`} style={style}>
            {split(children.substring(numberOfSpaces).trim())}
        </div>
    )
}

export function IntroCode() {
    const { expanded } = useValues(introCodeLogic)

    return (
        <>
            <L>{'// 🦜 keep your state in Kea'}</L>
            {expanded?.logic ? (
                <>
                    <L>{'const logic = kea({ #[logic]#'}</L>
                    <L>{'    '}</L>
                    <L>{'    // 🦾 everything starts with an action'}</L>
                    {expanded?.logicActions ? (
                        <>
                            <L>{'    actions: { #[logicActions]#'}</L>
                            <L>{'        // ⛳ some actions are simple'}</L>
                            <L>{'        reset: true,'}</L>
                            <L>{'        capitalize: true,'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 📦 some carry a payload'}</L>
                            <L>{'        setUsername: (username) => ({ username }),'}</L>
                            <L>{'        repositoriesLoaded: (respositories) => ({ respositories }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 🍱 some take multiple args and defaults'}</L>
                            <L>{'        openPage: (page, perPage = 50) => ({ page, perPage }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 😇 all actions must be pure functions'}</L>
                            <L>{'        // 💡 they singal intent: something is about to happen'}</L>
                            <L>{'        // 🚫 they do not call any APIs directly'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    actions: { #[logicActions]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 📦 actions modify values stored in reducers'}</L>
                    {expanded?.logicReducers ? (
                        <>
                            <L>{'    reducers: { #[logicReducers]#'}</L>
                            <L>{'        // 🍭 this is syntactic sugar over standard redux reducers'}</L>
                            <L>{'        username: ['}</L>
                            <L>{'            // 💬 the default username'}</L>
                            <L>{'            "keajs",'}</L>
                            <L>{'            // 👀 actions that modify its state'}</L>
                            <L>{'            {'}</L>
                            <L>{'                // 👀 action: (state, payload) => newState'}</L>
                            <L>{'                setUsername: (_, { username }) => username,'}</L>
                            <L>{'                capitalize: (state) => state.toUpperCase(),'}</L>
                            <L>{'                reset: () => "keajs",'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        repositories: ['}</L>
                            <L>{'            [],'}</L>
                            <L>{'            {'}</L>
                            <L>{'                repositoriesLoaded: (_, { respositories }) => respositories,'}</L>
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
                            <L>{'        // 😇 reducers are pure functions as well'}</L>
                            <L>{'        // 🚫 no API calls or other side effects allowed'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    reducers: { #[logicReducers]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🔨 actions trigger listeners'}</L>
                    {expanded?.logicListeners ? (
                        <>
                            <L>{'    listeners: ({ actions }) => ({ #[logicListeners]#'}</L>
                            <L>{'        // 🎯 called as soon as the "setUsername" action is dispatched'}</L>
                            <L>{'        setUsername: async ({ username }, breakpoint) => {'}</L>
                            <L>{'            // ⏳ delay for 300ms'}</L>
                            <L>{'            // ✂️ break if the action is triggered again while we wait'}</L>
                            <L>{'            // ⛹ this is effectively a built-in debounce'}</L>
                            <L>{'            await breakpoint(300)'}</L>
                            <L>{'            '}</L>
                            <L>{'            // 🌐 make an API call'}</L>
                            <L>{'            const repositories = await api.fetch(username)'}</L>
                            <L>{'            '}</L>
                            <L>
                                {
                                    '            // ✂️ break if "setUsername" dispatched while we were waiting for the API'
                                }
                            </L>
                            <L>{'            // 💡 this avoids saving stale and out-of-order data'}</L>
                            <L>{'            breakpoint()'}</L>
                            <L>{'            '}</L>
                            <L>{'            // 🔨 store the results by dispatching another action'}</L>
                            <L>{'            actions.setRepositories(repositories)'}</L>
                            <L>{'        }'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    listeners: { #[logicListeners]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 👨‍👩‍👧‍👦 combine and memoize values'}</L>
                    <L>{'    selectors: { #[logicSelectors]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // 💾 data that needs to be loaded from somewhere'}</L>
                    <L>{'    loaders: { #[logicLoaders]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // 🌍 location.href change triggers an action'}</L>
                    <L>{'    urlToAction: { #[logicUrlToAction]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // 🎯 change location.href when an action fires'}</L>
                    <L>{'    actionToUrl: { #[logicActionToUrl]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'    // ☀️ lifecycles: afterMount and beforeUnmount'}</L>
                    <L>{'    events: { #[logicEvents]# },'}</L>
                    <L>{'    '}</L>
                    <L>{'})'}</L>
                </>
            ) : (
                <L>{'const logic = kea({ #[logic]# })'}</L>
            )}
            <L>{''}</L>
            <L>{'// ⚛️ and your views in React'}</L>
            <L>{'function Component() { #[component]# }'}</L>
        </>
    )
}
