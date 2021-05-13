import React from 'react'

export function Example ({ children, style }) {
  return (
    <div className='example-panel' style={style}>
      <div className="ribbon ribbon-top-right"><span>Live Demo</span></div>
      {children}
    </div>
  )
}
