'use strict';

/**
 * TransGlobe Insurance 示範入口網站的零框架 Node HTTP 伺服器。
 *
 * 從 ../public 提供靜態資源，並提供兩個小型 JSON API
 * （保單查詢及報價計算），全部以記憶體內資料支援。
 * 因為沒有任何外部網路呼叫，應用程式可完全離線運作 —
 * 這也讓 Playwright 執行快速且具確定性。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { POLICIES } = require('./data/policies');
const { validateQuoteInput, computeQuote } = require('./quote');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || '127.0.0.1';

// 固定（非隨機）的人為延遲，讓 UI 擁有寫實但完全確定的
// 載入狀態，以便在工作廧練習中示範正確與脆弱的等待策略。
const SEARCH_LATENCY_MS = Number(process.env.SEARCH_LATENCY_MS) || 200;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const MAX_BODY_BYTES = 1024 * 1024; // 1MB，防止失控的過大 payload
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function matchesQuery(policy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    policy.policyNumber.toLowerCase().includes(needle) ||
    policy.holderName.toLowerCase().includes(needle)
  );
}

function matchesProduct(policy, product) {
  if (!product || product.toLowerCase() === 'all') return true;
  return policy.product.toLowerCase() === product.toLowerCase();
}

function matchesStatus(policy, status) {
  if (!status || status.toLowerCase() === 'all') return true;
  return policy.status.toLowerCase() === status.toLowerCase();
}

function handleSearchPolicies(req, res, requestUrl) {
  const query = requestUrl.searchParams.get('q') || '';
  const product = requestUrl.searchParams.get('product') || 'all';
  const status = requestUrl.searchParams.get('status') || 'all';

  const results = POLICIES.filter(
    (policy) => matchesQuery(policy, query) && matchesProduct(policy, product) && matchesStatus(policy, status),
  );

  // 確定性、固定延遲的回應，用來模擬真實網路呼叫，
  // 又不會將不穩定／隨機的時間因素帶入測試套件。
  setTimeout(() => {
    sendJson(res, 200, { count: results.length, results });
  }, SEARCH_LATENCY_MS);
}

async function handleQuote(req, res) {
  let payload;
  try {
    payload = await readRequestBody(req);
  } catch (err) {
    sendJson(res, 400, { errors: { form: 'Invalid request payload.' } });
    return;
  }

  const { valid, errors } = validateQuoteInput(payload);
  if (!valid) {
    sendJson(res, 400, { errors });
    return;
  }

  const quote = computeQuote(payload);
  sendJson(res, 200, { quote });
}

function serveStaticFile(req, res, requestUrl) {
  let relativePath = decodeURIComponent(requestUrl.pathname);
  if (relativePath === '/') relativePath = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // 防止路徑遭離到 public 目錄以外。
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, '404.html'), (notFoundErr, notFoundData) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(notFoundErr ? 'Not found' : notFoundData);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function requestListener(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (requestUrl.pathname === '/api/policies' && req.method === 'GET') {
    handleSearchPolicies(req, res, requestUrl);
    return;
  }

  if (requestUrl.pathname === '/api/quote' && req.method === 'POST') {
    handleQuote(req, res).catch(() => sendJson(res, 500, { errors: { form: 'Unexpected server error.' } }));
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStaticFile(req, res, requestUrl);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
}

const server = http.createServer(requestListener);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`TransGlobe Insurance demo portal listening on http://${HOST}:${PORT}`);
  });
}

module.exports = { server, PORT, HOST };
