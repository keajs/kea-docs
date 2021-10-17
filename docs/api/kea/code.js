import React from 'react'
import { kea, useActions, useValues } from 'kea'
import { router } from 'kea-router'

const introCodeLogic = kea({
    actions: {
        expand: (code) => ({ code }),
        shrink: (code) => ({ code }),
        setExpanded: (expanded) => ({ expanded }),
    },
    reducers: {
        expanded: [
            {
                // component: true,
            },
            {
                expand: (state, { code }) => ({ ...state, [code]: true }),
                shrink: (state, { code }) => {
                    const { [code]: _discard, ...rest } = state
                    return rest
                },
                setExpanded: (_, { expanded }) => expanded,
            },
        ],
    },
    actionToUrl: ({ values }) => ({
        expand: () => [
            router.values.location.pathname,
            router.values.searchParams,
            { expanded: Object.keys(values.expanded).join(',') },
        ],
        shrink: () => [
            router.values.location.pathname,
            router.values.searchParams,
            { expanded: Object.keys(values.expanded).join(',') },
        ],
    }),
    urlToAction: ({ actions, values }) => ({
        '/docs/api/kea': (_, __, { expanded }) => {
            if (typeof expanded !== 'undefined' && Object.keys(values.expanded).join(',') !== expanded) {
                actions.setExpanded(Object.fromEntries(expanded.split(',').map((e) => [e, true])))
            }
        },
    }),
})

function Expand({ code }) {
    const { expand } = useActions(introCodeLogic)
    return (
        <button className="expand" onClick={() => expand(code)} data-attr={`homepage-expand/${code}`}>
            +
        </button>
    )
}

function Shrink({ code }) {
    const { shrink } = useActions(introCodeLogic)
    return (
        <button className="shrink" onClick={() => shrink(code)} data-attr={`homepage-expand/${code}`}>
            −
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
        '/\\*[^\\*]+\\*/': 'gray',
        '[a-zA-Z_-]+: \\(': (str) => (
            <span>
                <span style={{ color: 'var(--code-color-brown)' }}>{str.substring(0, str.length - 2)}</span>
                {' ('}
            </span>
        ),
        '[a-zA-Z_-]+: async': (str) => (
            <span>
                <span style={{ color: 'var(--code-color-brown)' }}>{str.substring(0, str.length - 5)}</span>
                <span style={{ color: 'var(--code-color-blue)' }}>{'async'}</span>
            </span>
        ),
        '[a-zA-Z_-]+:': 'purple',
        '"[^"]+"': 'green',
        "'[^']+'": 'green',
        "`[^']+`": 'green',
        'const|function|async|await|true|false|return|throw|new': 'blue',
        '(?<=<)[a-zA-Z0-9_]+(?=[> ])': 'blue',
        '(?<=<)[a-zA-Z0-9_]+$': 'blue',
        '(?<=</)[a-zA-Z0-9_]+(?=>)': 'blue',
        '(?<=[^a-zA-Z0-9_])[a-zA-Z0-9_]+(?==)': 'blue',
        '(?<=[a-zA-Z0-9_]\\??\\.)[a-zA-Z0-9_]+(?=\\()': 'brown',
        '(?<=[a-zA-Z0-9_]\\??\\.)[a-zA-Z0-9_]+(?!=\\()': 'purple',
        '[{}()]': 'black',
        '[0-9]': 'blue',
        '#[[a-zA-Z]+]#': (str) => {
            const code = str.substring(2, str.length - 2)
            return expanded[code] ? <Shrink code={code} /> : <Expand code={code} />
        },
        'kea|useActions|useValues': 'green',
        '[a-zA-Z_-]+': 'black',
    }

    function split(element, recursion = 0, counter = 1) {
        if (typeof element !== 'string' || recursion > 3 || element.trim() === '') {
            return element
        }
        for (const [rule, colorOrFunction] of Object.entries(rules)) {
            let parts = []
            try {
                parts = element.split(new RegExp(`(${rule})`))
            } catch (e) {
                // Safari does not support regexp lookbehind
                // https://stackoverflow.com/questions/51568821/works-in-chrome-but-breaks-in-safari-invalid-regular-expression-invalid-group
                // https://caniuse.com/js-regexp-lookbehind
            }
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
                                <span key={`${newCounter}`} style={{ color: `var(--code-color-${colorOrFunction})` }}>
                                    {splitPart}
                                </span>
                            )
                        }
                    })
                    .flat(Infinity)
        }
        return element
    }

    const commentMarginExtra = children.match(/ *\/\//) ? 5.7 * 0.6 : 2 * 0.6
    const numberOfSpaces = children.replace(/^( *)[^ ]*.*$/, '$1').length / 2
    const style = {
        marginLeft: `${numberOfSpaces * 0.6 + commentMarginExtra}em`,
        textIndent: `${-commentMarginExtra}em`,
    }

    return (
        <div className={`code-line`} style={style}>
            {split(children.substring(numberOfSpaces).trim())}
        </div>
    )
}

