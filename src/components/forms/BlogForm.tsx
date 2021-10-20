import * as React from 'react'
import { useScript } from '../../utils/useScript'
import './BlogForm.css'

interface BlogFormProps {
    heading: string
    subtext: string
}

export function BlogForm({
    heading = 'Kea is growing.',
    subtext = 'Stay in the loop and get the latest updates via email.',
}: Partial<BlogFormProps>) {
    useScript('https://f.convertkit.com/ckjs/ck.5.js')
    return (
        <form
            action="https://app.convertkit.com/forms/2699831/subscriptions"
            className="seva-form formkit-form"
            method="post"
            data-attr="conversion-blog-form"
            data-ph-heading={heading}
            data-ph-subtext={subtext}
            data-sv-form="2699831"
            data-uid="a9350cada0"
            data-format="inline"
            data-version="5"
            data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"analytics":{"google":null,"facebook":null,"segment":null,"pinterest":null,"sparkloop":null,"googletagmanager":null},"modal":{"trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"powered_by":{"show":false,"url":"https://convertkit.com?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic"},"recaptcha":{"enabled":false},"return_visitor":{"action":"show","custom_content":""},"slide_in":{"display_in":"bottom_right","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"sticky_bar":{"display_in":"top","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15}},"version":"5"}'
            min-width="400 500 600 700 800"
            style={{ backgroundColor: '#1b1d31', borderRadius: 0, marginBottom: 80 }}
        >
            <div
                className="formkit-background"
                style={{
                    backgroundImage:
                        'url("https://embed.filekitcdn.com/e/2C9VDUfBB9Zox6J1Lh5XQP/ktwUKcMtYNPtGKFGYmu7RC")',
                    // 'url("https://embed.filekitcdn.com/e/2C9VDUfBB9Zox6J1Lh5XQP/uKNAmTha6JUzk3fHkqTZkR")',
                    // 'url("https://embed.filekitcdn.com/e/2C9VDUfBB9Zox6J1Lh5XQP/do5bCPtUXqXqmWypkHCcZQ")',
                    opacity: 0.56,
                    backgroundColor: 'rgb(16, 16, 16)',
                }}
            />
            <div data-style="minimal">
                <div
                    className="formkit-header"
                    data-element="header"
                    style={{ color: 'rgb(255, 255, 255)', fontSize: 36, fontWeight: 700 }}
                >
                    <h2>{heading}</h2>
                </div>
                <div
                    className="formkit-subheader"
                    data-element="subheader"
                    style={{ color: 'rgb(255, 255, 255)', fontSize: 22 }}
                >
                    <p>{subtext}</p>
                </div>
                <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert" />
                <div data-element="fields" data-stacked="false" className="seva-fields formkit-fields">
                    <div className="formkit-field">
                        <input
                            data-attr="conversion-blog-email"
                            className="formkit-input"
                            name="email_address"
                            aria-label="Email Address"
                            placeholder="Email Address"
                            required
                            type="email"
                            style={{
                                color: 'rgb(77, 77, 77)',
                                borderColor: 'rgb(227, 227, 227)',
                                borderRadius: 0,
                                fontWeight: 400,
                            }}
                        />
                    </div>
                    <button
                        data-attr="conversion-blog-submit"
                        data-element="submit"
                        className="formkit-submit formkit-submit"
                        style={{
                            color: 'rgb(255, 255, 255)',
                            backgroundColor: 'rgb(51, 51, 51)',
                            borderRadius: 0,
                            fontWeight: 400,
                        }}
                    >
                        <div className="formkit-spinner">
                            <div />
                            <div />
                            <div />
                        </div>
                        <span className="">Subscribe</span>
                    </button>
                </div>
                <div
                    className="formkit-guarantee"
                    data-element="guarantee"
                    style={{ color: 'rgb(54, 54, 54)', fontSize: 13, fontWeight: 400 }}
                >
                    <p>​</p>
                </div>
            </div>
        </form>
    )
}
