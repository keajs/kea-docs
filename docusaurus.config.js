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
            ],
            copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/keajs/kea-docs/edit/master/website/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
}
