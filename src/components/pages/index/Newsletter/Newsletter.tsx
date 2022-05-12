import React from 'react'
import Link from '@docusaurus/Link'

export function Newsletter() {
  return (
    <section className="homepage-subscribe" id="newsletter">
      <div className="background" />
      <div className="foreground">
        <h1>Kea Newsletter</h1>
        <p>
          Learn of <Link to="/blog">new releases</Link> and <strong>tutorials</strong> as soon as they come out.
        </p>
        <form action="https://app.convertkit.com/forms/2699831/subscriptions" method="post">
          <input
            name="email_address"
            aria-label="Email Address"
            placeholder="Email Address"
            required
            type="email"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  )
}
