"""Asset & Audio Bundler for Deutsch-Logik Suite (standalone DE-RU app).
Copies vendored Three.js + OFL fonts and collects all pre-synthesized Edge-TTS
MP3 clips from DE_RU_YouTube_Lab (Workflows B, C, D, E) into audio/ + data/audio_manifest.js.
"""
import asyncio
import hashlib
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
APP_ROOT = os.path.dirname(HERE)
WFD_ROOT = os.path.dirname(APP_ROOT)
LAB_ROOT = os.path.dirname(WFD_ROOT)
TR_VENDOR = r'G:\My Drive\agy\01_demos\turkish-reader\vendor'

sys.path.insert(0, WFD_ROOT)
sys.path.insert(0, os.path.join(LAB_ROOT, 'workflow_c_grammar_xray'))

import build_a0_story as WFD  # noqa: E402
import shorts_engine as WFC1  # noqa: E402
import packs_data as WFC2  # noqa: E402


def clip_key(text, voice, rate):
    return hashlib.sha1(f'{voice}|{rate}|{text}'.encode('utf-8')).hexdigest()[:14]


def collect_available_mp3s():
    dirs = [
        os.path.join(WFD_ROOT, 'clips'),
        os.path.join(LAB_ROOT, 'workflow_c_grammar_xray', 'clips'),
        os.path.join(LAB_ROOT, 'workflow_b_survival', 'clips'),
        os.path.join(LAB_ROOT, 'workflow_e_human_voice', '01_magisches_wort_doch', 'tts_clips_cache'),
    ]
    found = {}
    for d in dirs:
        if os.path.isdir(d):
            for fn in os.listdir(d):
                if fn.lower().endswith('.mp3'):
                    found[fn[:-4]] = os.path.join(d, fn)
    return found


def copy_vendor():
    dst_three = os.path.join(APP_ROOT, 'vendor', 'three')
    dst_fonts = os.path.join(APP_ROOT, 'vendor', 'fonts')
    os.makedirs(dst_three, exist_ok=True)
    os.makedirs(dst_fonts, exist_ok=True)
    for fn in ('three.min.js', 'OrbitControls.js', 'LICENSE'):
        shutil.copy2(os.path.join(TR_VENDOR, 'three', fn), os.path.join(dst_three, fn))
    for fn in os.listdir(os.path.join(TR_VENDOR, 'fonts')):
        if fn.endswith('.woff2') or fn in ('OFL.txt', 'xallace-type.css'):
            shutil.copy2(os.path.join(TR_VENDOR, 'fonts', fn), os.path.join(dst_fonts, fn))
    print('[OK] Copied vendor/three and vendor/fonts')


async def synth_missing(missing_items, dst_audio):
    if not missing_items:
        return
    import edge_tts
    print(f'[INFO] Synthesizing {len(missing_items)} missing German clips via edge-tts...')
    for entry in missing_items:
        out = os.path.join(dst_audio, entry['hash'] + '.mp3')
        for attempt in range(1, 6):
            try:
                await edge_tts.Communicate(entry['text'], voice=entry['voice'], rate=entry['rate']).save(out + '.tmp')
                os.replace(out + '.tmp', out)
                await asyncio.sleep(0.35)
                break
            except Exception as e:
                print(f'  retry {attempt} ({entry["text"]}): {e}')
                await asyncio.sleep(1.0)


