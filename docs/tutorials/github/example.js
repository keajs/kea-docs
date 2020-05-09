import React from 'react'

export function Example ({ children }) {
  return (
    <div className='example-panel'>
      <div className="ribbon ribbon-top-right"><span>Live Demo</span></div>
      {children}
    </div>
  )
}
