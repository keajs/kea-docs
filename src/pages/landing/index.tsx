import '../../resetKea'
import { Provider } from 'react-redux'
import { getContext } from 'kea'
import Layout from '@theme/Layout'
import React from 'react'

import { KeaReact } from '../../components/img/KeaReact'
import { WebDev } from '../../components/img/WebDev'
import { BuildingBlocks } from '../../components/img/BuildingBlocks'

import './landing.css'

export function Code({ code }: { code: string }) {
    return <div className="block code-block">{code}</div>
}

export function Huge({ children }) {
    return <strong className="huge">{children}</strong>
}

export function Landing() {
    return (
        <>
            <div className="landing-page">
                <div className="block hero-bg">
                    <h1>
                        <Huge>Kea</Huge> is a system for organizing <strong>frontend logic</strong>
                    </h1>
                </div>
                <div className="block">
                    Modern web development is coplicated. To manage this complexity, we abstract our field into separate
                    layers:
                </div>
                <WebDev />
                <div className="block">
                    <p>
                        <strong>Kea</strong> sits between React and your APIs as a separate{' '}
                        <strong>data and logic layer</strong>.
                    </p>
                    <p>
                        It’s the <em>backend of your frontend</em>.
                    </p>
                </div>
                <KeaReact />
                <div className="block">
                    <p>
                        Kea's unit of organization is <strong>a logic</strong>.
                    </p>
                    <p>
                        You use four building blocks: <strong>actions</strong>, <strong>listeners</strong>,{' '}
                        <strong>reducers</strong> and <strong>selectors</strong>.
                    </p>
                </div>
                <BuildingBlocks />
                <div className="block">Each described with a strict yet maximally compact structure:</div>
                <Code
                    code={`
const userLogic = kea<userLogicType>({
    actions: {
        loadUser: (id: number) => ({ id }),
        userLoaded: (user: User) => ({ user }),
    },
    listeners: ({ actions }) => ({
        loadUser: async ({ id }) => {
            const user = await api.loadUser(id)
            actions.userLoaded(user)
        },
    }),
    reducers: {
        userLoading: [
            false,
            {
                loadUser: () => true,
                userLoaded: () => false,
            },
        ],
        user: [
            null as User | null,
            {
                userLoaded: (_, { user }) => user,
            },
        ],
    },
    selectors: {
        hasReviews: [(s) => [s.user], (user) => user?.reviews?.length > 0],
    },
})
        `}
                />
                <div className="block">
                    Abstract common patterns with plugins, such as <strong>loaders</strong> for loading API data, or a{' '}
                    <strong>router</strong> for syncing the browser’s URL.
                </div>
                <Code
                    code={`
const userLogic = kea<userLogicType>({
    loaders: {
        user: [
            null as User | null,
            {
                loadUser: async (id: number) => {
                    return await api.loadUser(id)
                },
            },
        ],
    },
    urlToAction: ({ actions }) => ({
        '/users/:id': ({ id }) => {
            if (values.user?.id !== id) {
                actions.loadUser(parseInt(id))
            }
        },
    }),
})
        `}
                />
                <div className="block">
                    Communication with React is clean:
                    <br />
                    <strong>Values</strong> In, <strong>Actions</strong> Out.
                </div>
                <Code
                    code={`
// reducers and selectors are exposed via values
const { user, userLoading } = useValues(userLogic)
const { loadUser } = useActions(userLogic)
        `}
                />
                <div className="block">
                    <h1>Frontend tests you’ll actually write</h1>
                    <p>
                        Adopting a data layer with an <em>immutable global state object</em>, that only changes through
                        reducers in response to actions has a few advantages.
                    </p>
                    <p>
                        For example, <strong>live-replay logic testing</strong>:
                    </p>
                </div>
                <Code
                    code={`
import { expectLogic } from 'kea-test-utils'

it('setting search query loads remote items', async () => {
    await expectLogic(logic, () => {
        logic.actions.setSearchQuery('event')
    })
        .toDispatchActions(['setSearchQuery', 'loadRemoteItems'])
        .toMatchValues({
            searchQuery: 'event',
            remoteItems: null,
            remoteItemsLoading: true,
        })
        .toDispatchActions(['loadRemoteItemsSuccess'])
        .toMatchValues({
            searchQuery: 'event',
            remoteItems: partial({
                count: 3,
                results: partial([partial({ name: 'event1' })]),
            }),
            remoteItemsLoading: false,
        })

    // also test the mocked api call separately
})
        `}
                />
                <div className="block">
                    <p>
                        If every operation in your app starts with and action, and only actions change values, you can
                        greatly simplify your tests.
                    </p>
                    <p>
                        To test a logic, dispatch an action, and then <em>query the recorded history</em> to assure it
                        contains what you’d expect.
                    </p>
                    <p>That’s it.</p>
                </div>
                <div className="block">
                    <p>Other innovations Kea brings over vanilla Redux</p>
                    <ul className="square-block">
                        <li>
                            <strong>breakpoints</strong> in listeners solve debouncing and out-of-order requests in one
                            fell swoop
                        </li>
                        <li>
                            <strong>keyed logic</strong> allows for multiple copies of the same logic
                        </li>
                        <li>
                            <strong>no root globals</strong>, all state is shared via es6 imports
                        </li>
                        <li>
                            <strong>automatically unmount</strong> logic that’s no longer in use by React
                        </li>
                        <li>
                            <strong>automatic type generation</strong> when you use Kea with TypeScript
                        </li>
                        <li>
                            inspired by the fact that every clojurescript frontend framework eventually developed a
                            separate data layer
                        </li>
                    </ul>
                </div>
                <div className="block">MIT licensed, naturally</div>
                <div className="block">Get Started</div>
            </div>
        </>
    )
}

export default function WrappedLanding() {
    return (
        <Provider store={getContext().store}>
            <Layout
                title="Production Ready React State Management"
                description="Kea is a production-grade state management framework built for ambitious React apps."
            >
                <Landing />
            </Layout>
        </Provider>
    )
}
