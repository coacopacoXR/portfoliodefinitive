import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo name — also used as the GitHub Pages sub-path.
// If you add a custom domain, change this to '/' and update CNAME.
const REPO_NAME = 'portfoliodefinitive';

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
    // skip sockets, symlinks, etc.
  }
}

export default defineConfig({
  base: `/${REPO_NAME}/`,
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    {
      name: 'serve-assets-dir',
      configureServer(server) {
        server.middlewares.use('/Assets', (req, res, next) => {
          const filePath = path.join(process.cwd(), 'Assets', decodeURIComponent(req.url || ''));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.pdf') res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
      closeBundle() {
        const src  = path.join(process.cwd(), 'Assets');
        const dest = path.join(process.cwd(), 'dist', 'Assets');
        copyDirRecursive(src, dest);
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
