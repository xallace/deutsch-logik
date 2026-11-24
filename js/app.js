/* DEUTSCH·LOGIK SPA Controller */
(function () {
  'use strict';

  var E = window.DL_ENGINE;
  var D = window.DL_DATA;
  var AUDIO_MAP = window.DL_AUDIO || {};

  // Pure in-memory view state (stateless lab, no progress tracking or persistence)
  var P = {
    tab: 'map',
    labSub: 'space',
    pracSub: 'arzt',
    storyCh: 0,
    showAllRu: false
  };

  // ---------- Audio Player (Edge-TTS MP3 manifest + Web Speech fallback) ----------
  var currentAudio = null;
  var immersionTimer = null;
  var immersionPlaying = false;
  var immersionIdx = -1;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function resolveAudioSrc(text) {
    var ratePref = ['-6%', '-10%', '+0%', '-8%'];
    for (var i = 0; i < ratePref.length; i++) {
      var k = text + '|' + ratePref[i];
      if (AUDIO_MAP[k]) return AUDIO_MAP[k];
    }
    return AUDIO_MAP[text] || null;
  }

  function playGerman(text, onEnd) {
    stopAudio();
    var src = resolveAudioSrc(text);
    if (src) {
      var aud = new Audio(src);
      currentAudio = aud;
      if (onEnd) {
        aud.onended = function () { if (currentAudio === aud) onEnd(); };
        aud.onerror = function () { if (currentAudio === aud) onEnd(); };
      }
      var p = aud.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { if (onEnd) onEnd(); });
      }
      return true;
    }
    // Web Speech API fallback for dynamic custom combos
    if (window.speechSynthesis && typeof SpeechSynthesisUtterance === 'function') {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = 0.96;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
      return true;
    }
    if (onEnd) setTimeout(onEnd, 600);
    return false;
  }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderColoredTokensHTML(sentence, sentIndex) {
    var toks = E.colorizeTokens(sentence);
    return toks.map(function (t) {
      if (!t.word) return esc(t.text);
      return '<span class="tok-word ' + esc(t.cls) + '" data-word="' + esc(t.text) + '" data-sent="' + esc(sentence) + '"' +
        (sentIndex !== undefined ? ' data-si="' + sentIndex + '"' : '') + '>' + esc(t.text) + '</span>';
    }).join('');
  }

  function accentClass(acc) {
    if (acc === 'der') return 'der';
    if (acc === 'die') return 'die';
    if (acc === 'das') return 'das';
    return 'ochre';
  }

  function buildAllDrillCards() {
    var cards = [];
    D.STORY_A0.sentences.forEach(function (s) {
      cards.push({ id: 'st_' + s.n, de: s.de, ru: s.ru, note: s.hint, src: 'История A0 · #' + s.n });
    });
    D.SURVIVAL_ARZT.vocab.forEach(function (v, idx) {
      cards.push({ id: 'ar_' + idx, de: v.de, ru: v.ru, note: v.note, src: 'У врача (Workflow B)' });
    });
    return cards;
  }

  var ALL_DRILL_CARDS = buildAllDrillCards();
  var drillQueue = ALL_DRILL_CARDS.slice();

  function shuffleArray(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  // ---------- Stage3D Lifecycle ----------
  var stageCtrl = null;
  function destroyStage() {
    if (stageCtrl) {
      stageCtrl.dispose();
      stageCtrl = null;
    }
  }

  // ---------- Word X-Ray State ----------
  var currentXray = null;
  function openXray(word, sentence) {
    currentXray = E.inspectWord(word, sentence);
    var box = document.getElementById('xray-slot');
    if (box) box.innerHTML = renderXrayBannerHTML();
  }

  function renderXrayBannerHTML() {
    if (!currentXray) {
      return '<div class="xray-banner" style="border-color:var(--border)"><span class="mono dim">WORD X-RAY ·</span> <span class="muted">Кликните на любое немецкое слово в предложении, чтобы увидеть род, падеж, разбор композита или роль приставки.</span></div>';
    }
    var x = currentXray;
    return '<div class="xray-banner">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<div><span class="pill ' + esc(x.cls ? x.cls.replace('g-', '') : 'ochre') + '">' + esc(x.badge) + '</span> ' +
      '<strong class="de-text ' + esc(x.cls) + '" style="margin-left:8px">' + esc(x.word) + '</strong></div>' +
      '<div class="row">' +
      '<button onclick="DL_UI.speak(\'' + esc(x.word).replace(/'/g, "\\'") + '\')">▶ Произношение</button>' +
      (x.lab ? '<button class="btn-der" onclick="DL_UI.jumpLab(\'' + esc(x.lab) + '\')">Открыть в 3D-Лаборатории →</button>' : '') +
      '<button onclick="DL_UI.closeXray()">✕</button>' +
      '</div></div>' +
      '<div style="margin-top:8px"><strong>' + esc(x.title) + '</strong>' +
      (x.parts ? ' <span class="mono muted">[' + esc(x.parts.join(' + ')) + ']</span>' : '') +
      (x.plural ? ' <span class="mono dim">· ' + esc(x.plural) + '</span>' : '') +
      '</div>' +
      '<p class="muted" style="margin-top:4px;font-size:0.92rem">' + esc(x.explanation) + '</p>' +
      '</div>';
  }

  // ---------- Render Views ----------
  var viewEl = null;

  function renderTopNav() {
    var tabs = [
      { id: 'map', label: '1 · Карта логики' },
      { id: 'story', label: '2 · История A0' },
      { id: 'lab', label: '3 · 3D-Лаборатория' },
      { id: 'practice', label: '4 · Диалог и Практика' },
      { id: 'srs', label: '5 · Карточки' }
    ];
    document.getElementById('nav-tabs').innerHTML = tabs.map(function (t) {
      return '<button class="nav-tab ' + (P.tab === t.id ? 'active' : '') + '" data-tab="' + t.id + '">' + esc(t.label) + '</button>';
    }).join('');
  }

  function renderMap() {
    var html = '<div class="opener-stage"><section class="hero">' +
      '<span class="pill die">ПАРАЛЛЕЛЬНАЯ ВСЕЛЕННАЯ DE ↔ RU · A0–B1</span>' +
      '<h1>Немецкий как 3D&#8209;механизм,<br>а не зубрёжка</h1>' +
      '<p>Физическая и пространственная логика немецкого языка для русскоязычных: почему глагол улетает в конец, как геометрия отличает <em>auf den Tisch</em> от <em>auf dem Tisch</em>, как устроены длинные слова и зачем немцам слово <em>doch</em>.</p>' +
      '<div class="hero-actions">' +
      '<button class="primary" onclick="DL_UI.goTab(\'story\')">▶ История A0 (20 фраз)</button>' +
      '<button class="btn-der" onclick="DL_UI.goLab(\'space\')">3D-Лаборатория →</button>' +
      '<button class="btn-das" onclick="DL_UI.goTab(\'practice\')">Диалог и Практика</button>' +
      '</div>' +
      '<div class="stats-grid">' +
      '<button class="stat-box" onclick="DL_UI.goTab(\'story\')"><div class="stat-val g-das">' + D.STORY_A0.sentences.length + '</div><div class="stat-lbl">фраз в Истории A0<br>с рентгеном слов</div></button>' +
      '<button class="stat-box" onclick="DL_UI.goLab(\'codex\')"><div class="stat-val g-der">' + D.RULES.length + '</div><div class="stat-lbl">урок логики<br>в Кодексе DE ↔ RU</div></button>' +
      '<button class="stat-box" onclick="DL_UI.goLab(\'space\')"><div class="stat-val g-die">' + D.SYSTEM_MODULES.length + '</div><div class="stat-lbl">интерактивных<br>3D-симулятора</div></button>' +
      '<button class="stat-box" onclick="DL_UI.goTab(\'srs\')"><div class="stat-val g-ochre">' + ALL_DRILL_CARDS.length + '</div><div class="stat-lbl">карточек для<br>быстрой тренировки</div></button>' +
      '</div>' +
      '</section></div>';

    viewEl.innerHTML = html;
  }

  // ---------- Story A0 Studio ----------
  var revealedHints = {};

  function stopImmersion() {
    immersionPlaying = false;
    immersionIdx = -1;
    if (immersionTimer) { clearTimeout(immersionTimer); immersionTimer = null; }
    stopAudio();
    if (P.tab === 'story') renderStory();
  }

  function playImmersionFrom(idx) {
    var list = D.STORY_A0.sentences;
    if (idx >= list.length) {
      stopImmersion();
      return;
    }
    immersionPlaying = true;
    immersionIdx = list[idx].n;
    renderStory();
    var card = document.querySelector('[data-story-n="' + immersionIdx + '"]');
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playGerman(list[idx].de, function () {
      if (!immersionPlaying) return;
      immersionTimer = setTimeout(function () {
        playImmersionFrom(idx + 1);
      }, 650);
    });
  }

  function renderStory() {
    var html = '<div class="card card-pad" style="margin-bottom:14px;border-top:3px solid var(--accent)">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap">' +
      '<div><span class="pill die">WORKFLOW D · ИСТОРИЯ A0 (7 ПРАВИЛ В 1)</span>' +
      '<h2 style="font-family:var(--font-serif);font-size:1.55rem;margin-top:8px">' + esc(D.STORY_A0.title_de) + '</h2>' +
      '<p class="muted">' + esc(D.STORY_A0.title_ru) + ' — кликните на любое немецкое слово для рентгена</p></div>' +
      '<div class="row">' +
      (immersionPlaying
        ? '<button class="btn-die" onclick="DL_UI.stopImmersion()">■ Остановить погружение</button>'
        : '<button class="primary" onclick="DL_UI.startImmersion()">▶ 100% Погружение (вся история)</button>') +
      '<button onclick="DL_UI.toggleAllRu()">' + (P.showAllRu ? 'Скрыть переводы' : 'Показать все переводы') + '</button>' +
      '</div></div></div>';

    html += '<div id="xray-slot">' + renderXrayBannerHTML() + '</div>';

    html += '<div class="chapter-tabs">' +
      '<button class="' + (P.storyCh === 0 ? 'active' : '') + '" onclick="DL_UI.setStoryCh(0)">Все 20 фраз</button>' +
      D.STORY_A0.chapters.map(function (c) {
        return '<button class="' + (P.storyCh === c.num ? 'active' : '') + '" onclick="DL_UI.setStoryCh(' + c.num + ')">Глава ' + c.num + '</button>';
      }).join('') +
      '</div>';

    var sents = D.STORY_A0.sentences.filter(function (s) { return P.storyCh === 0 || s.ch === P.storyCh; });
    var chMap = {};
    D.STORY_A0.chapters.forEach(function (c) { chMap[c.num] = c; });

    var lastCh = -1;
    sents.forEach(function (s) {
      if (s.ch !== lastCh) {
        lastCh = s.ch;
        var chObj = chMap[s.ch];
        html += '<div style="margin:16px 0 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
          '<div><strong class="mono g-der">' + esc(chObj.de) + '</strong> <span class="muted">· ' + esc(chObj.ru) + '</span></div>' +
          '<button style="padding:4px 10px;font-size:0.78rem" onclick="DL_UI.speak(\'' + esc(chObj.audio_de).replace(/'/g, "\\'") + '\')">▶ Название главы</button>' +
          '</div>';
      }
      var showHint = P.showAllRu || revealedHints[s.n];
      html += '<article class="sentence-card ' + (immersionIdx === s.n ? 'active-play' : '') + '" data-story-n="' + s.n + '" style="border-left-color:var(--' + s.accent + ')">' +
        '<div class="sentence-top">' +
        '<div class="row"><span class="pill ' + s.accent + '">' + esc(s.tag) + '</span> <span class="mono dim">#' + (s.n < 10 ? '0' : '') + s.n + '/20</span></div>' +
        '<div class="audio-controls">' +
        '<button onclick="DL_UI.toggleHint(' + s.n + ')">' + (showHint ? '👁 Скрыть' : '💡 Перевод и логика') + '</button>' +
        '<button class="btn-der" onclick="DL_UI.speak(\'' + esc(s.de).replace(/'/g, "\\'") + '\')">▶ Слушать</button>' +
        '</div></div>' +
        '<div class="de-text">' + renderColoredTokensHTML(s.de, s.n) + '</div>' +
        (showHint ? '<div class="hint-box"><div><strong>' + esc(s.ru) + '</strong></div>' +
          '<div class="muted" style="font-size:0.9rem;margin-top:4px">' + esc(s.hint) + '</div>' +
          '<div class="row" style="margin-top:8px"><button style="padding:4px 10px;font-size:0.78rem" onclick="DL_UI.openRule(\'' + s.rule + '\')">Разобрать правило #' + s.rule + ' в Кодексе →</button></div></div>' : '') +
        '</article>';
    });

    viewEl.innerHTML = html;
  }

  // ---------- 3D Lab + 21-Rule Codex ----------
  var labFilter = 'all';
  var labSearch = '';
  var genderInput = 'Kaffeemaschine';

  function renderLab() {
    var subtabs = [
      { id: 'space', label: '1 · 3D Пространство (Wo/Wohin)' },
      { id: 'frame', label: '2 · 3D Рамка и Качели' },
      { id: 'compound', label: '3 · 3D Komposita и Род' },
      { id: 'verbs', label: '4 · 3D Глаголы и DOCH' },
      { id: 'codex', label: '5 · Кодекс: все ' + D.RULES.length + ' правил' }
    ];

    var html = '<div class="subtabs">' +
      subtabs.map(function (st) {
        return '<button class="' + (P.labSub === st.id ? 'active' : '') + '" onclick="DL_UI.setLabSub(\'' + st.id + '\')">' + esc(st.label) + '</button>';
      }).join('') + '</div>';

    if (P.labSub === 'codex') {
      destroyStage();
      html += renderCodexHTML();
      viewEl.innerHTML = html;
      return;
    }

    html += '<div class="lab-layout">' +
      '<div class="card"><div class="card-head"><span id="stage-fig">THREE.JS 3D-СИМУЛЯТОР</span>' +
      '<button style="padding:4px 10px;font-size:0.78rem" onclick="DL_UI.replayStage()">↻ Повторить 3D</button></div>' +
      '<div class="stage-wrap" id="stage3d-mount"></div></div>' +
      '<div class="card card-pad" id="lab-controls">' + renderLabControlsHTML() + '</div></div>';

    viewEl.innerHTML = html;

    var mount = document.getElementById('stage3d-mount');
    if (mount && window.DL_STAGE3D) {
      if (!stageCtrl || stageCtrl.el !== mount) {
        destroyStage();
        stageCtrl = new window.DL_STAGE3D(mount);
      }
      syncStageFromControls();
    }
  }

  var labState = {
    spaceQ: 'akk', spacePrep: 'in', spacePosture: 'book',
    frameMode: 'klammer', frameInverted: false, frameConj: 'weil', framePreset: 'will',
    compPreset: 'kaffee',
    verbMode: 'perfekt', verbSub: 'sein'
  };

  function getLabSentenceAndLogic() {
    if (P.labSub === 'space') {
      if (labState.spacePosture === 'bottle') {
        return labState.spaceQ === 'akk'
          ? { de: 'Ich stelle die Flasche auf den Tisch.', ru: 'Я ставлю бутылку (вертикально, куда?) на стол.', rule: 'Вертикаль (stellen) + движение (куда?) → Akkusativ: der Tisch → auf den Tisch.' }
          : { de: 'Die Flasche steht auf dem Tisch.', ru: 'Бутылка стоит (вертикально, где?) на столе.', rule: 'Вертикаль (stehen) + покой (где?) → Dativ: der Tisch → auf dem Tisch.' };
      }
      var map = {
        in: {
          akk: ['Ich lege das Buch in die Kiste.', 'Я кладу книгу (куда?) в коробку.', 'Wohin? (движение внутрь) → Akkusativ: die Kiste остаётся die.'],
          dat: ['Das Buch liegt in der Kiste.', 'Книга лежит (где?) в коробке.', 'Wo? (покой внутри) → Dativ: die Kiste превращается в der Kiste!']
        },
        auf: {
          akk: ['Ich lege das Buch auf den Tisch.', 'Я кладу книгу (куда?) на стол.', 'Wohin? → Akkusativ: мужской род der Tisch меняется на den Tisch.'],
          dat: ['Das Buch liegt auf dem Tisch.', 'Книга лежит (где?) на столе.', 'Wo? → Dativ: der Tisch меняется на dem Tisch.']
        },
        unter: {
          akk: ['Ich schiebe das Buch unter den Tisch.', 'Я задвигаю книгу (куда?) под стол.', 'Wohin? → Akkusativ: unter den Tisch.'],
          dat: ['Das Buch liegt unter dem Tisch.', 'Книга лежит (где?) под столом.', 'Wo? → Dativ: unter dem Tisch.']
        },
        neben: {
          akk: ['Ich stelle das Buch neben die Kiste.', 'Я ставлю книгу (куда?) рядом с коробкой.', 'Wohin? → Akkusativ: neben die Kiste.'],
          dat: ['Das Buch steht neben der Kiste.', 'Книга стоит (где?) рядом с коробкой.', 'Wo? → Dativ: die Kiste → neben der Kiste.']
        }
      };
      var m = map[labState.spacePrep][labState.spaceQ];
      return { de: m[0], ru: m[1], rule: m[2] };
    }
    if (P.labSub === 'frame') {
      if (labState.frameMode === 'klammer') {
        var kp = {
          will: ['Ich will Kaffee trinken.', 'Я хочу выпить кофе.', 'Рамка: модальный глагол will на Поз. 2, инфинитив trinken закрывает рамку в конце.'],
          muss: ['Ich muss heute früh arbeiten.', 'Я должен сегодня рано работать.', 'Всё время/обстоятельства внутри скобок [muss ... arbeiten].'],
          perf: ['Ich habe ein Buch gekauft.', 'Я купил книгу.', 'Perfekt работает по той же рамке: habe (Поз. 2) ... gekauft (конец).'],
          auf: ['Ich stehe um sieben auf.', 'Я встаю в семь часов.', 'Отделяемая приставка auf- отрывается от корня и закрывает рамку!']
        }[labState.framePreset];
        return { de: kp[0], ru: kp[1], rule: kp[2] };
      }
      if (labState.frameMode === 'inversion') {
        return labState.frameInverted
          ? { de: 'Heute gehe ich ins Büro.', ru: 'Сегодня я иду в офис.', rule: 'ИНВЕРСИЯ: «Heute» заняло Позицию 1 → ось Поз. 2 (gehe) не сдвигается, поэтому «ich» перелетело на Поз. 3!' }
          : { de: 'Ich gehe heute ins Büro.', ru: 'Я иду сегодня в офис.', rule: 'ПРЯМОЙ ПОРЯДОК: 1 (Ich) · 2 (gehe) · 3 (heute ins Büro).' };
      }
      if (labState.frameMode === 'catapult') {
        return labState.frameConj === 'weil'
          ? { de: 'Ich bleibe hier, weil ich müde bin.', ru: 'Я остаюсь здесь, потому что я устал.', rule: 'КАТАПУЛЬТА: союз weil отправляет глагол bin с 2-го места в самый конец!' }
          : { de: 'Ich bleibe hier, denn ich bin müde.', ru: 'Я остаюсь здесь, так как я устал.', rule: 'СПАСАТЕЛЬ DENN: союз denn стоит на Поз. 0 и сохраняет прямой порядок (ich bin müde).' };
      }
      return { de: 'Ich fahre heute wegen der Arbeit mit dem Zug nach München.', ru: 'Я еду сегодня из-за работы на поезде в Мюнхен.', rule: 'Te (heute) → Ka (wegen der Arbeit) → Mo (mit dem Zug) → Lo (nach München).' };
    }
    if (P.labSub === 'compound') {
      var cp = {
        kaffee: ['die Kaffeemaschine', 'кофемашина', 'der Kaffee + die Maschine → побеждает ПОСЛЕДНИЙ блок (die Maschine) = DIE!'],
        haus: ['der Haustürschlüssel', 'ключ от входной двери', 'das Haus + die Tür + der Schlüssel → побеждает ПОСЛЕДНИЙ блок (der Schlüssel) = DER!'],
        wasser: ['die Wasserflasche', 'бутылка воды', 'das Wasser + die Flasche → побеждает die Flasche = DIE!'],
        krank: ['das Krankenhaus', 'больница', 'kranken + das Haus → побеждает das Haus = DAS!'],
        platz: ['der Arbeitsplatz', 'рабочее место', 'die Arbeit + der Platz → побеждает der Platz = DER!']
      }[labState.compPreset];
      return { de: cp[0], ru: cp[1], rule: cp[2] };
    }
    // Verbs
    if (labState.verbMode === 'perfekt') {
      return labState.verbSub === 'sein'
        ? { de: 'Ich bin nach Berlin gefahren.', ru: 'Я поехал в Берлин.', rule: 'Вектор перемещения A → B (или смена состояния aufwachen) включает SEIN!' }
        : { de: 'Ich habe ein Buch gelesen.', ru: 'Я прочитал книгу.', rule: 'Действие на месте без маршрута A → B включает HABEN!' };
    }
    if (labState.verbMode === 'werden') {
      var wp = {
        become: ['Es wird langsam dunkel.', 'Становится потихоньку темно.', 'Луч 1: werden без второго глагола = «становиться».'],
        futur: ['Ich werde gut Deutsch sprechen.', 'Я буду хорошо говорить по-немецки.', 'Луч 2: werden + Infinitiv в конце = будущее время (Futur I).'],
        passiv: ['Das Haus wird schnell gebaut.', 'Дом быстро строится.', 'Луч 3: werden + Partizip II в конце = пассивный залог (Passiv).']
      }[labState.verbSub] || ['Es wird langsam dunkel.', 'Становится темно.', ''];
      return { de: wp[0], ru: wp[1], rule: wp[2] };
    }
    if (labState.verbMode === 'modal') {
      var mp = {
        muss: ['Ich muss morgen früh arbeiten.', 'Я должен завтра рано работать.', 'MÜSSEN: жёсткая необходимость (а muss nicht = «не обязательно»).'],
        darf: ['Hier darf man nicht parken.', 'Здесь нельзя парковаться!', 'DÜRFEN: разрешение / закон. nicht dürfen = СТРОГИЙ ЗАПРЕТ!'],
        soll: ['Ich soll viel Wasser trinken.', 'Мне следует пить много воды.', 'SOLLEN: совет врача или поручение другого человека.']
      }[labState.verbSub] || ['Hier darf man nicht parken.', 'Здесь нельзя парковаться!', ''];
      return { de: mp[0], ru: mp[1], rule: mp[2] };
    }
    return { de: 'Kommst du heute nicht mit? Doch!', ru: 'Ты сегодня не идёшь с нами? — Нет, иду!', rule: 'Переключатель DOCH отменяет отрицательный вопрос или чужое «нет» (а в просьбе Komm doch rein! делает тон тёплым).' };
  }

  function renderLabControlsHTML() {
    var info = getLabSentenceAndLogic();
    var out = '';
    if (P.labSub === 'space') {
      out += '<div class="lbl">1 · Вопрос (Физика действия)</div><div class="row">' +
        '<button class="' + (labState.spaceQ === 'akk' ? 'active' : '') + '" onclick="DL_UI.setLS(\'spaceQ\',\'akk\')">Wohin? (Куда? → Akkusativ)</button>' +
        '<button class="' + (labState.spaceQ === 'dat' ? 'active-das' : '') + '" onclick="DL_UI.setLS(\'spaceQ\',\'dat\')">Wo? (Где? → Dativ)</button></div>' +
        '<div class="lbl">2 · Предлог (Wechselpräposition)</div><div class="row">' +
        ['in', 'auf', 'unter', 'neben'].map(function (p) {
          return '<button class="' + (labState.spacePrep === p && labState.spacePosture === 'book' ? 'active-der' : '') + '" onclick="DL_UI.setLSPrep(\'' + p + '\')">' + p + '</button>';
        }).join('') +
        '<button class="' + (labState.spacePosture === 'bottle' ? 'active-der' : '') + '" onclick="DL_UI.setLSBottle()">stellen / stehen (↕ бутылка)</button>' +
        '</div>';
    } else if (P.labSub === 'frame') {
      out += '<div class="lbl">1 · Выберите механизм порядка слов</div><div class="row">' +
        [['klammer', 'Рамка'], ['inversion', 'Качели V2'], ['catapult', 'Катапульта'], ['tekamolo', 'TeKaMoLo']].map(function (m) {
          return '<button class="' + (labState.frameMode === m[0] ? 'active' : '') + '" onclick="DL_UI.setLS(\'frameMode\',\'' + m[0] + '\')">' + m[1] + '</button>';
        }).join('') + '</div>';
      if (labState.frameMode === 'klammer') {
        out += '<div class="lbl">2 · Тип рамки</div><div class="row">' +
          [['will', 'will ... trinken'], ['muss', 'muss ... arbeiten'], ['perf', 'habe ... gekauft'], ['auf', 'stehe ... auf']].map(function (x) {
            return '<button class="' + (labState.framePreset === x[0] ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'framePreset\',\'' + x[0] + '\')">' + x[1] + '</button>';
          }).join('') + '</div>';
      } else if (labState.frameMode === 'inversion') {
        out += '<div class="lbl">2 · Позиция 1 (Повернуть качели)</div><div class="row">' +
          '<button class="' + (!labState.frameInverted ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'frameInverted\',false)">1: Ich (прямой порядок)</button>' +
          '<button class="' + (labState.frameInverted ? 'active' : '') + '" onclick="DL_UI.setLS(\'frameInverted\',true)">1: Heute (инверсия вокруг GEHE)</button></div>';
      } else if (labState.frameMode === 'catapult') {
        out += '<div class="lbl">2 · Переключатель союза</div><div class="row">' +
          '<button class="' + (labState.frameConj === 'weil' ? 'active' : '') + '" onclick="DL_UI.setLS(\'frameConj\',\'weil\')">weil / dass → глагол в конец</button>' +
          '<button class="' + (labState.frameConj === 'denn' ? 'active-das' : '') + '" onclick="DL_UI.setLS(\'frameConj\',\'denn\')">denn → обычный порядок</button></div>';
      }
    } else if (P.labSub === 'compound') {
      out += '<div class="lbl">1 · Соберите длинное слово (Последний блок = род!)</div><div class="row">' +
        [['kaffee', 'Kaffee + Maschine'], ['haus', 'Haus + Tür + Schlüssel'], ['wasser', 'Wasser + Flasche'], ['krank', 'Kranken + Haus'], ['platz', 'Arbeit + Platz']].map(function (c) {
          return '<button class="' + (labState.compPreset === c[0] ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'compPreset\',\'' + c[0] + '\')">' + c[1] + '</button>';
        }).join('') + '</div>';
      var det = E.detectNounGender(genderInput);
      out += '<div class="lbl">2 · Детектор рода (проверьте любое слово!)</div>' +
        '<input type="text" id="gender-input" value="' + esc(genderInput) + '" oninput="DL_UI.onGenderInput(this.value)" placeholder="Например: Mädchen, Wohnung, Motor, Haustürschlüssel..." />' +
        '<div class="logic-box" id="gender-result" style="margin-top:8px">' +
        '<span class="pill ' + (det.art === 'der' || det.art === 'die' || det.art === 'das' ? det.art : 'ochre') + '">' + esc(det.art.toUpperCase() + ' · ' + det.trigger) + '</span> ' +
        '<strong style="margin-left:6px">' + esc(det.input) + '</strong>' +
        '<div class="muted" style="font-size:0.86rem;margin-top:4px">' + esc(det.why) + '</div></div>';
    } else {
      out += '<div class="lbl">1 · Глагольный механизм</div><div class="row">' +
        [['perfekt', 'Perfekt (sein/haben)', 'sein'], ['werden', 'Призма werden', 'become'], ['modal', 'Модальные', 'darf'], ['doch', 'Слово DOCH', 'doch']].map(function (v) {
          return '<button class="' + (labState.verbMode === v[0] ? 'active' : '') + '" onclick="DL_UI.setLSVerb(\'' + v[0] + '\',\'' + v[2] + '\')">' + v[1] + '</button>';
        }).join('') + '</div>';
      if (labState.verbMode === 'perfekt') {
        out += '<div class="lbl">2 · Режим</div><div class="row">' +
          '<button class="' + (labState.verbSub === 'sein' ? 'active' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'sein\')">Движение A→B = sein</button>' +
          '<button class="' + (labState.verbSub === 'haben' ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'haben\')">На месте = haben</button></div>';
      } else if (labState.verbMode === 'werden') {
        out += '<div class="lbl">2 · Луч призмы</div><div class="row">' +
          '<button class="' + (labState.verbSub === 'become' ? 'active-das' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'become\')">1 · Стать</button>' +
          '<button class="' + (labState.verbSub === 'futur' ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'futur\')">2 · + Infinitiv (Будущее)</button>' +
          '<button class="' + (labState.verbSub === 'passiv' ? 'active' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'passiv\')">3 · + Partizip II (Пассив)</button></div>';
      } else if (labState.verbMode === 'modal') {
        out += '<div class="lbl">2 · Сигнал светофора</div><div class="row">' +
          '<button class="' + (labState.verbSub === 'muss' ? 'active' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'muss\')">müssen (должен)</button>' +
          '<button class="' + (labState.verbSub === 'darf' ? 'active-das' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'darf\')">nicht dürfen (ЗАПРЕТ)</button>' +
          '<button class="' + (labState.verbSub === 'soll' ? 'active-der' : '') + '" onclick="DL_UI.setLS(\'verbSub\',\'soll\')">sollen (совет)</button></div>';
      }
    }

    out += '<div class="logic-box">' +
      '<div class="de-text">' + renderColoredTokensHTML(info.de) + '</div>' +
      '<div class="muted" style="margin-top:4px">' + esc(info.ru) + '</div>' +
      '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-soft);font-size:0.9rem">' + esc(info.rule) + '</div>' +
      '<div class="row" style="margin-top:10px">' +
      '<button class="btn-der" onclick="DL_UI.speak(\'' + esc(info.de).replace(/'/g, "\\'") + '\')">▶ Озвучить пример</button>' +
      '</div></div>';
    return out;
  }

  function syncStageFromControls() {
    if (!stageCtrl) return;
    stageCtrl.setModeAndState(P.labSub, labState);
  }

  function renderCodexHTML() {
    var html = '<div class="card card-pad" style="margin-bottom:14px">' +
      '<div class="row" style="justify-content:space-between">' +
      '<div class="row">' +
      [['all', 'Все (' + D.RULES.length + ')'], ['space', 'Пространство'], ['frame', 'Рамка'], ['verbs', 'Глаголы и DOCH'], ['words', 'Слова и род']].map(function (f) {
        return '<button class="' + (labFilter === f[0] ? 'active' : '') + '" onclick="DL_UI.setCodexFilter(\'' + f[0] + '\')">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div style="min-width:240px;flex:1;max-width:340px"><input type="text" value="' + esc(labSearch) + '" oninput="DL_UI.setCodexSearch(this.value)" placeholder="Поиск: Dativ, weil, doch, Mädchen..." /></div>' +
      '</div></div>';

    var q = labSearch.trim().toLowerCase();
    var list = D.RULES.filter(function (r) {
      if (labFilter !== 'all' && r.module !== labFilter) return false;
      if (!q) return true;
      return (r.title + ' ' + r.subtitle + ' ' + r.formula + ' ' + r.ru_vs_de).toLowerCase().indexOf(q) >= 0;
    });

    html += '<div class="grid-2">';
    list.forEach(function (r) {
      html += '<article class="rule-card" id="rule-' + r.id + '" style="border-top-color:var(--' + r.accent + ')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<span class="pill ' + r.accent + '">УРОК #' + r.id + ' · ' + esc(r.level) + '</span>' +
        '<button style="padding:4px 10px;font-size:0.78rem" onclick="DL_UI.goLab(\'' + r.lab + '\')">Открыть 3D →</button></div>' +
        '<h3>' + esc(r.title) + '</h3>' +
        '<div class="mono" style="font-size:0.84rem;color:var(--' + r.accent + ')">' + esc(r.formula) + '</div>' +
        '<p class="muted" style="font-size:0.9rem">' + esc(r.ru_vs_de) + '</p>' +
        '<div>' + r.examples.map(function (ex) {
          return '<div style="padding:8px 10px;background:var(--panel);border-radius:7px;margin-top:6px;display:flex;justify-content:space-between;gap:8px;align-items:center">' +
            '<div><div style="font-family:var(--font-serif);font-weight:700">' + renderColoredTokensHTML(ex.de) + '</div>' +
            '<div class="muted" style="font-size:0.84rem">' + esc(ex.ru) + ' <span class="mono dim">· ' + esc(ex.note) + '</span></div></div>' +
            '<button style="padding:5px 9px" onclick="DL_UI.speak(\'' + esc(ex.de).replace(/'/g, "\\'") + '\')">▶</button></div>';
        }).join('') + '</div>' +
        '<div class="trap-box"><s>✕ ' + esc(r.trap.wrong) + '</s> → <b>✓ ' + esc(r.trap.right) + '</b><div class="muted" style="margin-top:3px">' + esc(r.trap.why) + '</div></div>' +
        '</article>';
    });
    html += '</div>';
    return html;
  }

  // ---------- Practice & Dialogue ----------
  var quizAnswers = {};
  var tileStates = {}; // { id: { chosen: [], result: null | { ok, built } } }

  function renderPractice() {
    var subs = [
      { id: 'arzt', label: '1 · Диалог «У врача» (Workflow B)' },
      { id: 'quiz', label: '2 · Диагностика логики (' + D.DIAGNOSTICS.length + ')' },
      { id: 'tiles', label: '3 · Собери фразу (' + D.CONSTRUCTORS.length + ')' }
    ];
    var html = '<div class="subtabs">' +
      subs.map(function (s) {
        return '<button class="' + (P.pracSub === s.id ? 'active' : '') + '" onclick="DL_UI.setPracSub(\'' + s.id + '\')">' + esc(s.label) + '</button>';
      }).join('') + '</div>';

    if (P.pracSub === 'arzt') {
      var A = D.SURVIVAL_ARZT;
      html += '<div class="card card-pad" style="margin-bottom:14px;border-top:3px solid var(--die)">' +
        '<span class="pill die">WORKFLOW B · SURVIVAL DIALOGUE</span>' +
        '<h2 style="font-family:var(--font-serif);margin-top:8px">' + esc(A.title_de) + '</h2>' +
        '<p class="muted">' + esc(A.subtitle_ru) + '</p></div>';
      html += '<div class="grid-2">';
      html += '<div>';
      A.dialogue.forEach(function (l) {
        var sp = A.speakers[l.spk];
        html += '<div class="card card-pad" style="margin-bottom:10px;border-left:4px solid var(--' + (l.spk === 'A' ? 'der' : 'die') + ')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span class="mono ' + sp.cls + '" style="font-size:0.8rem">' + esc(sp.name + ' · ' + sp.label_ru) + '</span>' +
          '<div class="row"><button style="padding:4px 9px" onclick="DL_UI.speak(\'' + esc(l.de).replace(/'/g, "\\'") + '\')">▶</button></div></div>' +
          '<div class="de-text" style="font-size:1.12rem">' + renderColoredTokensHTML(l.de) + '</div>' +
          '<div class="muted" style="font-size:0.9rem;margin-top:3px">' + esc(l.ru) + '</div>' +
          (l.trap ? '<div class="trap-box" style="margin-top:8px"><s>✕ ' + esc(l.trap.wrong) + '</s> → <b>✓ ' + esc(l.trap.right) + '</b><div class="muted">' + esc(l.trap.why) + '</div></div>'
            : (l.note ? '<div class="mono ochre" style="font-size:0.8rem;margin-top:6px">• ' + esc(l.note) + '</div>' : '')) +
          '</div>';
      });
      html += '</div>';
      html += '<div><div class="card card-pad"><h3 style="margin-bottom:10px">Ключевые слова с артиклями</h3>' +
        '<div style="display:grid;gap:8px">' +
        A.vocab.map(function (v) {
          return '<div style="padding:10px 12px;background:var(--panel);border-radius:8px;border-top:2px solid var(--' + v.art + ')">' +
            '<strong class="g-' + v.art + '">' + esc(v.de) + '</strong> — ' + esc(v.ru) +
            '<div class="dim" style="font-size:0.82rem;margin-top:2px">' + esc(v.note) + '</div></div>';
        }).join('') + '</div></div></div>';
      html += '</div>';
    } else if (P.pracSub === 'quiz') {
      html += '<div class="grid-2">';
      D.DIAGNOSTICS.forEach(function (q, qi) {
        var picked = quizAnswers[q.id];
        html += '<div class="card card-pad">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<span class="pill der">ЗАДАЧА ' + (qi + 1) + ' · ПРАВИЛО #' + q.rule + '</span></div>' +
          '<strong>' + esc(q.q) + '</strong>' +
          '<div>' + q.opts.map(function (o, oi) {
            var cls = '';
            if (picked === oi) cls = o.ok ? 'ok' : 'bad';
            return '<button class="quiz-opt ' + cls + '" onclick="DL_UI.answerQuiz(\'' + q.id + '\',' + oi + ')">' + esc(o.t) + '</button>';
          }).join('') + '</div>' +
          (picked !== undefined ? '<div class="hint-box" style="border-color:var(--' + (q.opts[picked].ok ? 'das' : 'die') + ')">' +
            esc(q.opts[picked].why) + '</div>' : '') +
          '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="grid-2">';
      D.CONSTRUCTORS.forEach(function (c) {
        if (!tileStates[c.id]) tileStates[c.id] = { chosen: [], result: null };
        var ts = tileStates[c.id];
        var remaining = c.tiles.slice();
        ts.chosen.forEach(function (w) {
          var idx = remaining.indexOf(w);
          if (idx >= 0) remaining.splice(idx, 1);
        });
        html += '<div class="card card-pad">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '<span class="pill ochre">КОНСТРУКТОР · ПРАВИЛО #' + c.rule + '</span></div>' +
          '<h3>' + esc(c.title) + '</h3>' +
          '<p class="muted" style="font-size:0.9rem">' + esc(c.prompt_ru) + '</p>' +
          '<div class="slot-zone">' +
          (ts.chosen.length ? ts.chosen.map(function (w, idx) {
            return '<button class="tile-chip" onclick="DL_UI.removeTile(\'' + c.id + '\',' + idx + ')">' + esc(w) + ' ✕</button>';
          }).join('') : '<span class="dim mono" style="font-size:0.82rem">Нажимайте на блоки ниже в правильном порядке...</span>') +
          '</div>' +
          '<div class="row">' + remaining.map(function (w) {
            return '<button class="tile-chip" onclick="DL_UI.addTile(\'' + c.id + '\',\'' + esc(w).replace(/'/g, "\\'") + '\')">' + esc(w) + '</button>';
          }).join('') + '</div>' +
          '<div class="row" style="margin-top:12px">' +
          '<button class="primary" onclick="DL_UI.checkTiles(\'' + c.id + '\')">Проверить</button>' +
          '<button onclick="DL_UI.resetTiles(\'' + c.id + '\')">Сброс</button></div>' +
          (ts.result ? '<div class="hint-box" style="border-color:var(--' + (ts.result.ok ? 'das' : 'die') + ')">' +
            (ts.result.ok ? '<strong class="g-das">✓ Отлично!</strong> ' + esc(c.hint)
              : '<strong class="g-die">Почти!</strong> ' + esc(c.hint)) + '</div>' : '') +
          '</div>';
      });
      html += '</div>';
    }
    viewEl.innerHTML = html;
  }

  // ---------- Endless In-Memory Flashcard Drill ----------
  var srsRevealed = false;

  function renderSrs() {
    var cur = drillQueue[0] || null;
    var total = ALL_DRILL_CARDS.length;

    var html = '<div class="card card-pad" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<div><span class="pill das">ТРЕНАЖЁР КАРТОЧЕК</span>' +
      '<h2 style="margin-top:6px">Крутим карточки, пока не уляжется в голове</h2>' +
      '<p class="muted">«Ещё раз» вернёт карточку обратно в круг, «Окей» уберёт до следующего круга.</p></div>' +
      '<div class="row">' +
      '<button onclick="DL_UI.resetSrs(true)">↻ Перемешать и заново</button>' +
      '</div></div>';

    if (!cur) {
      html += '<div class="srs-card"><div class="srs-face">' +
        '<span class="pill das">КРУГ ПРОЙДЕН</span>' +
        '<h2>Все карточки в этом круге отработаны!</h2>' +
        '<p class="muted">Хотите прогнать колоду ещё раз в случайном порядке или по порядку?</p>' +
        '<div class="row" style="justify-content:center">' +
        '<button class="primary" onclick="DL_UI.resetSrs(true)">↻ Перемешать и пройти ещё раз</button>' +
        '<button onclick="DL_UI.resetSrs(false)">По порядку</button>' +
        '</div>' +
        '</div></div>';
    } else {
      html += '<div class="srs-card">' +
        '<div class="mono dim" style="font-size:0.78rem;margin-bottom:10px">' + esc(cur.src) + ' · В круге: ' + drillQueue.length + '</div>' +
        '<div class="srs-face">' +
        '<div class="de-text" style="font-size:1.55rem">' + renderColoredTokensHTML(cur.de) + '</div>' +
        '<div class="row">' +
        '<button class="btn-der" onclick="DL_UI.speak(\'' + esc(cur.de).replace(/'/g, "\\'") + '\')">▶ Слушать</button>' +
        '</div>' +
        (srsRevealed
          ? '<div class="hint-box" style="width:100%;text-align:left"><strong>' + esc(cur.ru) + '</strong>' +
            '<div class="muted" style="font-size:0.88rem;margin-top:4px">' + esc(cur.note) + '</div></div>'
          : '<button class="primary" style="margin-top:10px" onclick="DL_UI.revealSrs()">Показать перевод и логику (Пробел)</button>') +
        '</div>' +
        (srsRevealed ? '<div class="row" style="justify-content:center;margin-top:18px">' +
          '<button class="btn-die" onclick="DL_UI.gradeSrs(false)">Ещё раз</button>' +
          '<button class="btn-das" onclick="DL_UI.gradeSrs(true)">Окей</button>' +
          '</div>' : '') +
        '</div>';
    }
    viewEl.innerHTML = html;
  }

  // ---------- Main Render Dispatcher ----------
  function render() {
    renderTopNav();
    if (P.tab !== 'lab') destroyStage();
    if (P.tab !== 'story' && immersionPlaying) stopImmersion();

    if (P.tab === 'map') renderMap();
    else if (P.tab === 'story') renderStory();
    else if (P.tab === 'lab') renderLab();
    else if (P.tab === 'practice') renderPractice();
    else renderSrs();
  }

  // ---------- Global UI Handlers ----------
  window.DL_UI = {
    goTab: function (tab) { P.tab = tab; render(); window.scrollTo(0, 0); },
    goLab: function (sub) { P.tab = 'lab'; P.labSub = sub; render(); window.scrollTo(0, 0); },
    jumpLab: function (sub) { this.goLab(sub); },
    openRule: function (id) {
      P.tab = 'lab'; P.labSub = 'codex'; labFilter = 'all'; labSearch = '';
      render();
      var el = document.getElementById('rule-' + id);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    speak: function (txt) { playGerman(txt); },
    closeXray: function () { currentXray = null; var b = document.getElementById('xray-slot'); if (b) b.innerHTML = renderXrayBannerHTML(); },
    setStoryCh: function (ch) { P.storyCh = ch; renderStory(); },
    toggleAllRu: function () { P.showAllRu = !P.showAllRu; renderStory(); },
    toggleHint: function (n) { revealedHints[n] = !revealedHints[n]; renderStory(); },
    startImmersion: function () { playImmersionFrom(0); },
    stopImmersion: stopImmersion,
    setLabSub: function (sub) { P.labSub = sub; renderLab(); },
    replayStage: function () { if (stageCtrl) stageCtrl.replay(); },
    setLS: function (k, v) { labState[k] = v; var lc = document.getElementById('lab-controls'); if (lc) lc.innerHTML = renderLabControlsHTML(); syncStageFromControls(); },
    setLSPrep: function (p) { labState.spacePrep = p; labState.spacePosture = 'book'; this.setLS('spacePrep', p); },
    setLSBottle: function () { labState.spacePosture = 'bottle'; this.setLS('spacePosture', 'bottle'); },
    setLSVerb: function (vm, vs) { labState.verbMode = vm; labState.verbSub = vs; this.setLS('verbMode', vm); },
    onGenderInput: function (val) {
      genderInput = val;
      var det = E.detectNounGender(val);
      var res = document.getElementById('gender-result');
      if (res) {
        res.innerHTML = '<span class="pill ' + (det.art === 'der' || det.art === 'die' || det.art === 'das' ? det.art : 'ochre') + '">' + esc(det.art.toUpperCase() + ' · ' + det.trigger) + '</span> ' +
          '<strong style="margin-left:6px">' + esc(det.input) + '</strong>' +
          '<div class="muted" style="font-size:0.86rem;margin-top:4px">' + esc(det.why) + '</div>';
      }
    },
    setCodexFilter: function (f) { labFilter = f; renderLab(); },
    setCodexSearch: function (v) { labSearch = v; renderLab(); },
    setPracSub: function (s) { P.pracSub = s; renderPractice(); },
    answerQuiz: function (qid, oi) {
      quizAnswers[qid] = oi;
      renderPractice();
    },
    addTile: function (cid, word) {
      if (!tileStates[cid]) tileStates[cid] = { chosen: [], result: null };
      tileStates[cid].chosen.push(word);
      tileStates[cid].result = null;
      renderPractice();
    },
    removeTile: function (cid, idx) {
      if (tileStates[cid]) { tileStates[cid].chosen.splice(idx, 1); tileStates[cid].result = null; }
      renderPractice();
    },
    resetTiles: function (cid) { tileStates[cid] = { chosen: [], result: null }; renderPractice(); },
    checkTiles: function (cid) {
      var c = D.CONSTRUCTORS.find(function (x) { return x.id === cid; });
      var ts = tileStates[cid] || { chosen: [] };
      var res = E.checkTileSentence(ts.chosen, c.answers);
      ts.result = res;
      if (res.ok) {
        playGerman(c.answers[0]);
      }
      renderPractice();
    },
    revealSrs: function () { srsRevealed = true; renderSrs(); },
    gradeSrs: function (ok) {
      if (drillQueue.length) {
        var card = drillQueue.shift();
        if (!ok) {
          var insertAt = Math.min(drillQueue.length, 3);
          drillQueue.splice(insertAt, 0, card);
        }
      }
      srsRevealed = false;
      renderSrs();
    },
    resetSrs: function (shuffle) {
      drillQueue = shuffle ? shuffleArray(ALL_DRILL_CARDS) : ALL_DRILL_CARDS.slice();
      srsRevealed = false;
      renderSrs();
    }
  };

  // Delegated click handlers for nav tabs and clickable DaF words
  document.addEventListener('click', function (ev) {
    var navBtn = ev.target.closest && ev.target.closest('.nav-tab[data-tab]');
    if (navBtn) {
      window.DL_UI.goTab(navBtn.getAttribute('data-tab'));
      return;
    }
    var tok = ev.target.closest && ev.target.closest('.tok-word[data-word]');
    if (tok) {
      openXray(tok.getAttribute('data-word'), tok.getAttribute('data-sent'));
      if (P.tab !== 'story') {
        playGerman(tok.getAttribute('data-word'));
      }
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (P.tab === 'srs' && ev.code === 'Space' && !srsRevealed && document.activeElement.tagName !== 'INPUT') {
      ev.preventDefault();
      window.DL_UI.revealSrs();
    }
  });

  window.addEventListener('DOMContentLoaded', function () {
    viewEl = document.getElementById('app-view');
    render();
  });
})();
