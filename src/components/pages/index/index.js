import '../../../resetKea'
import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import './styles.scss'
import { Tutorials } from './Tutorials/Tutorials'
import { Newsletter } from './Newsletter/Newsletter'
import { Squeak } from '../../squeak/Squeak'

const sections = [
  {
    url: '/docs/intro/',
    title: 'Intro',
    children: [
      { url: '/docs/intro/what-is-kea', title: 'what is kea?' },
      { url: '/docs/intro/installation', title: 'installation' },
      { url: '/docs/intro/typescript', title: 'typescript' },
      { url: '/docs/intro/testing', title: 'testing' },
      { url: '/docs/intro/debugging', title: 'debugging' },
      { url: '/docs/intro/context', title: 'context' },
      { url: '/docs/intro/redux', title: 'redux' },
    ],
  },
  {
    url: '/docs/core/',
    title: 'Core',
    children: [
      { url: '/docs/core/actions', title: 'actions' },
      { url: '/docs/core/reducers', title: 'reducers' },
      { url: '/docs/core/selectors', title: 'selectors' },
      { url: '/docs/core/listeners', title: 'listeners' },
      { url: '/docs/core/events', title: 'events' },
      { url: '/docs/core/defaults', title: 'defaults' },
    ],
  },
  {
    url: '/docs/meta/',
    title: 'Meta',
    children: [
      { url: '/docs/meta/kea', title: 'kea' },
      { url: '/docs/meta/logic', title: 'logic' },
      { url: '/docs/meta/connect', title: 'connect' },
      { url: '/docs/meta/key', title: 'key' },
      { url: '/docs/meta/path', title: 'path' },
      { url: '/docs/meta/props', title: 'props' },
    ],
  },
  {
    url: '/docs/react/',
    title: 'React',
    children: [
      { url: '/docs/react/useActions', title: 'useActions' },
      { url: '/docs/react/useValues', title: 'useValues' },
      { url: '/docs/react/useMountedLogic', title: 'useMountedLogic' },
      { url: '/docs/react/useAllValues', title: 'useAllValues' },
      { url: '/docs/react/BindLogic', title: 'BindLogic' },
      { url: '/docs/react/wrap', title: 'wrap' },
    ],
  },
  {
    url: '/docs/plugins/',
    title: 'Plugins',
    children: [
      { url: '/docs/plugins/API', title: 'API' },
      { url: '/docs/plugins/loaders', title: 'loaders' },
      { url: '/docs/plugins/router', title: 'router' },
      { url: '/docs/plugins/forms', title: 'forms' },
      { url: '/docs/plugins/saga', title: 'saga' },
      { url: '/docs/plugins/subscriptions', title: 'subscriptions' },
      { url: '/docs/plugins/localstorage', title: 'localstorage' },
      { url: '/docs/plugins/window-values', title: 'window-values' },
    ],
  },
  {
    title: 'Community',
    children: [
      { url: 'https://github.com/hyvor/kea-ajax', title: 'ajax' },
      { url: 'https://github.com/sanchezweezer/kea-socket.io', title: 'socket.io' },
    ],
  },
]

const QUOTES = [
  {
    thumbnail: 'img/testimonials/tim.jpg',
    name: 'Tim Glaser',
    title: 'CTO at PostHog',
    text: (
      <>
        I wasn't sure whether we should have an abstraction layer on top of Redux, but after using
        Kea for a day I never looked back. Kea feels like the <strong>good kind of magic</strong>.
        You can <strong>understand what’s happening</strong>, but it takes away a lot of the tedious
        tasks. Adding more features doesn't feel like adding more complexity.
      </>
    ),
  },
  {
    thumbnail: 'img/testimonials/michael.jpg',
    name: 'Michael Fatoki-Bello',
    title: 'User Experience Engineer',
    text: (
      <>
        Setting up Kea is so simple and intuitive. The best bit has to be how Kea{' '}
        <strong>handles form management</strong>, something that used to be a horrible experience
        for most frontenders, has been made <strong>so straightforward and almost trivial</strong>{' '}
        to achieve. Such a sane and sensible way to manage state.
      </>
    ),
  },
  {
    thumbnail: 'img/testimonials/scotty.jpg',
    name: 'Scotty Bollinger',
    title: 'Senior Front End Engineer at Elastic',
    text: (
      <>
        We have 3-5 engineers working on the Kea codebase. <strong>We use TypeScript</strong> and
        have about 25 logic stores all connected via a parent app logic store. Absolutely LOVE the
        library and, as a engineer new to Redux, I found this to be{' '}
        <strong>incredibly easy to get up to speed on</strong> and it seems to scale very well.
      </>
    ),
  },
]

