import React, { useEffect } from 'react'
import { kea, useActions, useValues } from 'kea'

const introCodeLogic = kea({
    actions: {
        expand: (code) => ({ code }),
        shrink: (code) => ({ code }),
    },
    reducers: {
        expanded: [
            {},
            {
                expand: (state, { code }) => ({ ...state, [code]: true }),
                shrink: (state, { code }) => {
                    const { [code]: _discard, ...rest } = state
                    return rest
                },
            },
        ],
    },
})

function Expand({ code }) {
    const { expand } = useActions(introCodeLogic)
    return <button onClick={() => expand(code)}>... expand ...</button>
}

function Shrink({ code }) {
    const { shrink } = useActions(introCodeLogic)
    return <button onClick={() => shrink(code)}>... shrink ...</button>
}

function L({ children }) {
    return <div className="code-line">{children}</div>
}

export function IntroCode() {
    const { expanded } = useValues(introCodeLogic)

    return (
        <>
            <L>{'// keep your state in Kea'}</L>
            {expanded?.logic ? (
                <>
                    <L>
                        {'const logic = kea({ '}
                        <Shrink code="logic" />
                    </L>
                    <L>{'    // everything starts with an action'}</L>
                    {expanded?.logicActions ? (
                        <>
                            <L>
                                {'    actions: { '}
                                <Shrink code="logicActions" />
                            </L>
                            <L>{'        // some actions are simple'}</L>
                            <L>{'        reset: true,'}</L>
                            <L>{'        '}</L>
                            <L>{'        // some carry a payload'}</L>
                            <L>{'        setUsername: (username) => ({ username }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // some take multiple args and defaults'}</L>
                            <L>{'        openPage: (page, perPage = 50) => ({ page, perPage }),'}</L>
                            <L>{'        '}</L>
                            <L>{'        // none modify any data nor call any API. pure functions FTW'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>
                            {'    actions: { '}
                            <Expand code="logicActions" />
                            {' },'}
                        </L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // store action payloads in reducers'}</L>
                    {expanded?.logicReducers ? (
                        <>
                            <L>
                                {'    reducers: { '}
                                <Shrink code="logicReducers" />
                            </L>
                            <L>{'         // using the immutable reducer pattern from redux'}</L>
                            <L>{'         username: ['}</L>
                            <L>{'             "keajs", // default value'}</L>
                            <L>{'             {'}</L>
                            <L>{'                 // '}</L>
                            <L>{'                 setUsername: (_, { username }) => username'}</L>
                            <L>{'             },'}</L>
                            <L>{'         ]'}</L>
                            <L>{'    },'}</L>
                        </>
                    ) : (
                        <L>
                            {'    reducers: { '}
                            <Expand code="logicReducers" />
                            {' },'}
                        </L>
                    )}
                    <L>{'    '}</L>
                    <L>{'    // combine and memoize values'}</L>
                    <L>
                        {'    selectors: { '}
                        <Expand code="logic.selectors" />
                        {' },'}
                    </L>
                    <L>{'    '}</L>
                    <L>{'    // run random javascript on actions'}</L>
                    <L>
                        {'    listeners: { '}
                        <Expand code="logic.listeners" />
                        {' },'}
                    </L>
                    <L>{'    '}</L>
                    <L>{'    // data that needs to be loaded from somewhere'}</L>
                    <L>
                        {'    loaders: { '}
                        <Expand code="logic.actions" />
                        {' },'}
                    </L>
                    <L>{'    '}</L>
                    <L>{'    // use the URL as a data source'}</L>
                    <L>
                        {'    router: { '}
                        <Expand code="logic.actions" />
                        {' },'}
                    </L>
                    <L>{'    '}</L>
                    <L>{'    // lifecycles: afterMount and beforeUnmount'}</L>
                    <L>
                        {'    events: { '}
                        <Expand code="logic.actions" />
                        {' },'}
                    </L>
                    <L>{'    '}</L>
                    <L>{'}'}</L>
                </>
            ) : (
                <L>
                    {'const logic = kea({ '}
                    <Expand code="logic" />
                    {' })'}
                </L>
            )}
            <L>{''}</L>
            <L>{'// and your views in React'}</L>
            <L>
                {'function Component() { '}
                <Expand code="component" />
                {' }'}
            </L>
        </>
    )
}
