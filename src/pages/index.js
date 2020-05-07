import React from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'
import './styles.css'

const features = [
    {
        title: <>Easy to Use</>,
        imageUrl: 'img/undraw_docusaurus_mountain.svg',
        description: (
            <>
                Get up and running in minutes.
            </>
        ),
    },
    {
        title: <>Production Scale</>,
        imageUrl: 'img/undraw_docusaurus_tree.svg',
        description: (
            <>
                Kea has been used to build huge apps.
            </>
        ),
    },
    {
        title: <>Built on Strong Foundations</>,
        imageUrl: 'img/undraw_docusaurus_react.svg',
        description: (
            <>
                Redux. State Machines. Reactive Programming.
            </>
        ),
    },
    {
        title: <>Lifecycles</>,
        imageUrl: 'img/undraw_docusaurus_react.svg',
        description: (
          <>
              Logic is mounted and unmounted as needed.<br/>
              Code splitting? Not a problem!
          </>
        ),
    },
]


const QUOTES = [
  {
    thumbnail: 'https://avatars3.githubusercontent.com/u/1727427?s=460&u=68d3693009c289044285447b6ed667bdb08176d2&v=4',
    name: 'Tim Glaser',
    title: 'CTO at PostHog',
    text: (
      <>
        I&apos;ve helped open source many projects at Facebook and every one
        needed a website. They all had very similar constraints: the
        documentation should be written in markdown and be deployed via GitHub
        pages. I’m so glad that Docusaurus now exists so that I don’t have to
        spend a week each time spinning up a new one.
      </>
    ),
  },
  {
    thumbnail: 'https://avatars0.githubusercontent.com/u/727994?s=460&u=25f13f09babcef77247377af7f574280606609e7&v=4',
    name: 'Madis Väin',
    title: 'Software Craftsman at Namespace',
    text: (
      <>
        Open source contributions to the React Native docs have skyrocketed
        after our move to Docusaurus. The docs are now hosted on a small repo in
        plain markdown, with none of the clutter that a typical static site
        generator would require. Thanks Slash!
      </>
    ),
  },
  {
    thumbnail: 'https://avatars1.githubusercontent.com/u/1869731?s=460&u=c7168af46965484cf33d024bcb751f6319b6d41c&v=4',
    name: 'Scotty Bollinger',
    title: 'Senior Front End Engineer at Elastic',
    text: (
      <>
        We have 3-5 engineers working on the Kea codebase. We use TypeScript and have about 25 logic stores all connected via a parent app logic store.
        Absolutely LOVE the library and, as a engineer new to Redux, I found this to be incredibly easy to get up to speed on and it seems to scale very well.
      </>
    ),
  },
];


function Feature({ imageUrl, title, description }) {
    const imgUrl = useBaseUrl(imageUrl)
    return (
        <div className={classnames('col col--4', styles.feature)}>
            {imgUrl && (
                <div className="text--center">
                    <img className={styles.featureImage} src={imgUrl} alt={title} />
                </div>
            )}
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}

function Home() {
    const context = useDocusaurusContext()
    const { siteConfig = {} } = context
    return (
        <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
            <header className={classnames('hero hero--primary', styles.heroBanner)}>
                <div className="container">
                    <h1 className="hero__title">{siteConfig.title}</h1>
                    <p className="hero__subtitle">{siteConfig.tagline}</p>
                    <div className={styles.buttons}>
                        <Link
                            className={classnames(
                                'button button--outline button--secondary button--lg',
                                styles.getStarted
                            )}
                            to={useBaseUrl('docs/introduction/what-is-kea')}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>
            <section className='homepage-logos'>
              <div className='container'>
                <span className='trusted'>Trusted by:</span>
                <div className='trusted-logos'>
                  <img className='navirec' src={useBaseUrl('img/trusted/navirec.svg')} />
                  <span className='posthog'><img src={useBaseUrl('img/trusted/posthog.png')} /><span>PostHog</span></span>
                  <img className='elastic' src={useBaseUrl('img/trusted/elastic.svg')} />
                  <img className='gsmtasks' src={useBaseUrl('img/trusted/gsmtasks.svg')} />
                  <img className='smart' src={useBaseUrl('img/trusted/smart.png')} />
                  <img className='apprentus' src={useBaseUrl('img/trusted/apprentus.png')} />
                </div>
              </div>
            </section>
            <main>
                {features && features.length && (
                    <section className={styles.features}>
                        <div className="container">
                            <div className="row">
                                {features.map((props, idx) => (
                                    <Feature key={idx} {...props} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

              <div className='homepage-testimonials'>
                <div className="container">
                  <div className="row">
                    {QUOTES.map((quote) => (
                      <div className="col" key={quote.name}>
                        <div className="avatar avatar--vertical margin-bottom--sm">
                          <img
                            alt={quote.name}
                            className="avatar__photo avatar__photo--xl"
                            src={quote.thumbnail}
                            style={{overflow: 'hidden'}}
                          />
                          <div className="avatar__intro padding-top--sm">
                            <h4 className="avatar__name">{quote.name}</h4>
                            <small className="avatar__subtitle">{quote.title}</small>
                          </div>
                        </div>
                        <p className="text--center text--italic padding-horiz--md">
                          {quote.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </main>
        </Layout>
    )
}

export default Home
