import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

import fs from 'fs';

// Health check endpoint for Cloud Run and container orchestrators
app.all('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const distPath = path.join(__dirname, 'dist');
// Serve compiled static assets from Vite dist directory
app.use(express.static(distPath));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>eOSIS</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>eOSIS - Sistem Pemilihan OSIS Online</h2>
          <p>Aplikasi sedang dimuat. Pastikan build static telah dijalankan (npm run build).</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`eOSIS server listening on port ${PORT} (0.0.0.0)`);
});
