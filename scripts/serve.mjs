// Local preview only; never used by GitHub Pages.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
http.createServer(async (req,res) => {
  try {
    const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname), file = path.resolve(root,'.'+(name === '/' ? '/index.html' : name));
    if (!file.startsWith(root+path.sep) || file.includes('/.git/')) throw Error('Not found');
    const data = await fs.readFile(file); res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  } catch { res.writeHead(404);res.end('Not found'); }
}).listen(Number(process.env.PORT || 4173),'0.0.0.0');
