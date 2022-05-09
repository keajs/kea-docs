import './Tutorials.scss'
import Link from '@docusaurus/Link'
import React from 'react'
import { Thumbnail } from '../../../img/Thumbnail/Thumbnail'

const tutorials = [
  {
    name: 'Learn the basics in 15 minutes',
    link: '/docs/tutorials/basics',
  },
  {
    name: 'Build a GitHub API client in 16 minutes',
    link: 'https://keajs.ck.page/80aecebec7',
  },
  {
    name: 'Using keys with your logic in 17 minutes',
    link: 'https://keajs.ck.page/80aecebec7',
  },
  {
    name: 'Build an infinite list in 18 minutes',
    link: 'https://keajs.ck.page/80aecebec7',
  },
]
export function Tutorials() {
  return (
    <section className="Tutorials">
      <h1>Kea Tutorials</h1>
      <p style={{ marginTop: -20 }}>
        <strong>The V3 docs are alpha warning:</strong> There are no videos. These are just
        thumbnails.
      </p>
      {tutorials.map(({ name, link }, index) => (
        <div className="homepage-video" key={`${link}::${name}`}>
          {link.indexOf('https:') === 0 ? (
            <a href={link}>
              <Thumbnail style={{ padding: 10 }} index={index} comingSoon={index > 0} />
            </a>
          ) : (
            <Link to={link}>
              <Thumbnail style={{ padding: 10 }} index={index} comingSoon={index > 0} />
            </Link>
          )}
          <h2>
            {' '}
            {link.indexOf('https:') === 0 ? (
              <a href={link}>{name}</a>
            ) : (
              <Link to={link}>{name}</Link>
            )}
          </h2>
        </div>
      ))}
    </section>
  )
}
