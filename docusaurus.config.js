const React = require('react')
const path = require('path')

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
          to: 'docs/intro',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'http://opencollective.com/kea',
          label: 'OpenCollective',
          position: 'right',
        },
        {
          href: 'https://github.com/keajs/kea',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © 2015-${new Date().getFullYear()} <a href='https://twitter.com/mariusandra' style='color:var(--ifm-footer-color);text-decoration: underline;'>Marius Andra</a> and other Kea contributors. <a href="https://keajs.ck.page/80aecebec7" style='color:var(--ifm-footer-color);text-decoration: underline;'>Subscribe to new content</a>`,
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
          remarkPlugins: [
            (options) => {
              const transformer = async (ast, vfile) => {
                const importUrl = path.relative(
                  path.dirname(vfile.path),
                  path.resolve(__dirname, 'src/components/squeak/Squeak')
                )
                const fakeSlug =
                  `/` + path.relative(__dirname, vfile.path).replaceAll(/\.[a-z]+$/g, '')
                ast.children.push(
                  {
                    type: 'mdxJsxFlowElement',
                    name: 'br',
                  },
                  {
                    type: 'heading',
                    depth: 2,
                    children: [
                      {
                        type: 'text',
                        value: 'Questions & Answers',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        value: `Ask questions about this page here.`,
                      },
                    ],
                  },
                  {
                    type: 'import',
                    value: `import { Squeak } from '${importUrl}'`,
                  },
                  {
                    type: 'jsx',
                    value: `<Squeak slug={${JSON.stringify(fakeSlug)}} />`,
                  }
                )
              }
              return transformer
            },
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
        blog: {
          blogSidebarCount: 15,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © 2015-${new Date().getFullYear()} Marius Andra and other Kea contributors.`,
          },
          blogPostComponent: require.resolve('./src/components/blog/BlogPostPage.tsx'),
        },
      },
    ],
  ],
}
