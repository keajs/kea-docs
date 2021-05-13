const API_URL = 'https://api.github.com'

const repoCache = new Map()
const usersCache = new Map()

export const api = {
    getUser: async function (user) {
        if (!usersCache.has(user)) {
            const url = `${API_URL}/users/${user}`
            const response = await window.fetch(url)
            const json = await response.json()
            usersCache.set(user, response.status === 200 ? json : { error: json.message })
        }
        return usersCache.get(user) || null
    },
    getRepositories: async function (user) {
        if (!repoCache.has(user)) {
            const url = `${API_URL}/users/${user}/repos?per_page=250`
            const response = await window.fetch(url)
            const json = await response.json()
            repoCache.set(user, response.status === 200 ? json : { error: json.message })
        }
        return repoCache.get(user) || []
    },
}