export default function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout
      title="Cheekily addi(c)tive state management for React"
      description="Kea is a production-grade state management framework built for ambitious React apps."
    >
      <div className="homepage-hero">
        <div className="intro">
          <img src={useBaseUrl('img/logo.svg')} alt="" />
          <div className="text">
            <h1>{siteConfig.title}</h1>
            <strong>{siteConfig.tagline}</strong>
            <div className="links">
              <Link to="/blog/kea-3.0">Read the announcement: Kea v3.0</Link>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <iframe
                src="https://ghbtns.com/github-btn.html?user=keajs&repo=kea&type=star&count=true"
                frameBorder="0"
                scrolling="0"
                width="100px"
                height="20px"
                style={{ verticalAlign: 'sub' }}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="sections-table">
        <table>
          <tbody>
            {sections.map(({ title, url, children }) => (
              <tr key={`${url}${title}`}>
                <td>
                  <Link to={url}>{title}</Link>:
                </td>
                <td>
                  {children?.map((child, index) => (
                    <React.Fragment key={index}>
                      <Link to={child.url}>{child.title}</Link>
                      {index !== children.length - 1 ? <>&nbsp;| </> : null}
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="Homepage-Tutorials">
        <h1>
          <Link to="/docs/tutorials/">Kea Tutorials</Link>
        </h1>
        <p>
          New tutorial coming soon! <Link to="#newsletter">Subscribe to the newsletter</Link> to not
          miss out.
        </p>
        <Tutorials />
      </section>

      <Newsletter />

      <main>
        <div className="homepage-testimonials">
          <div className="container">
            <div className="row">
              {QUOTES.map((quote) => (
                <div className="col" key={quote.name}>
                  <div className="avatar avatar--vertical margin-bottom--sm">
                    <img
                      alt={quote.name}
                      className="avatar__photo avatar__photo--xl"
                      src={useBaseUrl(quote.thumbnail)}
                      style={{ overflow: 'hidden' }}
                    />
                    <div className="avatar__intro padding-top--sm">
                      <h4 className="avatar__name">{quote.name}</h4>
                      <small className="avatar__subtitle">{quote.title}</small>
                    </div>
                  </div>
                  <p className="text--center text--italic padding-horiz--md">{quote.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="homepage-cta">
          <div className="container">
            <div className="row">
              <div className="col text--center" style={{ fontSize: 24 }}>
                Read the documentation: <Link to="/docs/intro/what-is-kea">What is Kea?</Link>
              </div>
            </div>

            <div className="row">
              <div className="col text--center" style={{ fontSize: 16, marginTop: 18 }}>
                Want to see a full app written with Kea? Check out{' '}
                <a href="https://github.com/PostHog/posthog">PostHog</a>. It's open-source product
                analytics and we're building it now!
              </div>
            </div>
            <div className="row">
              <div className="col text--center" style={{ fontSize: 16, marginTop: 18 }}>
                Looking for docs for Kea <a href="https://v2.keajs.org/">2.0</a>,{' '}
                <a href="https://v1.keajs.org/">1.0</a> or <a href="https://v0.keajs.org/">0.28</a>?
              </div>
            </div>
          </div>
        </div>

        <section className="homepage-logos">
          <div className="container">
            <span className="trusted">Trusted by:</span>
            <div className="trusted-logos">
              <a target="_blank" rel="noopener noreferrer" href="https://www.posthog.com">
                <img
                  className="posthog"
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMwIiB2aWV3Qm94PSIwIDAgMTUwIDMwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAxOC4yNTg1TDcuMzEzMjIgMjUuNTYxOUgwVjE4LjI1ODVaTTAgMTYuNDMyNkw5LjE0MTUzIDI1LjU2MTlIMTYuNDU0N0wwIDkuMTI5MjVWMTYuNDMyNlpNMCA3LjMwMzRMMTguMjgzIDI1LjU2MTlIMjUuNTk2M0wwIDBWNy4zMDM0Wk05LjE0MTUzIDcuMzAzNEwyNy40MjQ2IDI1LjU2MTlWMTguMjU4NUw5LjE0MTUzIDBWNy4zMDM0Wk0xOC4yODMgMFY3LjMwMzRMMjcuNDI0NiAxNi40MzI2VjkuMTI5MjVMMTguMjgzIDBaIiBmaWxsPSIjRjlCRDJCIi8+CjxwYXRoIGQ9Ik00My44NzkzIDIyLjY0MDZDNDIuMDA1NyAyMi42NDA2IDQwLjIwOTUgMjEuODk3MSAzOC44ODU4IDIwLjU3NTJMMjguNzE3NSAxMC40MjA1VjI1LjU2MTlINDMuODc5M1YyMi42NDA2WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTMzLjEwNTUgMjIuNjQwNUMzMy45MTMzIDIyLjY0MDUgMzQuNTY4MSAyMS45ODY2IDM0LjU2ODEgMjEuMTc5OUMzNC41NjgxIDIwLjM3MzIgMzMuOTEzMyAxOS43MTkyIDMzLjEwNTUgMTkuNzE5MkMzMi4yOTc3IDE5LjcxOTIgMzEuNjQyOSAyMC4zNzMyIDMxLjY0MjkgMjEuMTc5OUMzMS42NDI5IDIxLjk4NjYgMzIuMjk3NyAyMi42NDA1IDMzLjEwNTUgMjIuNjQwNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0wIDI1LjU2MTlINy4zMTMyMkwwIDE4LjI1ODVWMjUuNTYxOVoiIGZpbGw9IiMxRDRBRkYiLz4KPHBhdGggZD0iTTkuMTQxNTMgOS4xMjkyNUwwIDBWNy4zMDM0TDkuMTQxNTMgMTYuNDMyNlY5LjEyOTI1WiIgZmlsbD0iIzFENEFGRiIvPgo8cGF0aCBkPSJNMCA5LjEyOTI2VjE2LjQzMjdMOS4xNDE1MyAyNS41NjE5VjE4LjI1ODVMMCA5LjEyOTI2WiIgZmlsbD0iIzFENEFGRiIvPgo8cGF0aCBkPSJNMTguMjgzIDkuMTI5MjVMOS4xNDE1MyAwVjcuMzAzNEwxOC4yODMgMTYuNDMyNlY5LjEyOTI1WiIgZmlsbD0iI0Y1NEUwMCIvPgo8cGF0aCBkPSJNOS4xNDE1MyAyNS41NjE5SDE2LjQ1NDdMOS4xNDE1MyAxOC4yNTg1VjI1LjU2MTlaIiBmaWxsPSIjRjU0RTAwIi8+CjxwYXRoIGQ9Ik05LjE0MTUzIDkuMTI5MjZWMTYuNDMyN0wxOC4yODMgMjUuNTYxOVYxOC4yNTg1TDkuMTQxNTMgOS4xMjkyNloiIGZpbGw9IiNGNTRFMDAiLz4KPHBhdGggZD0iTTczLjQ4OTEgMTUuNDUxMUM3My40ODkxIDE4LjcyMyA3Mi4wMjM1IDIwLjkxODQgNjcuMDc1NCAyMC45MTg0SDY0LjM0OVYyNS41NjE5SDYxLjM3MTFWMTAuMDA1N0g2Ny4wNzU0QzcyLjAyMzUgMTAuMDA3MSA3My40ODkxIDEyLjE3OTIgNzMuNDg5MSAxNS40NTExWk03MC41MTExIDE1LjQ1MTFDNzAuNTExMSAxMy41NTIyIDY5LjkxNTggMTIuNzUxNyA2Ny42MDE5IDEyLjc1MTdINjQuMzQ5VjE4LjE3MzhINjcuNjAxOUM2OS45MTU4IDE4LjE3MzggNzAuNTExMSAxNy4yODEzIDcwLjUxMTEgMTUuNDUxMVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik03NC45NzggMTkuNjYwOEM3NC45NzggMTYuMDY4OSA3Ni45NzAyIDEzLjU1MjIgODAuNjgyNCAxMy41NTIyQzg0LjM5MzEgMTMuNTUyMiA4Ni4zODY3IDE2LjA2ODkgODYuMzg2NyAxOS42NjA4Qzg2LjM4NjcgMjMuMjUyNiA4NC4zOTMxIDI1Ljc5MTIgODAuNjgyNCAyNS43OTEyQzc2Ljk3MTYgMjUuNzkxMiA3NC45NzggMjMuMjUxMSA3NC45NzggMTkuNjYwOFpNODMuNDA4NyAxOS42NjA4QzgzLjQwODcgMTcuMTQ0IDgyLjY5OTQgMTYuMjk4MyA4MC42ODI0IDE2LjI5ODNDNzguNjY2OCAxNi4yOTgzIDc3Ljk1NiAxNy4xNDQgNzcuOTU2IDE5LjY2MDhDNzcuOTU2IDIyLjE3NzUgNzguNjY1NCAyMy4wNDY2IDgwLjY4MjQgMjMuMDQ2NkM4Mi42OTc5IDIzLjA0NTIgODMuNDA4NyAyMi4xNzYxIDgzLjQwODcgMTkuNjYwOFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik04OC4zMzM0IDIxLjMzMDNDOTAuNDE3NyAyMi42MzQ3IDkxLjk1MzUgMjMuMDQ2NiA5My42NDg3IDIzLjA0NjZDOTQuNzQ4NiAyMy4wNDY2IDk1LjIwNjQgMjIuNjExMyA5NS4yMDY0IDIyLjA0MDJDOTUuMjA2NCAyMS4zNzcxIDk0Ljc5MzkgMjEuMDU3MiA5Mi45NjEyIDIwLjc1OTJDODkuMzY0NiAyMC4yMSA4OC4zMzM0IDE4Ljc5MTcgODguMzMzNCAxNi45ODQ4Qzg4LjMzMzQgMTQuNjI4NyA5MC4zMDM2IDEzLjU1MzYgOTIuNzU1IDEzLjU1MzZDOTQuMjg5MyAxMy41NTM2IDk2LjE0NTQgMTMuOTY1NiA5Ny4yNjczIDE0Ljc0MjZWMTcuNDg3M0M5NS41OTU1IDE2LjY2MzQgOTMuNzg2MiAxNi4yOTgzIDkyLjUyNTQgMTYuMjk4M0M5MS43MDA0IDE2LjI5ODMgOTEuMzExNCAxNi41OTYyIDkxLjMxMTQgMTcuMTIyMUM5MS4zMTE0IDE3LjY5NDcgOTEuNjA5NyAxOC4wMTQ2IDkzLjQ0MjQgMTguNDAzMUM5Ni44NzgyIDE5LjExMTUgOTguMTg0NCAxOS44NDQ4IDk4LjE4NDQgMjIuMTA4OUM5OC4xODQ0IDI0LjQ0MTYgOTYuMTAwMSAyNS43OTEyIDkzLjQxOTEgMjUuNzkxMkM5MS42MzE3IDI1Ljc5MTIgOTAuMDA1MiAyNS40NDggODguMzMzNCAyNC4zMjc2VjIxLjMzMDNWMjEuMzMwM1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xMDQuMTM5IDE2LjUyNjFWMjIuODE3M0gxMDcuMjc2VjI1LjU2MTlIMTAxLjE2MVYxNi41MjYxSDk5LjMyODFWMTMuNzgxNUgxMDEuMTYxVjkuNTQ5OTRIMTA0LjEzOVYxMy43ODE1SDEwNy4yNzZWMTYuNTI2MUgxMDQuMTM5WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyMy4wNiAxMC4wMDcxVjI1LjU2MzRIMTIwLjA4MlYxOS4zODYySDExMy4yMzJWMjUuNTYzNEgxMTAuMjU0VjEwLjAwNzFIMTEzLjIzMlYxNi42NDE1SDEyMC4wODJWMTAuMDA3MUgxMjMuMDZWMTAuMDA3MVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xMjUuMzUyIDE5LjY2MDhDMTI1LjM1MiAxNi4wNjg5IDEyNy4zNDQgMTMuNTUyMiAxMzEuMDU2IDEzLjU1MjJDMTM0Ljc2NyAxMy41NTIyIDEzNi43NiAxNi4wNjg5IDEzNi43NiAxOS42NjA4QzEzNi43NiAyMy4yNTI2IDEzNC43NjcgMjUuNzkxMiAxMzEuMDU2IDI1Ljc5MTJDMTI3LjM0NSAyNS43OTEyIDEyNS4zNTIgMjMuMjUxMSAxMjUuMzUyIDE5LjY2MDhaTTEzMy43ODEgMTkuNjYwOEMxMzMuNzgxIDE3LjE0NCAxMzMuMDcxIDE2LjI5ODMgMTMxLjA1NCAxNi4yOTgzQzEyOS4wMzkgMTYuMjk4MyAxMjguMzI4IDE3LjE0NCAxMjguMzI4IDE5LjY2MDhDMTI4LjMyOCAyMi4xNzc1IDEyOS4wMzcgMjMuMDQ2NiAxMzEuMDU0IDIzLjA0NjZDMTMzLjA3MSAyMy4wNDUyIDEzMy43ODEgMjIuMTc2MSAxMzMuNzgxIDE5LjY2MDhaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTUwIDEzLjc4MTVWMjkuMjIyNEgxNDAuNjA4VjI2LjQ3NzdIMTQ3LjAyMlYyMy4yNzQ1QzE0Ni4zMzUgMjQuMDI5NiAxNDUuMzI3IDI0LjY0NzUgMTQzLjY3NyAyNC42NDc1QzE0MC4yNDEgMjQuNjQ3NSAxMzguNTkxIDIyLjA2MjEgMTM4LjU5MSAxOS4wODgyQzEzOC41OTEgMTYuMTM3NiAxNDAuMjQxIDEzLjU1MjIgMTQzLjY3NyAxMy41NTIyQzE0NS4zMjcgMTMuNTUyMiAxNDYuMzM1IDE0LjE3MDEgMTQ3LjAyMiAxNS4wMzkyVjEzLjc4MTVIMTUwVjEzLjc4MTVaTTE0Ny4wMjIgMTkuMDg4MkMxNDcuMDIyIDE3LjMyNjYgMTQ2LjMxMyAxNi4yOTY4IDE0NC4yOTYgMTYuMjk2OEMxNDIuMjggMTYuMjk2OCAxNDEuNTY5IDE3LjMyNjYgMTQxLjU2OSAxOS4wODgyQzE0MS41NjkgMjAuODczMSAxNDIuMjggMjEuOTAxNCAxNDQuMjk2IDIxLjkwMTRDMTQ2LjMxMSAyMS45MDE0IDE0Ny4wMjIgMjAuOTg3MSAxNDcuMDIyIDE5LjA4ODJaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K"
                />
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://www.elastic.co">
                <img className="elastic" src={useBaseUrl('img/trusted/elastic.svg')} />
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://www.navirec.com">
                <img className="navirec" src={useBaseUrl('img/trusted/navirec.svg')} />
              </a>
              <a
                href="https://github.com/keajs/kea/issues/35"
                style={{ height: 'auto', color: '#585858' }}
              >
                and many more
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
