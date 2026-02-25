import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://tokencost.dev',
  integrations: [
    starlight({
      title: 'tokencost',
      logo: {
        src: './src/assets/tokencost-logo.png',
        alt: 'tokencost',
      },
      customCss: ['./src/styles/custom.css'],
      favicon: '/favicon.ico',
      head: [
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' } },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/atriumn/tokencost-dev',
        },
      ],
      sidebar: [
        { label: 'Getting Started', link: '/getting-started/' },
        { label: 'Examples', link: '/examples/' },
        {
          label: 'Tool Reference',
          autogenerate: { directory: 'tools' },
        },
      ],
    }),
  ],
});
