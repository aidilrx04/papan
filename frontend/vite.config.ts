import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: ['../server/**/*.{php,htaccess}'],
          dest: '../',
          rename: {
            stripBase: 1
          },

        }
      ],
    })
  ],
  build: {
    outDir: 'dist/public'
  }
})
