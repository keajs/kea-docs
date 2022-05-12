import './Tutorials.scss'
import Link from '@docusaurus/Link'
import React from 'react'
import { Thumbnail } from '../../../img/Thumbnail/Thumbnail'

const tutorials = [
  {
    name: 'Introduction to Kea 3.0 in 30 minutes',
    link: '/docs/tutorials/intro',
  },
  {
    name: 'Build a GitHub API client in 20 minutes',
    link: '/docs/tutorials/github',
    comingSoon: true,
  },
  {
    name: 'Using keys with your logic',
    link: 'https://keajs.ck.page/80aecebec7',
    comingSoon: true,
  },
  {
    name: 'Build an infinite list',
    link: 'https://keajs.ck.page/80aecebec7',
    comingSoon: true,
  },
]
export function Tutorials() {
  return (
    <section className="Tutorials">
      <h1>Kea Tutorials</h1>
      {tutorials.map(({ name, link, comingSoon }, index) => (
        <div className="homepage-video" key={`${link}::${name}`}>
          {link.indexOf('https:') === 0 ? (
            <a href={link}>
              <Thumbnail style={{ padding: 10 }} index={index} comingSoon={comingSoon} />
            </a>
          ) : (
            <Link to={link}>
              <Thumbnail style={{ padding: 10 }} index={index} comingSoon={comingSoon} />
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
