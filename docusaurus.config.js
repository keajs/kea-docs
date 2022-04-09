const React = require('react')

module.exports = {
    title: 'Kea 3.0',
    tagline: 'Cheekily addi(c)tive state management for React',
    url: 'https://keajs.org',
    baseUrl: '/',
    favicon: 'img/favicon.ico',
    organizationName: 'keajs',
    projectName: 'kea',
    plugins: ['docusaurus-plugin-sass', 'posthog-docusaurus'],
    themeConfig: {
        navbar: {
            title: 'Kea 3.0',
            logo: {
                alt: 'Kea Logo',
                src: 'img/logo.svg',
            },
            hideOnScroll: true,
            items: [
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
                            html: `<div style='opacity: 0.3;margin-top:3px;'>You're awesome!</div>`,
                        },
                    ],
                },
            ],
            copyright: `<br/>Copyright © 2015-${new Date().getFullYear()} <a href='https://twitter.com/mariusandra' style='color:var(--ifm-footer-color);text-decoration: underline;'>Marius Andra</a> and other Kea contributors.`,
        },
        posthog:
            process.env.NODE_ENV === 'production'
                ? {
                      apiKey: '6pDQjCoo5w1uvLr9O-TtyrNT67SpnZQ8fLLpR5CqatQ',
                      appUrl: 'https://app.posthog.com',
                  }
                : {
                      apiKey: '8jVz0YZ2YPtP7eL1I5l5RQIp-WcuFeD3pZO8c0YDMx4',
                      appUrl: 'http://localhost:8000',
                      enableInDevelopment: true,
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
                    blogSidebarCount: 15,
                    feedOptions: {
                        type: 'all',
                        copyright: `Copyright © 2015-${new Date().getFullYear()} Marius Andra and other Kea contributors.`,
                    },
                    // blogListComponent: require.resolve('./src/components/blog/BlogListPage.tsx'),
                    // blogPostComponent: require.resolve('./src/components/blog/BlogPostPage.tsx'),
                },
            },
        ],
    ],
}
