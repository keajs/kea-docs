import React from 'react'
import { kea, useActions, useValues } from 'kea'

const API_URL = 'https://api.github.com'

const logic = kea({
  actions: () => ({
    setUsername: (username) => ({ username }),
    setRepositories: (repositories) => ({ repositories }),
    setFetchError: (error) => ({ error })
  }),

  reducers: () => ({
    username: ['keajs', {
      setUsername: (_, { username }) => username
    }],
    repositories: [[], {
      setUsername: () => [],
      setRepositories: (_, { repositories }) => repositories
    }],
    isLoading: [false, {
      setUsername: () => true,
      setRepositories: () => false,
      setFetchError: () => false
    }],
    error: [null, {
      setUsername: () => null,
      setFetchError: (_, { error }) => error
    }]
  }),

  listeners: ({ actions }) => ({ // 👈 added { actions }
    setUsername: async ({ username }, breakpoint) => {
      const url = `${API_URL}/users/${username}/repos?per_page=250`

      const response = await window.fetch(url)
      const json = await response.json()

      if (response.status === 200) {
        actions.setRepositories(json)       // 👈
      } else {
        actions.setFetchError(json.message) // 👈
      }
    }
  }),
  events: ({ actions, values }) => ({
    afterMount: () => {
      actions.setUsername(values.username)
    }
  })
})

export function Github () {
  const { username, isLoading, repositories, error } = useValues(logic)
  const { setUsername } = useActions(logic)

  return (
    <div className='example-github-scene'>
      <div style={{marginBottom: 20}}>
        <h1>Search for a github user</h1>
        <input
          value={username}
          type='text'
          onChange={e => setUsername(e.target.value)} />
      </div>
      {isLoading ? (
        <div>
          Loading...
        </div>
      ) : repositories.length > 0 ? (
        <div>
          Found {repositories.length} repositories for user {username}!
          {repositories.map(repo => (
            <div key={repo.id}>
              <a href={repo.html_url} target='_blank'>
                {repo.full_name}
              </a>
              {' - '}
              {repo.stargazers_count} stars, {repo.forks} forks.
            </div>
          ))}
        </div>
      ) : (
        <div>
          {error ? `Error: ${error}` : 'No repositories found'}
        </div>
      )}
    </div>
  )
}
