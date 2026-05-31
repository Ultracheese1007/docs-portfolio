// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Xinmei Ma — Documentation Portfolio',
  tagline: 'Developer documentation for backend, data-platform, and ML systems',
  favicon: 'img/favicon.ico',

  future: { v4: true },

  // === EDIT THESE FOR YOUR OWN GITHUB PAGES DEPLOY ===
  url: 'https://Ultracheese1007.github.io',
  baseUrl: '/docs-portfolio/',
  organizationName: 'Ultracheese1007', // GitHub user/org
  projectName: 'docs-portfolio',        // repo name
  // ===================================================

  onBrokenLinks: 'warn',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // docs are the site root
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
      navbar: {
        title: 'Xinmei Ma · Docs',
        items: [
          { type: 'docSidebar', sidebarId: 'portfolioSidebar', position: 'left', label: 'Documentation' },
          { href: 'https://github.com/Ultracheese1007', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Documentation portfolio of Xinmei Ma · built with Docusaurus`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'java', 'sql'],
      },
    }),
};

export default config;
