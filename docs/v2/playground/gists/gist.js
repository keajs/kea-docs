import React, { useState } from 'react'
import ReactGist from 'react-gist'

export default function Gist({ username, id }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <>
            <p>
                {' '}
                <a
                    href="#"
                    onClick={(e) => {
                        setExpanded(!expanded)
                        e.preventDefault()
                    }}
                >
                    {expanded ? 'Collapse Code Block' : 'Expand Code block'}
                </a>
                {' | '}
                <a href={`https://gist.github.com/${username}/${id}`} target="_blank">
                    View in GitHub
                </a>
            </p>
            <div style={{ height: expanded ? 'auto' : 300, overflow: 'hidden', position: 'relative' }}>
                {!expanded ? (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: 2,
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,1) 100%',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            cursor: 'pointer',
                        }}
                        onClick={() => setExpanded(true)}
                    />
                ) : null}
                <div style={{ zIndex: 3 }}>
                    <ReactGist id={id} />
                </div>
            </div>
        </>
    )
}
