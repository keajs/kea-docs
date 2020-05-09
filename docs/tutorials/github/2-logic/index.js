import React from 'react'
import { kea, useActions, useValues } from 'kea'

const logic = kea({
  actions: () => ({
    setUsername: (username) => ({ username })
  }),

  reducers: ({ actions }) => ({
    username: ['keajs', {
      setUsername: (_, payload) => payload.username
    }]
  })
})

export function Github () {
  const { username } = useValues(logic)
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
      <div>
        Repos will come here for user <strong>{username}</strong>
      </div>
    </div>
  )
}