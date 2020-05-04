import React from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

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
            <div style={{ textAlign: 'center' }}>
              TODO: add company logos, add testimonials, fix feature points
            </div>
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
            </main>
        </Layout>
    )
}

export default Home
