import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://tokencost.dev',
  integrations: [
    starlight({
      title: 'Token Cost',
      logo: {
        src: './src/assets/tokencost-logo.png',
        alt: 'Token Cost',
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/atriumn/tariff',
        },
      ],
      sidebar: [
        { label: 'Getting Started', link: '/getting-started/' },
        {
          label: 'Tool Reference',
          autogenerate: { directory: 'tools' },
        },
      ],
    }),
  ],
});
