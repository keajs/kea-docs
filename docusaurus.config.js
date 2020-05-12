const React = require('react')

module.exports = {
    title: 'Kea 2.0',
    tagline: 'Production Ready State Management for React',
    url: 'https://kea.js.org',
    baseUrl: '/',
    favicon: 'img/favicon.ico',
    organizationName: 'keajs',
    projectName: 'kea',
    themeConfig: {
        navbar: {
            title: 'Kea 2.0',
            logo: {
                alt: 'Kea Logo',
                src: 'img/logo.svg',
            },
            hideOnScroll: true,
            links: [
                {
                    to: 'docs/introduction/what-is-kea',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                },
                { to: 'blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/keajs/kea',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'What is Kea?',
                            to: 'docs/introduction/what-is-kea',
                        },
                        {
                            label: 'Core Concepts',
                            to: 'docs/guide/concepts',
                        },
                    ],
                },
                {
                    title: 'Social',
                    items: [
                        {
                            label: 'Blog',
                            to: 'blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/keajs/kea',
                        },
                    ],
                },
                {
                    title: 'Support Kea',
                    items: [
                        {
                            label: 'OpenCollective',
                            href: 'http://opencollective.com/kea',
                        },
                        {
                            label: 'GitHub Sponsors',
                            href: 'https://github.com/sponsors/mariusandra',
                        },
                    ],
                },
                {
                    title: 'Give a star!',
                    items: [
                        {
                            html: `<iframe src="https://ghbtns.com/github-btn.html?user=keajs&amp;repo=kea&amp;type=star&amp;count=true" frameborder="0" scrolling="0" width="100px" height="20px" style="margin-top:5px"></iframe>`,
                        },
                        {
                            html: `<div style='opacity: 0.3;margin-top:3px;'>You're awesome!</div>`
                        },
                        {
                            html: `<script>
                              if (window.location.host === 'kea.js.org') {
                                !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                                posthog.init('6pDQjCoo5w1uvLr9O-TtyrNT67SpnZQ8fLLpR5CqatQ', {api_host: 'https://app.posthog.com'})
                                                                
                                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                                ga('create', 'UA-103436947-1', 'auto');
                                ga('send', 'pageview');
                              }
                            </script>`.split('                              ').join('')
                        }
                    ],
                },
            ],
            copyright: `<br/>Copyright © 2015-${new Date().getFullYear()} <a href='https://twitter.com/mariusandra' style='color:var(--ifm-footer-color);text-decoration: underline;'>Marius Andra</a> and other Kea contributors.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/keajs/kea-docs/edit/master/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                blog: {
                    feedOptions: {
                        type: 'all',
                        copyright: `Copyright © 2015-${new Date().getFullYear()} Marius Andra and other Kea contributors.`,
                    },
                },
            },
        ],
    ],
}
