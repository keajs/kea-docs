import { kea } from 'kea'
import { api } from './githubApi'

export const githubLogic = kea({
    actions: {
        downcase: true,
        setUsername: (username) => ({ username }),
        repositoriesLoaded: (repositories) => ({ repositories }),
        repositoryLoadError: (error) => ({ error }),
        openPage: (page, perPage = 10) => ({ page, perPage }),
    },
    reducers: {
        username: [
            'keajs',
            {
                setUsername: (_, { username }) => username,
                downcase: (state) => state.toLoweCase(),
            },
        ],
        repositories: [
            [],
            {
                repositoriesLoaded: (_, { repositories }) => repositories,
            },
        ],
        repositoriesLoading: [
            false,
            {
                setUsername: () => true,
                repositoriesLoaded: () => false,
                repositoryLoadError: () => false,
            },
        ],
        error: [null, { repositoryLoadError: (_, { error }) => error, setUsernameFailure: (_, { error }) => error }],
        page: [
            1,
            {
                openPage: (_, { page }) => page,
                repositoriesLoaded: () => 1,
            },
        ],
        perPage: [
            10,
            {
                openPage: (_, { perPage }) => perPage,
            },
        ],
    },
    listeners: ({ actions }) => ({
        openPage: ({ page }) => {
            console.log('page changed', { page })
        },
        setUsername: async ({ username }, breakpoint) => {
            await breakpoint(300)
            const repositories = await api.getRepositories(username)
            breakpoint()
            if (repositories?.error) {
                actions.repositoryLoadError(repositories.error)
            } else {
                actions.repositoriesLoaded(repositories)
            }
        },
    }),
    selectors: {
        sortedRepositories: [
            (s) => [s.repositories],
            (repositories) => repositories.sort((a, b) => b.stargazers_count - a.stargazers_count),
        ],
        repositoriesForPage: [
            (s) => [s.sortedRepositories, s.page, s.perPage],
            (repos, page, perPage) => {
                return repos.slice(perPage * (page - 1), perPage * page)
            },
        ],
        pages: [(s) => [s.sortedRepositories, s.perPage], (repos, perPage) => Math.ceil(repos.length / perPage)],
        isLoading: [
            (s) => [s.repositoriesLoading, s.userLoading],
            (repositoriesLoading, userLoading) => repositoriesLoading || userLoading,
        ],
    },
    loaders: {
        user: {
            setUsername: async ({ username }, breakpoint) => {
                await breakpoint(300)
                const user = await api.getUser(username)
                if (user?.error) {
                    throw new Error(user.error)
                }
                return user
            },
        },
    },
    // actionToUrl: { setUsername: ({ username }) => `/${username}` },
    // urlToAction: ({ actions }) => ({
    //     '/:username': ({ username }) => actions.setUsername(username),
    //     '/': () => actions.setUsername('keajs'),
    // }),
    events: ({ actions, values, cache }) => ({
        afterMount: () => {
            console.log('🏃 starting logic')
            actions.setUsername(values.username)
            cache.interval = window.setInterval(() => {
                console.log('🏓 ping? pong!')
            }, 1000)
        },
        beforeUnmount: () => {
            console.log('👋 bye bye')
            window.clearInterval(cache.interval)
        },
    }),
})
