/* Node logic, corpus, and audio manifest verification for DEUTSCH·LOGIK */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const E = require(path.join(root, 'js', 'engine.js'));
const D = require(path.join(root, 'data', 'curriculum.js'));

const G = {};
new Function('window', fs.readFileSync(path.join(root, 'data', 'audio_manifest.js'), 'utf8'))(G);
const AUDIO = G.DL_AUDIO;

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  [PASS] ${name}`);
}

check('curriculum covers 4 system modules, 21 rules, 20 A0 story sentences, 8 Arzt lines', () => {
  assert.equal(D.SYSTEM_MODULES.length, 4);
  assert.equal(D.RULES.length, 21);
  assert.equal(D.STORY_A0.chapters.length, 4);
  assert.equal(D.STORY_A0.sentences.length, 20);
  assert.equal(D.SURVIVAL_ARZT.dialogue.length, 8);
  assert.equal(D.SURVIVAL_ARZT.vocab.length, 8);
  assert.equal(D.DIAGNOSTICS.length, 12);
  assert.equal(D.CONSTRUCTORS.length, 6);
});

check('DaF colorizer handles Dativ feminine "in der Küche" as g-die (red)', () => {
  const toks = E.colorizeTokens('Ich bin in der Küche.');
  const derTok = toks.find(t => t.word && t.text === 'der');
  const kucheTok = toks.find(t => t.word && t.text === 'Küche');
  assert.equal(derTok.cls, 'g-die');
  assert.equal(kucheTok.cls, 'g-die');
});

check('DaF colorizer handles Akkusativ masculine "auf den Tisch" as g-der (blue)', () => {
  const toks = E.colorizeTokens('Ich lege den Hausschlüssel auf den Tisch.');
  const tischTok = toks.find(t => t.word && t.text === 'Tisch');
  const schluesselTok = toks.find(t => t.word && t.text === 'Hausschlüssel');
  assert.equal(tischTok.cls, 'g-der');
  assert.equal(schluesselTok.cls, 'g-der');
});

check('Word X-Ray splits Komposita and detects Dativ context & separable prefixes', () => {
  const km = E.inspectWord('Kaffeemaschine', 'Die Kaffeemaschine ist neu.');
  assert.equal(km.cls, 'g-die');
  assert.deepEqual(km.parts, ['der Kaffee', 'die Maschine']);

  const datDer = E.inspectWord('der', 'Ich bin in der Küche.');
  assert.equal(datDer.cls, 'g-die');
  assert.match(datDer.badge, /DATIV/);

  const sepAuf = E.inspectWord('auf', 'Ich stehe auf.');
  assert.match(sepAuf.badge, /ПРИСТАВКА/);
});

check('Gender detector recognizes suffixes (-ung/-chen/-or/-ismus) and unseen compound tails', () => {
  assert.equal(E.detectNounGender('Mädchen').art, 'das');
  assert.equal(E.detectNounGender('Zeitung').art, 'die');
  assert.equal(E.detectNounGender('Möglichkeit').art, 'die');
  assert.equal(E.detectNounGender('Dokument').art, 'das');
  assert.equal(E.detectNounGender('Optimismus').art, 'der');
  assert.equal(E.detectNounGender('Autotürschlüssel').art, 'der');
  assert.equal(E.detectNounGender('Teemaschine').art, 'die');
});

check('Tile sentence constructor validates word order cleanly', () => {
  const c = D.CONSTRUCTORS[0];
  assert.equal(E.checkTileSentence(['Ich', 'muss', 'heute früh', 'arbeiten.'], c.answers).ok, true);
  assert.equal(E.checkTileSentence(['Ich', 'heute früh', 'muss', 'arbeiten.'], c.answers).ok, false);
});

check('All Story A0, Rules, and Beim Arzt audio clips exist on disk in audio/', () => {
  const checkClip = (text, rate) => {
    const rel = AUDIO[`${text}|${rate}`] || AUDIO[text];
    assert.ok(rel, `Missing audio manifest entry for: ${text} (${rate})`);
    const full = path.join(root, rel);
    assert.ok(fs.existsSync(full), `Missing mp3 file: ${full}`);
    assert.ok(fs.statSync(full).size > 200, `Empty mp3 file: ${full}`);
  };
  for (const s of D.STORY_A0.sentences) {
    checkClip(s.de, '-6%');
  }
  for (const r of D.RULES) {
    for (const ex of r.examples) checkClip(ex.de, '-10%');
  }
  for (const l of D.SURVIVAL_ARZT.dialogue) {
    checkClip(l.de, '+0%');
  }
});

console.log(`\n[ALL PASS] ${passed} verification checks passed.`);
