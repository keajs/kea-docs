import React, { useState } from 'react'

export function Toggle ({ children }) {
  const [visible, setVisible] = useState(false)

  if (!visible) {
    return (
      <div style={{ textAlign: 'center', marginRight: 80 }}>
        <br />
        <p>This example is halted to show the <code>afterMount</code> effect.</p>
        <button onClick={() => setVisible(true)} className='button button--primary'>Click here to load the example</button>
        <br /><br />
      </div>
    )
  }

  return children
}