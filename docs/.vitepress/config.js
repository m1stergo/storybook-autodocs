import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "storybook-autodocs",
  description: "Create storybook docs from vue 3 automatically",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Storybook autodocs', link: '/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is storybook-autodocs', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
        ]
      },
      {
        text: 'Writing Docs',
        items: [
          { text: 'Props', link: '/props' },
          { text: 'Emits', link: '/emits' },
          { text: 'Slots', link: '/slots' },
          { text: 'Expose', link: '/expose' },
          { text: 'Aadding more details', link: '/adding-more-details' },
        ]
      },
    ],
  }
})
