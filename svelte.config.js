import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    alias: {
      $lib: 'src/renderer/lib'
    },
    files: {
      appTemplate: 'src/renderer/app.html',
      lib: 'src/renderer/lib',
      routes: 'src/renderer/routes'
    },
    serviceWorker: {
      register: false
    }
  }
};

export default config;
