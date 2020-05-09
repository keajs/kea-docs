import React, { useState } from 'react'

export function Github () {
  const [username, setUsername] = useState("keajs")

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