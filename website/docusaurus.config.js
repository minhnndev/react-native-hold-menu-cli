module.exports = {
  title: 'React Native Hold Menu',
  tagline:
    'A performant, easy to use hold to open context menu for React Native powered by Reanimated.',
  url: 'https://enesozturk.github.io',
  baseUrl: '/react-native-hold-menu-cli/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'minhnndev',
  projectName: 'react-native-hold-menu-cli',
  themeConfig: {
    twitterImage: 'img/og.png',
    image: 'img/og.png',
    navbar: {
      title: 'React Native Hold Menu',
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/minhnndev/react-native-hold-menu-cli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