def main():
    copy_vendor()
    avail = collect_available_mp3s()
    dst_audio = os.path.join(APP_ROOT, 'audio')
    os.makedirs(dst_audio, exist_ok=True)

    requests = []

    def add_req(text, voice, rate, tag):
        if not text:
            return
        h = clip_key(text, voice, rate)
        requests.append({'text': text, 'voice': voice, 'rate': rate, 'hash': h, 'tag': tag})

    DE_V = 'de-DE-ConradNeural'
    KATJA = 'de-DE-KatjaNeural'

    # 1. Story A0 sentences (normal -6%) + chapters + rule recap examples
    for ch in WFD.CHAPTERS:
        de_ch = ch['de_title'].split('·', 1)[-1].strip() + '.'
        add_req(de_ch, DE_V, '-10%', f'ch_{ch["num"]}')
    for s in WFD.SENTENCES:
        add_req(s['de'], DE_V, '-6%', f'story_{s["n"]}_norm')
    for r in WFD.RECAP_RULES:
        for ex in (r['ex1'], r['ex2']):
            if '→' not in ex and '·' not in ex:
                add_req(ex, DE_V, '-8%', f'recap_{r["num"]}')

    # 2. Workflow C Episodes 01-04 + 05-20 DE examples
    for ep in WFC1.EPISODES:
        for sc in ep['scenes']:
            if sc.get('de'):
                add_req(sc['de'], DE_V, '-10%', f'wfc_{ep["id"]}')
    for pack in WFC2.PACKS:
        for ep in pack['episodes']:
            for sc in ep['scenes']:
                if sc.get('de'):
                    add_req(sc['de'], DE_V, '-10%', f'wfc_{ep["id"]}')

    # 3. Workflow E 'doch' episode
    with open(os.path.join(LAB_ROOT, 'workflow_e_human_voice', '01_magisches_wort_doch', 'episode.json'), 'r', encoding='utf-8') as f:
        doch_ep = json.load(f)
    for sc in doch_ep['scenes']:
        for item in sc.get('tts_clips', []):
            txt, lang, rate = item[0], item[1], item[2]
            if lang == 'de':
                add_req(txt, DE_V, rate, 'wfe_doch')

    # 4. Workflow B 'Beim Arzt' dialogue (exact speaker voices & normal rate from build_survival.py)
    with open(os.path.join(LAB_ROOT, 'workflow_b_survival', 'beim_arzt.json'), 'r', encoding='utf-8') as f:
        arzt = json.load(f)
    for line in arzt['dialogue']:
        v = arzt['speakers'][line['spk']]['voice']
        add_req(line['de'], v, '+0%', f'arzt_{line["n"]}_norm')

    # 5. Extra key interactive sandbox sentences (Wo/Wohin, Inversion, TeKaMoLo, Komposita)
    sandbox_extras = [
        ('Ich lege das Buch in die Kiste.', DE_V, '-10%'),
        ('Das Buch liegt in der Kiste.', DE_V, '-10%'),
        ('Ich lege das Buch auf den Tisch.', DE_V, '-10%'),
        ('Das Buch liegt auf dem Tisch.', DE_V, '-10%'),
        ('Ich schiebe das Buch unter den Tisch.', DE_V, '-10%'),
        ('Das Buch liegt unter dem Tisch.', DE_V, '-10%'),
        ('Ich stelle das Buch neben die Kiste.', DE_V, '-10%'),
        ('Das Buch steht neben der Kiste.', DE_V, '-10%'),
        ('Ich stelle die Flasche auf den Tisch.', DE_V, '-10%'),
        ('Die Flasche steht auf dem Tisch.', DE_V, '-10%'),
        ('Ich lege das Handy auf den Tisch.', DE_V, '-10%'),
        ('Das Handy liegt auf dem Tisch.', DE_V, '-10%'),
        ('Ich fahre heute wegen der Arbeit mit dem Zug nach München.', DE_V, '-10%'),
        ('Morgen kaufe ich Brot.', DE_V, '-10%'),
        ('Kommst du heute nicht mit? Doch!', DE_V, '-10%'),
        ('Kommst du heute nicht mit? — Doch!', DE_V, '-10%'),
        ('Du hast keine Zeit! Doch, ich habe Zeit!', DE_V, '-10%'),
        ('Du hast keine Zeit! — Doch, ich habe Zeit!', DE_V, '-10%'),
        ('Komm rein! Komm doch rein!', DE_V, '-10%'),
        ('Komm doch rein!', DE_V, '-10%'),
        ('Hier gibt es einen Supermarkt.', DE_V, '-10%'),
        ('Ich fahre nach Deutschland.', DE_V, '-10%'),
        ('Ich gehe nach Hause.', DE_V, '-10%'),
        ('Ich fahre heute wegen der Arbeit...', DE_V, '-10%'),
        ('...mit dem Zug nach München.', DE_V, '-10%'),
    ]
    for t, v, r in sandbox_extras:
        add_req(t, v, r, 'sandbox')

    manifest = {}
    missing = []
    copied = 0
    for req in requests:
        h = req['hash']
        dst = os.path.join(dst_audio, h + '.mp3')
        if not os.path.exists(dst):
            if h in avail:
                shutil.copy2(avail[h], dst)
                copied += 1
            else:
                missing.append(req)
        key_id = f'{req["text"]}|{req["rate"]}'
        manifest[key_id] = f'audio/{h}.mp3'

    # Deduplicate missing by hash
    uniq_missing = list({m['hash']: m for m in missing}.values())
    if uniq_missing:
        asyncio.run(synth_missing(uniq_missing, dst_audio))

    # Re-verify every file exists and write JS manifest
    final_map = {}
    for req in requests:
        h = req['hash']
        dst = os.path.join(dst_audio, h + '.mp3')
        if os.path.exists(dst) and os.path.getsize(dst) > 200:
            final_map[f'{req["text"]}|{req["rate"]}'] = f'audio/{h}.mp3'
            # Also register default lookup by plain text if not set or prefer normal rate
            if req['text'] not in final_map or req['rate'] in ('-6%', '-10%', '+0%'):
                final_map[req['text']] = f'audio/{h}.mp3'

    out_js = os.path.join(APP_ROOT, 'data', 'audio_manifest.js')
    os.makedirs(os.path.dirname(out_js), exist_ok=True)
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated by tools/bundle_assets.py\n')
        f.write('window.DL_AUDIO = ' + json.dumps(final_map, ensure_ascii=False, indent=2) + ';\n')

    total_mp3 = len([x for x in os.listdir(dst_audio) if x.endswith('.mp3')])
    mb = sum(os.path.getsize(os.path.join(dst_audio, x)) for x in os.listdir(dst_audio) if x.endswith('.mp3')) / 1e6
    print(f'[OK] Audio ready: {total_mp3} mp3 files ({mb:.2f} MB), copied={copied}, synthesized={len(uniq_missing)}, manifest_keys={len(final_map)}')


if __name__ == '__main__':
    main()
