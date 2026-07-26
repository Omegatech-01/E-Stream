import express from "express";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { createServer as createViteServer } from "vite";

const _dirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : path.dirname(fs.realpathSync(process.argv[1]));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 2; 

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const pushSubscriptions: any[] = [];

  app.post("/api/push/subscribe", (req, res) => {
    const subscription = req.body;
    pushSubscriptions.push(subscription);
    res.status(201).json({ success: true });
  });

  const injectMetaTags = async (html: string, url: string) => {
    try {
      const watchMatch = url.match(/\/watch\/([^\/\?]+)/);
      if (watchMatch) {
        const channelId = watchMatch[1];
        let name = "";
        let logo = "";
        let description = "";

        if (channelId.startsWith('gold-')) {
          const goldKey = channelId.replace('gold-', '');
          const response = await fetch("https://omegatech-api.dixonomega.tech/api/movie/Live-Tv?action=list");
          const data = await response.json();
          if ((data.success || data.statusCode === 200) && data.data) {
            const item = data.data[goldKey];
            if (item) {
              name = item.name || goldKey;
              logo = item.logo || "/favicon.png";
            }
          }
        } else {
          const response = await fetch("https://api.omegatech.app/api/movie/Iptv?action=streams");
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const channel = data.data.find((c: any, index: number) => {
               const id = `${c.channel || 'stream'}-${index}`;
               return id === channelId;
            });
            if (channel) {
              name = channel.title || channel.channel || "E-Stream Channel";
              logo = channel.logo || "/favicon.png";
            }
          }
        }

        if (name) {
          description = `Watch ${name} live on E-Stream. Premium IPTV experience.`;
          return html
            .replace(/<title>.*?<\/title>/g, `<title>${name} | E-Stream</title>`)
            .replace(/<meta name="title" content=".*?" \/>/g, `<meta name="title" content="${name} | E-Stream" />`)
            .replace(/<meta name="description" content=".*?" \/>/g, `<meta name="description" content="${description}" />`)
            .replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${name} | E-Stream" />`)
            .replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${description}" />`)
            .replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${logo}" />`)
            .replace(/<meta property="twitter:title" content=".*?" \/>/g, `<meta property="twitter:title" content="${name} | E-Stream" />`)
            .replace(/<meta property="twitter:description" content=".*?" \/>/g, `<meta property="twitter:description" content="${description}" />`)
            .replace(/<meta property="twitter:image" content=".*?" \/>/g, `<meta property="twitter:image" content="${logo}" />`);
        }
      }
    } catch (e) {
      console.error("Error injecting meta tags:", e);
    }
    return html;
  };

  app.get("/api/iptv", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      if (!queryString) {
        res.status(400).json({ error: "action is required" });
        return;
      }
      
      const cacheKey = queryString;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.json(cached.data);
        return;
      }
      
      const response = await fetch(`https://api.omegatech.app/api/movie/Iptv?${queryString}`);
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await response.text();
         throw new Error(`Expected JSON from Iptv proxy but got ${contentType}: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/live-tv", async (req, res) => {
    try {
      const cacheKey = "live_tv_list_v1";
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.json(cached.data);
        return;
      }

      const response = await fetch("https://omegatech-api.dixonomega.tech/api/movie/Live-Tv?action=list");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await response.text();
         throw new Error(`Expected JSON from Live-Tv proxy but got ${contentType}: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();

      if (data && (data.success || data.statusCode === 200)) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      res.json(data);
    } catch (error: any) {
      console.error("Live-TV Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.options("/api/stream-proxy", (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.sendStatus(204);
  });

  app.get("/api/stream-proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        res.status(400).send("url parameter required");
        return;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);

      let origin = '';
      try {
        origin = new URL(targetUrl).origin;
      } catch (e) {
        
      }

      const reqHeaders: Record<string, string> = {
        'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
      };

      if (origin) {
        reqHeaders['Referer'] = origin + '/';
      }

      if (req.headers.range) {
        reqHeaders['Range'] = req.headers.range as string;
      }

      try {
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          redirect: 'follow',
          headers: reqHeaders,
        });

        clearTimeout(timeout);

        if (!response.ok && response.status !== 206) {
          res.status(response.status).send(`Failed to fetch stream (${response.status}): ${response.statusText}`);
          return;
        }

        const finalUrl = response.url || targetUrl;
        const rawContentType = response.headers.get('content-type') || '';
        const isM3U8Url = targetUrl.toLowerCase().includes('.m3u8') || targetUrl.toLowerCase().includes('.m3u') || rawContentType.includes('mpegurl') || rawContentType.includes('m3u') || finalUrl.toLowerCase().includes('.m3u8');

        if (isM3U8Url || rawContentType.includes('text/') || rawContentType.includes('application/x-mpegurl')) {
          let text = await response.text();
          const trimmedText = text.trim();

          if (trimmedText.startsWith('#EXTM3U') || isM3U8Url) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            const baseUrl = new URL(finalUrl);

            const lines = text.split('\n').map(line => {
              const trimmed = line.trim();
              if (!trimmed) return line;

              if (trimmed.startsWith('#')) {
                return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
                  try {
                    const abs = new URL(uri, baseUrl).href;
                    return `URI="/api/stream-proxy?url=${encodeURIComponent(abs)}"`;
                  } catch (e) {
                    return match;
                  }
                });
              }

              if (trimmed.startsWith('/api/stream-proxy')) {
                return trimmed;
              }

              try {
                const absoluteUrl = new URL(trimmed, baseUrl).href;
                return `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
              } catch (e) {
                return trimmed;
              }
            });

            res.status(200).send(lines.join('\n'));
            return;
          }
        }

        res.setHeader('Content-Type', rawContentType || 'video/mp2t');

        if (response.headers.get('content-length')) {
          res.setHeader('Content-Length', response.headers.get('content-length')!);
        }
        if (response.headers.get('content-range')) {
          res.setHeader('Content-Range', response.headers.get('content-range')!);
        }
        if (response.headers.get('accept-ranges')) {
          res.setHeader('Accept-Ranges', response.headers.get('accept-ranges')!);
        }

        res.status(response.status);

        if (response.body) {
          const nodeStream = Readable.fromWeb(response.body as any);
          nodeStream.pipe(res);
        } else {
          const arrayBuffer = await response.arrayBuffer();
          res.send(Buffer.from(arrayBuffer));
        }

      } catch (err: any) {
        clearTimeout(timeout);
        res.status(502).send(`Stream fetch failed: ${err.message}`);
      }
    } catch (error: any) {
      res.status(500).send(`Stream proxy error: ${error.message}`);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.includes('.') || url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(_dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = await injectMetaTags(template, url);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        html = await injectMetaTags(html, req.url);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
