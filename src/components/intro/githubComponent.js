import * as React from 'react'
import { useActions, useValues } from 'kea'
import { githubLogic } from './githubLogic'

export function Github() {
    const { user, username, isLoading, sortedRepositories, repositoriesForPage, page, pages, error } = useValues(
        githubLogic
    )
    const { setUsername, openPage } = useActions(githubLogic)

    return (
        <div className="example-github-scene">
            <div style={{ marginBottom: 20 }}>
                <h3>Search for a GitHub user</h3>
                <input value={username} type="text" onChange={(e) => setUsername(e.target.value)} />
            </div>
            {isLoading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : repositoriesForPage.length === 0 ? (
                <div>No repositories found</div>
            ) : (
                <div>
                    <div style={{ marginBottom: 10 }}>
                        Found {sortedRepositories.length} repositories for {user.type.toLowerCase()}{' '}
                        <strong>
                            {username}
                            {user?.name ? ` (${user.name})` : ''}
                        </strong>
                    </div>
                    {repositoriesForPage.map((repo) => (
                        <div key={repo.id}>
                            <a href={repo.html_url} target="_blank">
                                {repo.full_name}
                            </a>
                            {` - ${repo.stargazers_count} stars, ${repo.forks} forks.`}
                        </div>
                    ))}
                    {pages > 1 ? (
                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <div style={{ marginBottom: 5 }}>
                                Showing page <strong>{page}</strong> out of <strong>{pages}</strong>.
                            </div>
                            <div>
                                <button onClick={() => openPage(page - 1)} disabled={page <= 1} className='button button--primary button--sm'>
                                    &laquo; Previous Page
                                </button>{' '}
                                <button onClick={() => openPage(page + 1)} disabled={page >= pages} className='button button--primary button--sm'>
                                    Next Page &raquo;
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
