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
        '/\\*[^\\*]+\\*/': 'gray',
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
        "`[^']+`": 'green',
        'const|function|async|await|true|false|return|throw|new': 'blue',
        '(?<=<\)[a-zA-Z0-9]+(?=[> ])': 'blue',
        '(?<=<\)[a-zA-Z0-9]+$': 'blue',
        '(?<=<\\/)[a-zA-Z0-9]+(?=>)': 'blue',
        '(?<=[^a-zA-Z0-9])[a-zA-Z0-9]+(?==)': 'blue',
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
                            <L>{'            // 🚀 actions that modify its state'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setUsername: (_, { username }) => username,'}</L>
                            <L>{'                downcase: (state) => state.toLoweCase(),'}</L>
                            <L>{'                // 👀 action: (state, payload) => newState'}</L>
                            <L>{'            },'}</L>
                            <L>{'        ],'}</L>
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
                            <L>{'        error: ['}</L>
                            <L>{'            null,'}</L>
                            <L>{'            {'}</L>
                            <L>{'                setUsername: () => null,'}</L>
                            <L>{'                repositoryLoadError: (_, { error }) => error,'}</L>
                            <L>{'                setUsernameFailure: (_, { error }) => error,'}</L>
                            <L>{'                // 🤠 this last action comes from the loaders section below'}</L>
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
                        <L>{'    reducers: { #[logicReducers]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🔨 actions trigger listeners'}</L>
                    {expanded?.logicListeners ? (
                        <>
                            <L>{'    listeners: ({ actions }) => ({ #[logicListeners]#'}</L>
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
                        <L>{'    listeners: { #[logicListeners]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 👨‍👩‍👧‍👦 selectors compute and memoize values'}</L>
                    {expanded?.logicSelectors ? (
                        <>
                            <L>{'    selectors: { #[logicSelectors]#,'}</L>
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
                        <L>{'    selectors: { #[logicSelectors]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 💾 use loaders for data that is loaded from somewhere'}</L>
                    {expanded?.logicLoaders ? (
                        <>
                            <L>{'    loaders: { #[logicLoaders]#,'}</L>
                            <L>{'        // 🔌 install the "kea-loaders" plugin to use'}</L>
                            <L>{'        // 🤠 the following creates two values: "user" and "userLoading"'}</L>
                            <L>{'        // 🙌 and two actions: "setUsernameSuccess" and "setUsernameFailure"'}</L>
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
                            <L>{'                // ✅ return the user to dispatch "setUsernameSuccess" and store it'}</L>
                            <L>{'                return user'}</L>
                            <L>{'            }'}</L>
                            <L>{'        },'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    loaders: { #[logicLoaders]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🌍 change the browser URL when an action is dispatched'}</L>
                    {expanded?.logicActionToUrl ? (
                        <>
                            <L>{'    actionToUrl: { #[logicActionToUrl]#,'}</L>
                            <L>{'        // 🔌 install the "kea-router" plugin to use'}</L>
                            <L>{'        setUsername: ({ username }) => `/${username}`,'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>{'    actionToUrl: { #[logicActionToUrl]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🎯 dispatch an action when the browser URL changes'}</L>
                    {expanded?.logicUrlToAction ? (
                        <>
                            <L>{'    urlToAction: ({ actions }) => ({ #[logicUrlToAction]#,'}</L>
                            <L>{'        // 🔌 install the "kea-router" plugin to use'}</L>
                            <L>{'        "/:username": ({ username }) => actions.setUsername(username),'}</L>
                            <L>{'        "/": () => actions.setUsername("keajs"),'}</L>
                            <L>{'    }),'}</L>
                        </>
                    ) : (
                        <L>{'    urlToAction: { #[logicUrlToAction]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // 🔁 logic lifecycle: afterMount and beforeUnmount'}</L>
                    {expanded?.logicEvents ? (
                        <>
                            <L>{'    events: ({ actions, values, cache }) => ({ #[logicEvents]#,'}</L>
                            <L>{'        afterMount: () => {'}</L>
                            <L>{'            console.log("🏃 starting logic")'}</L>
                            <L>{'            '}</L>
                            <L>
                                {
                                    '            // 👻 set username to its value to trigger the listener and fetch repositories'
                                }
                            </L>
                            <L>{'            // 💡 this is actually not needed because we are also using urlToAction, which dispatches an action after mount'}</L>
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
                        <L>{'    events: { #[logicEvents]# },'}</L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    #[logicMore]# // even more stuff'}</L>
                    {expanded?.logicMore ? (
                        <>
                            <L>{'    '}</L>
                            <L>{'    // 🪟 store values like window.innerWidth in the logic'}</L>
                            {expanded?.logicWindowValues ? (
                                <>
                                    <L>{'    windowValues: { #[logicWindowValues]#,'}</L>
                                    <L>{'        // 🔌 install the "kea-window-values" plugin to use'}</L>
                                    <L>{'        isSmallScreen: (window) => window.innerWidth < 640,'}</L>
                                    <L>{'        isRetina: (window) => window.devicePixelRatio > 2,'}</L>
                                    <L>
                                        {
                                            '        scrollBarWidth: (window) => window.innerWidth - window.body.clientWidth,'
                                        }
                                    </L>
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
                                    <L>{'    sagas: [ #[logicSagas]#,'}</L>
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
                                    <L>{'    thunks: ({ actions }) => ({ #[logicThunks]#,'}</L>
                                    <L>{'        // 🔌 install the "kea-thunk" plugin to use'}</L>
                                    <L>{'        // 🤔 you probably want to use listeners instead'}</L>
                                    <L>{'        // 🦕 because you can\'t use thunks in reducers'}</L>
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
                </>
            ) : (
                <L>{'const logic = kea({ #[logic]# })'}</L>
            )}
            <L>{''}</L>
            <L>{'// ⚛️ and your views in React'}</L>
            {expanded?.component ? (
                <>
                    <L>{'function Component() { #[component]#'}</L>
                    <L>{'    // 🦜 fetch actions and values from Kea with hooks'}</L>
                    <L>{'    const { setUsername, openPage } = useActions(logic)'}</L>
                    <L>{'    const { user, username, isLoading, sortedRepositories, repositoriesForPage, page, pages, error } = useValues(logic)'}</L>
                    <L>{'    '}</L>
                    <L>{'    // 🎨 and then render the component'}</L>
                    <L>{'    return ('}</L>
                    <L>{'        <div className="github-api-scene">'}</L>
                    <L>{'            <div style={{ marginBottom: 20 }}>'}</L>
                    <L>{'                <h3>Search for a GitHub user</h3>'}</L>
                    <L>{'                <input value={username} type="text" onChange={(e) => setUsername(e.target.value)} />'}</L>
                    <L>{'            </div>'}</L>
                    <L>{'            {isLoading ? ('}</L>
                    <L>{'                <div>Loading...</div>'}</L>
                    <L>{'            ) : error ? ('}</L>
                    <L>{'                <div>Error: {error}</div>'}</L>
                    <L>{'            ) : repositoriesForPage.length === 0 ? ('}</L>
                    <L>{'                <div>No repositories found</div>'}</L>
                    <L>{'            ) : ('}</L>
                    <L>{'                <div>'}</L>
                    <L>{'                    <div style={{ marginBottom: 10 }}>'}</L>
                    <L>{'                        Found {sortedRepositories.length} repositories for {user.type.toLowerCase()} <strong>{username}{user?.name ? ` (${user.name})` : \'\'}</strong>'}</L>
                    <L>{'                    </div>'}</L>
                    <L>{'                    {repositoriesForPage.map((repo) => ('}</L>
                    <L>{'                        <div key={repo.id}>'}</L>
                    <L>{'                            <a href={repo.html_url} target="_blank">'}</L>
                    <L>{'                                {repo.full_name}'}</L>
                    <L>{'                            </a>'}</L>
                    <L>{'                            {` - ${repo.stargazers_count} stars, ${repo.forks} forks.`}'}</L>
                    <L>{'                        </div>'}</L>
                    <L>{'                    ))}'}</L>
                    <L>{'                    {pages > 1 ? ('}</L>
                    <L>{'                        <div style={{ marginTop: 20, textAlign: \'center\' }}>'}</L>
                    <L>{'                            <div style={{ marginBottom: 5 }}>'}</L>
                    <L>{'                                Showing page <strong>{page}</strong> out of <strong>{pages}</strong>.'}</L>
                    <L>{'                            </div>'}</L>
                    <L>{'                            <div>'}</L>
                    <L>{'                                <button onClick={() => openPage(page - 1)} disabled={page <= 1}>'}</L>
                    <L>{'                                    « Previous Page'}</L>
                    <L>{'                                </button>{\' \'}'}</L>
                    <L>{'                                <button onClick={() => openPage(page + 1)} disabled={page >= pages}>'}</L>
                    <L>{'                                    Next Page »'}</L>
                    <L>{'                                </button>'}</L>
                    <L>{'                            </div>'}</L>
                    <L>{'                        </div>'}</L>
                    <L>{'                    ) : null}'}</L>
                    <L>{'                </div>'}</L>
                    <L>{'            )}'}</L>
                    <L>{'        </div>'}</L>
                    <L>{'    )'}</L>
                    <L>{'}'}</L>
                </>
            ) : (
                <L>{'function Component() { #[component]# }'}</L>
            )}
        </>
    )
}
