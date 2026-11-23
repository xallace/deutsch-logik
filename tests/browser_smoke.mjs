/* Headless Edge CDP Smoke & Interaction Test for DEUTSCH·LOGIK
   Verifies desktop (1440px) and mobile (390px), all 5 tabs, interactive labs,
   Word X-Ray, Gender Detector, Tile Constructor, SRS, 0 console/network errors. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8'
};

function findEdge() {
  const cands = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of cands) if (fs.existsSync(p)) return p;
  throw new Error('Edge/Chrome not found');
}

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const full = path.resolve(root, rel);
      if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const ext = path.extname(full).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(full).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

async function runCDP(url) {
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'dl_edge_'));
  const port = 9222 + Math.floor(Math.random() * 400);
  const exe = findEdge();
  const proc = spawn(exe, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${port}`, `--user-data-dir=${tmpProfile}`, 'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
      const page = list.find(t => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  assert.ok(wsUrl, 'CDP page websocket not found');

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let seq = 1;
  const pending = new Map();
  const consoleErrors = [];
  const failedReqs = [];

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text || 'Exception');
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    } else if (msg.method === 'Network.loadingFailed') {
      if (msg.params.errorText !== 'net::ERR_ABORTED') {
        failedReqs.push(msg.params.errorText);
      }
    }
  });

  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = seq++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalJS = async (expr) => {
    const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };

  try {
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Network.enable');

    for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 600 });
      await cdp('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 700));
      const overflow = await evalJS(`document.documentElement.scrollWidth > window.innerWidth + 1`);
      assert.equal(overflow, false, `Horizontal overflow at ${vp.w}px`);
    }

    // Desktop interactive flow across all 5 tabs
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    // Tab 2: Story A0 + Word X-Ray (verify no Отметить/Понял button)
    await evalJS(`DL_UI.goTab('story')`);
    await new Promise(r => setTimeout(r, 200));
    const storyCards = await evalJS(`document.querySelectorAll('.sentence-card').length`);
    assert.equal(storyCards, 20);
    const hasMarkBtn = await evalJS(`document.body.innerText.includes('Отметить')`);
    assert.equal(hasMarkBtn, false);
    await evalJS(`document.querySelector('.tok-word[data-word="Kaffeemaschine"]').click()`);
    const xrayText = await evalJS(`document.getElementById('xray-slot').innerText`);
    assert.match(xrayText, /Kaffeemaschine/);

    // Tab 3: 3D Lab + Gender Detector + 21-Rule Codex
    for (const sub of ['space', 'frame', 'compound', 'verbs', 'codex']) {
      await evalJS(`DL_UI.goLab('${sub}')`);
      await new Promise(r => setTimeout(r, 200));
    }
    await evalJS(`DL_UI.goLab('compound')`);
    await evalJS(`DL_UI.onGenderInput('Zeitung')`);
    const detTxt = await evalJS(`document.getElementById('gender-result').innerText`);
    assert.match(detTxt, /DIE/i);
    await evalJS(`DL_UI.goLab('codex')`);
    const codexCards = await evalJS(`document.querySelectorAll('.rule-card').length`);
    assert.equal(codexCards, 21);

    // Tab 4: Practice (Beim Arzt + Quiz + Tiles)
    await evalJS(`DL_UI.goTab('practice')`);
    await evalJS(`DL_UI.setPracSub('quiz')`);
    await evalJS(`DL_UI.answerQuiz('d1', 1)`);
    await evalJS(`DL_UI.setPracSub('tiles')`);
    await evalJS(`['Ich','mache','die Augen','auf.'].forEach(w => DL_UI.addTile('c5', w)); DL_UI.checkTiles('c5');`);
    const tileOk = await evalJS(`document.body.innerText.includes('Отлично!')`);
    assert.equal(tileOk, true);

    // Tab 5: Stateless endless 2-button card drill
    await evalJS(`DL_UI.goTab('srs')`);
    await evalJS(`DL_UI.revealSrs()`);
    const hasTwoBtns = await evalJS(`document.body.innerText.includes('Ещё раз') && document.body.innerText.includes('Окей') && !document.body.innerText.includes('JSON')`);
    assert.equal(hasTwoBtns, true);
    await evalJS(`DL_UI.gradeSrs(false)`); // "Ещё раз" keeps card in queue (28)
    await evalJS(`DL_UI.revealSrs(); DL_UI.gradeSrs(true);`); // "Окей" removes card (27)
    const remainingTxt = await evalJS(`document.body.innerText.includes('В круге: 27')`);
    assert.equal(remainingTxt, true);
    const lsEmpty = await evalJS(`localStorage.length === 0`);
    assert.equal(lsEmpty, true);

    assert.deepEqual(consoleErrors, [], `Console errors: ${consoleErrors.join('; ')}`);
    assert.deepEqual(failedReqs, [], `Failed network requests: ${failedReqs.join('; ')}`);
    console.log('[PASS] Headless Edge smoke test passed (390px + 1440px, all 5 tabs, 0 errors).');
  } finally {
    ws.close();
    proc.kill();
    await new Promise(r => setTimeout(r, 350));
    try { fs.rmSync(tmpProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 }); } catch {}
  }
}

const { srv, port } = await startServer();
try {
  await runCDP(`http://127.0.0.1:${port}/`);
} finally {
  srv.close();
}