export function IntroCode() {
    const { expanded } = useValues(introCodeLogic)

    return (
        <code className="example-panel home-intro-code">
            <L>{'// 🦜 '}</L>
            <L>{'const githubSearchLogic = kea({ #[logic]#'}</L>
            <L>{'    #[core]# // core concepts'}</L>
            {expanded?.core ? (
                <>
                    <L>{'    '}</L>
                    <L>{'    // 🦾 everything starts with an action'}</L>
                    {expanded?.actions ? (
                        <>
                            <L>{'    actions: { #[actions]#'}</L>
                            <L>{'        // ⛳ some actions are simple'}</L>
                            <L>{'        downcase: true,'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 📦 some carry a payload'}</L>
                            <L>{'        setUsername: (username) => ({ username }),'}</L>
                            <L>{'        repositoriesLoaded: (repositories) => ({ repositories }),'}</L>
                            <L>{'        repositoryLoadError: (error) => ({ error }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 🍱 some take multiple args and defaults'}</L>
                            <L>{'        openPage: (page, perPage = 10) => ({ page, perPage }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 😇 all actions must be pure functions'}</L>
                            <L>{'        // 💡 they singal intent: something is about to happen'}</L>
                            <L>{'        // 🚫 they do not call any APIs directly'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    actions: { #[actions]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 📦 actions modify values stored in reducers'}</L>
                    {expanded?.reducers ? (
                        <>
                            <L>{'    reducers: { #[reducers]#'}</L>
                            <L>{'        // 🍭 this is syntactic sugar over standard redux reducers'}</L>
                            <L>{'        username: ['}</L>
                            <L>{'            // 💬 the default username'}</L>
                            <L>{'            "keajs",'}</L>
                            <L>{'            // 🚀 actions that modify its state'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setUsername: (_, { username }) => username,'}</L>
                            <L>{'                downcase: (state) => state.toLoweCase(),'}</L>
                            <L>{'                // 👀 action: (state, payload) => newState'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        // 🍭 reducers can be simple'}</L>
                            <L>{'        repositories: ['}</L>
                            <L>{'            [],'}</L>
                            <L>{'            {'}</L>
                            <L>{'                repositoriesLoaded: (_, { repositories }) => repositories,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        repositoriesLoading: ['}</L>
                            <L>{'            false,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setUsername: () => true,'}</L>
                            <L>{'                repositoriesLoaded: () => false,'}</L>
                            <L>{'                repositoryLoadError: () => false,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        // 🍭 ... or complicated with many modifiers'}</L>
                            <L>{'        error: ['}</L>
                            <L>{'            null,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setUsername: () => null,'}</L>
                            <L>{'                repositoryLoadError: (_, { error }) => error,'}</L>
                            <L>{'                setUsernameFailure: (_, { error }) => error,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        page: ['}</L>
                            <L>{'            1,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                openPage: (_, { page }) => page,'}</L>
                            <L>{'                repositoriesLoaded: () => 1,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        perPage: ['}</L>
                            <L>{'            10,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                openPage: (_, { perPage }) => perPage,'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        // 😇 reducers are pure functions as well'}</L>
                            <L>{'        // 🚫 no API calls or other side effects allowed'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    reducers: { #[reducers]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🔨 actions trigger listeners'}</L>
                    {expanded?.listeners ? (
                        <>
                            <L>{'    listeners: ({ actions }) => ({ #[listeners]#'}</L>
                            <L>{'        // 🎯 called as soon as the "openPage" action fires'}</L>
                            <L>{'        openPage: ({ page }) => {'}</L>
                            <L>{'            console.log("page changed", { page })'}</L>
                            <L>{'        },'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 👜 fetch repositories when the "setUsername" action fires'}</L>
                            <L>{'        setUsername: async ({ username }, breakpoint) => {'}</L>
                            <L>{'            // ⏳ delay for 300ms'}</L>
                            <L>{'            // 💔 break if the action is triggered again while we wait'}</L>
                            <L>{'            // ⛹ this is effectively a built-in debounce'}</L>
                            <L>{'            await breakpoint(300)'}</L>
                            <L>{'            '}</L>
                            <L>{'            // 🌐 make an API call'}</L>
                            <L>{'            const repositories = await api.getRepositories(username)'}</L>
                            <L>{'            '}</L>
                            <L>
                                {
                                    '            // 💔 break if "setUsername" was called again while we were waiting for the API'
                                }
                            </L>
                            <L>{'            // 💡 this avoids saving stale and out-of-order data'}</L>
                            <L>{'            breakpoint()'}</L>
                            <L>{'            '}</L>
                            <L>{'            // 🔨 store the results by calling another action'}</L>
                            <L>{'            if (repositories?.error) {'}</L>
                            <L>{'                actions.repositoryLoadError(repositories.error)'}</L>
                            <L>{'            } else {'}</L>
                            <L>{'                actions.repositoriesLoaded(repositories)'}</L>
                            <L>{'            }'}</L>
                            <L>{'        },'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    listeners: { #[listeners]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 👨‍👩‍👧‍👦 selectors compute and memoize values'}</L>
                    {expanded?.selectors ? (
                        <>
                            <L>{'    selectors: { #[selectors]#'}</L>
                            <L>{'        // ⭐ sort repositories by star count'}</L>
                            <L>{'        sortedRepositories: ['}</L>
                            <L>{'            (s) => [s.repositories],'}</L>
                            <L>
                                {
                                    '            (repositories) => repositories.sort((a, b) => b.stargazers_count - a.stargazers_count),'
                                }
                            </L>
                            <L>{'        ],'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 👁️ only show repositories for the active page'}</L>
                            <L>{'        repositoriesForPage: ['}</L>
                            <L>{'            (s) => [s.sortedRepositories, s.page, s.perPage],'}</L>
                            <L>{'            (repos, page, perPage) => {'}</L>
                            <L>{'                return repos.slice(perPage * (page - 1), perPage * page)'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 📄 number of pages'}</L>
                            <L>{'        pages: ['}</L>
                            <L>{'            (s) => [s.sortedRepositories, s.perPage],'}</L>
                            <L>{'            (repos, perPage) => Math.ceil(repos.length / perPage),'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        '}</L>
                            <L>{'        // 🚧 is anything loading'}</L>
                            <L>{'        isLoading: ['}</L>
                            <L>{'            (s) => [s.repositoriesLoading, s.userLoading],'}</L>
                            <L>
                                {
                                    '            (repositoriesLoading, userLoading) => repositoriesLoading || userLoading,'
                                }
                            </L>
                            <L>{'        ],'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    selectors: { #[selectors]# },'}</L>
                    )}
                </>
            ) : null}

            <L>{'    '}</L>
            <L>{'    #[additional]# // additional concepts'}</L>
            {expanded?.additional ? (
                <>
                    <L>{'    '}</L>
                    <L>{'    // 🔁 lifecycle events: afterMount and beforeUnmount'}</L>
                    {expanded?.events ? (
                        <>
                            <L>{'    events: ({ actions, values, cache }) => ({ #[events]#'}</L>
                            <L>{'        afterMount: () => {'}</L>
                            <L>{'            console.log("🏃 starting logic")'}</L>
                            <L>{'            '}</L>
                            <L>
                                {
                                    '            // 👻 set username to its value to trigger the listener and fetch repositories'
                                }
                            </L>
                            <L>
                                {
                                    '            // 💡 this is actually not needed because we are also using urlToAction, which dispatches an action after mount'
                                }
                            </L>
                            <L>{'            actions.setUsername(values.username)'}</L>
                            <L>{'            '}</L>
                            <L>{'            // ⏰ use "cache" for temporary event listeners, timeouts, etc'}</L>
                            <L>{'            cache.interval = window.setInterval(() => {'}</L>
                            <L>{'                console.log("🏓 ping? pong!")'}</L>
                            <L>{'            }, 1000)'}</L>
                            <L>{'        },'}</L>
                            <L>{'        beforeUnmount: () => {'}</L>
                            <L>{'            console.log("👋 bye bye")'}</L>
                            <L>{'            window.clearInterval(cache.interval)'}</L>
                            <L>{'        },'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    events: { #[events]# },'}</L>
                    )}
                </>
            ) : null}

            <L>{'    '}</L>
            <L>{'    #[more]# // connections, inheritance and extensions'}</L>
            {expanded?.more ? (
                <>
                    <L>{'    '}</L>
                    <L>{'    // 🔗 connect to actions and values from another logic'}</L>
                    {expanded?.logicConnect ? (
                        <>
                            <L>{'    connect: { #[logicConnect]#'}</L>
                            <L>{'        // 🏞️ these will act as local actions/values'}</L>
                            <L>{'        actions: ['}</L>
                            <L>{'            // fetch from another logic'}</L>
                            <L>{'            otherLogic, ["submitForm", "resetForm as reset"],'}</L>
                            <L>{'            // or "connect" regular redux actions'}</L>
                            <L>{'            { edit: (name) => ({ type: "edit", payload: { name } }) }, ["edit"],'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        values: ['}</L>
                            <L>{'            // fetch from another logic'}</L>
                            <L>{'            otherLogic, ["formState as form", "isSubmitting", "* as all"],'}</L>
                            <L>{'            // or from anywhere in redux'}</L>
                            <L>{'            state => state.regular.redux.selector, ["value"],'}</L>
                            <L>{'        ],'}</L>
                            <L>{'        logic: [,'}</L>
                            <L>{'            // these will be mounted and unmounted together with this logic'}</L>
                            <L>{'            profileLogic,'}</L>
                            <L>{'        ],'}</L>
                            <L>{'    },'}</L>
                            <L>{'    connect: (props) => ({'}</L>
                            <L>{'        // 💡 connect always passes on props, but you can also override them'}</L>
                            <L>{'        actions: [otherLogic({ ...props, team: 2 }), ["submitForm"]],'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    connect: { #[logicConnect]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 👶 inherit actions and values from another logic'}</L>
                    {expanded?.logicInherit ? (
                        <>
                            <L>{'    inherit: [ #[logicInherit]#'}</L>
                            <L>{'        otherLogic,'}</L>
                            <L>
                                {
                                    '        // 👷 build this "logic" on top of a copy of "otherLogic", inheriting all its actions, values, listeners, etc'
                                }
                            </L>
                            <L>{'    ],'}</L>
                        </>
                    ) : (
                        <L>{'    inherit: [ #[logicInherit]# ],'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // ➕ extend with other input after building'}</L>
                    {expanded?.logicExtend ? (
                        <>
                            <L>{'    extend: [ #[logicExtend]#'}</L>
                            <L>{'        {'}</L>
                            <L>
                                {
                                    '            // 🧑‍🏭 add even more actions, reducers, etc. This is mostly useful in plugins.'
                                }
                            </L>
                            <L>{'            actions: { doSomething: true, },'}</L>
                            <L>{'            reducers: {},'}</L>
                            <L>{'        },'}</L>
                            <L>{'    ],'}</L>
                        </>
                    ) : (
                        <L>{'    extend: [ #[logicExtend]# ],'}</L>
                    )}
                </>
            ) : null}

            <L>{'    '}</L>
            <L>{'    #[plugins]# // plugins'}</L>
            {expanded?.plugins ? (
                <>
                    <L>{'    '}</L>
                    <L>{'    // 💾 kea-loaders: use loaders to load data from APIs'}</L>
                    {expanded?.logicLoaders ? (
                        <>
                            <L>{'    loaders: { #[logicLoaders]#'}</L>
                            <L>{'        // 🔌 install the "kea-loaders" plugin to use'}</L>
                            <L>{'        // 🤠 the following creates two values: "user" and "userLoading"'}</L>
                            <L>
                                {
                                    '        // 🙌 and three actions: "setUsername", "setUsernameSuccess" and "setUsernameFailure"'
                                }
                            </L>
                            <L>{'        user: {'}</L>
                            <L>{'            setUsername: async ({ username }, breakpoint) => {'}</L>
                            <L>{'                // ⛹ debounce for 300ms, just like in the listener'}</L>
                            <L>{'                await breakpoint(300)'}</L>
                            <L>{'                // 👤 fetch the user'}</L>
                            <L>{'                const user = await api.getUser(username)'}</L>
                            <L>{'                // 💣 all uncaught errors dispatch "setUsernameFailure"'}</L>
                            <L>{'                if (user?.error) {'}</L>
                            <L>{'                    throw new Error(user.error)'}</L>
                            <L>{'                }'}</L>
                            <L>{'                // ✅ return the user in the loader'}</L>
                            <L>
                                {
                                    '                // 🎯 this dispatches "setUsernameSuccess" and sets the "user" reducer\'s value'
                                }
                            </L>
                            <L>{'                return user'}</L>
                            <L>{'            },'}</L>

                            <L>
                                {
                                    '            // 💡 tip: use a listener for "setUsernameSuccess" to run additional code'
                                }
                            </L>
                            <L>{'        },'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    loaders: { #[logicLoaders]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🎯 kea-router: dispatch an action when the browser URL changes'}</L>
                    {expanded?.logicUrlToAction ? (
                        <>
                            <L>{'    urlToAction: ({ actions }) => ({ #[logicUrlToAction]#'}</L>
                            <L>{'        // 🔌 install the "kea-router" plugin to use'}</L>
                            <L>{'        "/:username": ({ username }) => actions.setUsername(username),'}</L>
                            <L>{'        "/": () => actions.setUsername("keajs"),'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    urlToAction: { #[logicUrlToAction]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🌍 kea-router: change the browser URL when an action is dispatched'}</L>
                    {expanded?.logicActionToUrl ? (
                        <>
                            <L>{'    actionToUrl: { #[logicActionToUrl]#'}</L>
                            <L>{'        // 🔌 install the "kea-router" plugin to use'}</L>
                            <L>{'        setUsername: ({ username }) => `/${username}`,'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    actionToUrl: { #[logicActionToUrl]# },'}</L>
                    )}

                    <L>{'    '}</L>
                    <L>{'    // 🪟 kea-window-values: store values like window.innerWidth in the logic'}</L>
                    {expanded?.logicWindowValues ? (
                        <>
                            <L>{'    windowValues: { #[logicWindowValues]#'}</L>
                            <L>{'        // 🔌 install the "kea-window-values" plugin to use'}</L>
                            <L>{'        isSmallScreen: (window) => window.innerWidth < 640,'}</L>
                            <L>{'        isRetina: (window) => window.devicePixelRatio > 2,'}</L>
                            <L>{'        scrollBarWidth: (window) => window.innerWidth - window.body.clientWidth,'}</L>
                            <L>{"        // 🚨 this obviously won't work with server side rendering"}</L>
                            <L>{'        // 💅 you should prefer CSS media queries if you need SSR'}</L>
                            <L>{'        // 🥊 this is perfect for full-screen client-side apps though'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    windowValues: { #[logicWindowValues]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🌅 kea-saga: alternative side-effects via redux-saga'}</L>
                    {expanded?.logicSagas ? (
                        <>
                            <L>{'    sagas: [ #[logicSagas]#'}</L>
                            <L>{'        function * () { /* sagas to start with the logic */ },'}</L>
                            <L>{'    ],'}</L>
                            <L>{'    // 🔌 install the "kea-saga" plugin to use'}</L>
                            <L>{'    start: function * () { /* run this on mount */ },'}</L>
                            <L>{'    stop: function * () { /* run this on unmount */ },'}</L>
                            <L>{'    takeEvery: () => ({ setUsername: function * () { ... } }),'}</L>
                            <L>{'    takeLatest: () => ({ setUsername: function * () { ... } }),'}</L>
                            <L>{'    workers: { /* shared code */ },'}</L>
                        </>
                    ) : (
                        <L>{'    sagas: [ #[logicSagas]# ],'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🪵 kea-thunk: alternative side-effects via redux-thunk'}</L>
                    {expanded?.logicThunks ? (
                        <>
                            <L>{'    thunks: ({ actions }) => ({ #[logicThunks]#'}</L>
                            <L>{'        // 🔌 install the "kea-thunk" plugin to use'}</L>
                            <L>{'        // 🤔 you probably want to use listeners instead'}</L>
                            <L>{"        // 🦕 because you can't use thunks in reducers"}</L>
                            <L>{'        fetchRepositories: ({ username }) => {,'}</L>
                            <L>{'            const repositories = await api.getRepositories(username)'}</L>
                            <L>{'            actions.setRepositories(repositories)'}</L>
                            <L>{'        },'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    thunks: { #[logicThunks]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{"    // 💯 don't see what you need? write your own plugin"}</L>
                    <L>{'    youOwnPlugin: { /* go for it */ },'}</L>
                </>
            ) : null}

            <L>{'})'}</L>
        </code>
    )
}
