/* Pure Linguistic & Pedagogical Logic Engine for DEUTSCH·LOGIK
   Works both in Browser (window.DL_ENGINE) and Node.js (module.exports) */
(function (root) {
  'use strict';

  var NOUN_LEXICON = {
    uhr: { art: 'die', pl: 'Uhren', ru: 'часы / время', rule: 'Часы на циферблате и время суток' },
    augen: { art: 'die', base: 'das Auge', pl: 'die Augen', ru: 'глаза (мн. ч.)', rule: 'Множественное число всегда использует артикль die (здесь цвет Pl. — охра)' },
    auge: { art: 'das', pl: 'Augen', ru: 'глаз', rule: 'Части тела с окончаниями на -e нередко среднего рода (исключение, запомнить)' },
    küche: { art: 'die', pl: 'Küchen', ru: 'кухня', rule: 'Многие существительные на -e — женского рода (die)' },
    kaffee: { art: 'der', pl: 'Kaffees', ru: 'кофе', rule: 'Напитки и алкоголь (кроме das Bier) обычно der' },
    maschine: { art: 'die', pl: 'Maschinen', ru: 'машина / аппарат', rule: 'Слова на -e почти всегда женского рода (die)' },
    kaffeemaschine: { art: 'die', parts: ['der Kaffee', 'die Maschine'], ru: 'кофемашина', rule: 'Komposita: последнее слово die Maschine задаёт род всему слову!' },
    brot: { art: 'das', pl: 'Brote', ru: 'хлеб', rule: 'Базовый продукт питания (das Brot)' },
    brötchen: { art: 'das', pl: 'Brötchen', ru: 'булочка', rule: 'Суффикс -chen (уменьшительный луч) на 100% даёт das!' },
    zeit: { art: 'die', pl: 'Zeiten', ru: 'время', rule: 'Слово женского рода (die Zeit)' },
    schlüssel: { art: 'der', pl: 'Schlüssel', ru: 'ключ', rule: 'Инструменты и приборы мужского рода (der Schlüssel)' },
    hausschlüssel: { art: 'der', parts: ['das Haus', 'der Schlüssel'], ru: 'ключ от дома', rule: 'Komposita: der Schlüssel в конце пересиливает das Haus!' },
    ersatzschlüssel: { art: 'der', parts: ['der Ersatz', 'der Schlüssel'], ru: 'запасной ключ', rule: 'Komposita: род по последнему слову der Schlüssel' },
    tisch: { art: 'der', pl: 'Tische', ru: 'стол', rule: 'Мужской род (der Tisch)' },
    licht: { art: 'das', pl: 'Lichter', ru: 'свет', rule: 'Средний род (das Licht)' },
    tür: { art: 'die', pl: 'Türen', ru: 'дверь', rule: 'Женский род (die Tür)' },
    station: { art: 'die', pl: 'Stationen', ru: 'станция', rule: 'Окончание -tion на 100% даёт женский род (die)!' },
    bahn: { art: 'die', pl: 'Bahnen', ru: 'дорога / поезд', rule: 'Женский род (die Bahn)' },
    'u-bahn-station': { art: 'die', parts: ['die U-Bahn', 'die Station'], ru: 'станция метро', rule: 'Окончание -tion + правило последнего слова → die!' },
    'u-bahn': { art: 'die', parts: ['Untergrund', 'die Bahn'], ru: 'метро', rule: 'Главное слово die Bahn → die U-Bahn' },
    haus: { art: 'das', pl: 'Häuser', ru: 'дом', rule: 'Средний род (das Haus)' },
    hause: { art: 'das', base: 'das Haus', pl: 'Häuser', ru: 'дома (в выражении zu Hause)', rule: 'Устойчивое выражение zu Hause (где? покой) / nach Hause (куда?)' },
    freund: { art: 'der', pl: 'Freunde', ru: 'друг', rule: 'Лицо мужского пола → всегда der' },
    problem: { art: 'das', pl: 'Probleme', ru: 'проблема', rule: 'Заимствования среднего рода (das Problem)' },
    café: { art: 'das', pl: 'Cafés', ru: 'кафе', rule: 'Слова с ударным -é часто среднего рода (das Café)' },
    morgen: { art: 'der', pl: 'Morgen', ru: 'утро', rule: 'Время суток (кроме die Nacht) → der Morgen' },
    deutschland: { art: 'das', pl: '-', ru: 'Германия', rule: 'Большинство стран среднего рода и употребляются без артикля' },
    kiste: { art: 'die', pl: 'Kisten', ru: 'коробка / ящик', rule: 'Окончание -e → die Kiste' },
    buch: { art: 'das', pl: 'Bücher', ru: 'книга', rule: 'Средний род (das Buch)' },
    flasche: { art: 'die', pl: 'Flaschen', ru: 'бутылка', rule: 'Окончание -e → die Flasche' },
    wasserflasche: { art: 'die', parts: ['das Wasser', 'die Flasche'], ru: 'бутылка воды', rule: 'Komposita: последнее слово die Flasche задаёт род' },
    handy: { art: 'das', pl: 'Handys', ru: 'мобильный телефон', rule: 'Средний род (das Handy)' },
    arbeitsplatz: { art: 'der', parts: ['die Arbeit', 'der Platz'], ru: 'рабочее место', rule: 'Komposita: der Platz в конце побеждает die Arbeit!' },
    krankenhaus: { art: 'das', parts: ['kranken', 'das Haus'], ru: 'больница', rule: 'Komposita: das Haus в конце → das Krankenhaus' },
    termin: { art: 'der', pl: 'Termine', ru: 'запись / встреча', rule: 'Ложный друг! Не «термин», а назначенное время приёма (der)' },
    versichertenkarte: { art: 'die', parts: ['Versicherten', 'die Karte'], ru: 'карта медстраховки', rule: 'Komposita: die Karte в конце → die Versichertenkarte' },
    karte: { art: 'die', pl: 'Karten', ru: 'карта / карточка', rule: 'Окончание -e → die Karte' },
    fieber: { art: 'das', pl: '-', ru: 'температура / жар', rule: 'Средний род (das Fieber)' },
    kopf: { art: 'der', pl: 'Köpfe', ru: 'голова', rule: 'Мужской род (der Kopf)' },
    krankschreibung: { art: 'die', pl: 'Krankschreibungen', ru: 'больничный лист', rule: 'Окончание -ung на 100% даёт женский род (die)!' },
    rezept: { art: 'das', pl: 'Rezepte', ru: 'рецепт', rule: 'Средний род (das Rezept)' },
    apotheke: { art: 'die', pl: 'Apotheken', ru: 'аптека', rule: 'Окончание -e → die Apotheke' },
    arbeit: { art: 'die', pl: 'Arbeiten', ru: 'работа', rule: 'Женский род (die Arbeit)' },
    supermarkt: { art: 'der', parts: ['super', 'der Markt'], ru: 'супермаркет', rule: 'Komposita: der Markt в конце → der Supermarkt' },
    park: { art: 'der', pl: 'Parks', ru: 'парк', rule: 'Мужской род (der Park)' },
    wohnung: { art: 'die', pl: 'Wohnungen', ru: 'квартира', rule: 'Окончание -ung на 100% даёт die!' },
    zeitung: { art: 'die', pl: 'Zeitungen', ru: 'газета', rule: 'Окончание -ung на 100% даёт die!' },
    gesundheit: { art: 'die', pl: '-', ru: 'здоровье', rule: 'Окончание -heit на 100% даёт die!' },
    freiheit: { art: 'die', pl: 'Freiheiten', ru: 'свобода', rule: 'Окончание -heit на 100% даёт die!' },
    möglichkeit: { art: 'die', pl: 'Möglichkeiten', ru: 'возможность', rule: 'Окончание -keit на 100% даёт die!' },
    freundschaft: { art: 'die', pl: 'Freundschaften', ru: 'дружба', rule: 'Окончание -schaft на 100% даёт die!' },
    mädchen: { art: 'das', pl: 'Mädchen', ru: 'девочка', rule: 'Уменьшительный суффикс -chen ВСЕГДА делает слово средним родом (das)!' },
    dokument: { art: 'das', pl: 'Dokumente', ru: 'документ', rule: 'Окончание -ment почти всегда даёт das!' },
    zentrum: { art: 'das', pl: 'Zentren', ru: 'центр', rule: 'Окончание -um на 100% даёт das!' },
    motor: { art: 'der', pl: 'Motoren', ru: 'мотор', rule: 'Окончание -or на 100% даёт мужской род (der)!' },
    drucker: { art: 'der', pl: 'Drucker', ru: 'принтер', rule: 'Приборы и профессии на -er почти всегда der!' },
    montag: { art: 'der', pl: 'Montage', ru: 'понедельник', rule: 'Все дни недели, месяцы и времена года → der!' },
    frühling: { art: 'der', pl: 'Frühlinge', ru: 'весна', rule: 'Время года + суффикс -ling → 100% der!' },
    optimismus: { art: 'der', pl: '-', ru: 'оптимизм', rule: 'Окончание -ismus на 100% даёт der!' },
    büro: { art: 'das', pl: 'Büros', ru: 'офис', rule: 'Средний род (das Büro)' },
    arzt: { art: 'der', pl: 'Ärzte', ru: 'врач', rule: 'Профессия мужского рода → der' },
    bus: { art: 'der', pl: 'Busse', ru: 'автобус', rule: 'Транспорт (der Bus, der Zug)' },
    zug: { art: 'der', pl: 'Züge', ru: 'поезд', rule: 'Мужской род (der Zug)' },
    kino: { art: 'das', pl: 'Kinos', ru: 'кино', rule: 'Средний род (das Kino)' },
    schule: { art: 'die', pl: 'Schulen', ru: 'школа', rule: 'Окончание -e → die Schule' },
    berlin: { art: 'das', pl: '-', ru: 'Берлин', rule: 'Города среднего рода и без артикля (nach Berlin)' }
  };

  var ARTICLES = {
    der: 1, die: 1, das: 1, den: 1, dem: 1, des: 1,
    ein: 1, eine: 1, einen: 1, einem: 1, meiner: 1, mein: 1, meine: 1, meinen: 1, meinem: 1,
    kein: 1, keine: 1, keinen: 1, keinem: 1, zur: 1, zum: 1, im: 1, ins: 1, beim: 1, vom: 1,
    ihre: 1, starkes: 1
  };

  var SPECIAL_TOKENS = {
    auf: { role: 'Приставка / предлог', tag: 'ochre', why: 'В конце предложения (stehe ... auf, mache ... auf) это отделяемая приставка: движение вверх или «открыть»!' },
    zu: { role: 'Приставка / предлог', tag: 'ochre', why: 'В конце фразы (mache ... zu) — «закрыть». Перед местом/человеком (zum Arzt, zur Station) — предлог цели (+ Dativ).' },
    aus: { role: 'Приставка / предлог', tag: 'ochre', why: 'Означает «наружу / выключить» (aussteigen, ausmachen). Как предлог всегда требует Dativ (aus dem Haus).' },
    an: { role: 'Приставка / предлог', tag: 'ochre', why: 'В «rufe ... an» отделяется от anrufen (звонить). В пространстве — контакт с вертикалью.' },
    ein: { role: 'Приставка / артикль', tag: 'ochre', why: 'С глаголом (eingestiegen) — приставка «внутрь». Перед существительным — неопределённый артикль (der/das).' },
    eingestiegen: { role: 'Partizip II (глагол)', tag: 'verb', why: 'Прошедшее время от einsteigen (сесть в транспорт). Движение А→Б, поэтому в паре с bin (sein)!' },
    gelaufen: { role: 'Partizip II (глагол)', tag: 'verb', why: 'Перемещение (бежать), поэтому Perfekt строится через sein: bin ... gelaufen.' },
    getrunken: { role: 'Partizip II (глагол)', tag: 'verb', why: 'Действие на месте (пить кофе), нет маршрута А→Б → Perfekt с haben!' },
    vergessen: { role: 'Partizip II (глагол)', tag: 'verb', why: 'Ментальное действие на месте → Perfekt с haben (habe ... vergessen).' },
    weil: { role: 'Союз-катапульта', tag: 'die', why: 'Подчинительный союз «потому что»: катапультирует спрягаемый глагол (bin) в самый конец!' },
    dass: { role: 'Союз-катапульта', tag: 'der', why: 'Подчинительный союз «что»: отправляет глагол (ist) в конец придаточного предложения!' },
    denn: { role: 'Союз-спасатель (Позиция 0)', tag: 'das', why: 'Тоже значит «так как / потому что», но НЕ двигает глагол — сохраняет прямой порядок!' },
    kein: { role: 'Отрицание существительного', tag: 'die', why: 'Отрицает существительное без артикля (kein Brot, kein Problem). «nicht Brot» сказать нельзя!' },
    keine: { role: 'Отрицание существительного (die)', tag: 'die', why: 'Женский род die Zeit → отрицание keine Zeit.' },
    keinen: { role: 'Отрицание (Akkusativ, der)', tag: 'die', why: 'Мужской род в Akkusativ (es gibt keinen Platz).' },
    nicht: { role: 'Отрицание глагола / качества', tag: 'der', why: 'Отрицает прилагательное (nicht heiß, nicht weit) или действие (arbeite nicht).' },
    doch: { role: 'Переключатель DOCH', tag: 'das', why: 'Отменяет чужое отрицание («Нет, да!»), отвечает на вопрос с nicht или смягчает просьбу!' },
    will: { role: 'Модальный глагол (Поз. 2)', tag: 'der', why: 'Стоит на 2-м месте и держит глагольную рамку (Satzklammer): will ... trinken.' },
    muss: { role: 'Модальный глагол (Поз. 2)', tag: 'der', why: 'Строит рамку: muss на 2-м месте, смысловой глагол (arbeiten) улетает в конец.' },
    bin: { role: 'Вспомогательный глагол sein', tag: 'die', why: 'В Perfekt выбирается при движении А→Б или смене состояния (bin gelaufen, bin eingestiegen).' },
    habe: { role: 'Вспомогательный глагол haben', tag: 'der', why: 'В Perfekt выбирается для действий на месте (habe getrunken, habe vergessen).' },
    in: { role: 'Предлог (Wo / Wohin)', tag: 'ochre', why: 'Движение внутрь (куда? → Akkusativ: in die Küche) vs. покой (где? → Dativ: in der Küche).' },
    auf: { role: 'Предлог / приставка', tag: 'ochre', why: 'На поверхность: куда? → auf den Tisch (Akkusativ); где? → auf dem Tisch (Dativ). В конце фразы — приставка!' },
    zur: { role: 'zu + der = zur (Dativ)', tag: 'die', why: 'Предлог zu (направление к цели) ВСЕГДА требует Dativ! Женский род die Station → zur Station.' },
    im: { role: 'in + dem = im (Dativ)', tag: 'das', why: 'Слияние in + dem (где? покой) для das Café → im Café.' }
  };

  function colorClassForArt(art) {
    if (art === 'der') return 'g-der';
    if (art === 'die') return 'g-die';
    if (art === 'das') return 'g-das';
    return 'g-ochre';
  }

  function lookupNoun(word) {
    var low = String(word || '').toLowerCase();
    if (NOUN_LEXICON[low]) return NOUN_LEXICON[low];
    var tail = low.split('-').pop();
    if (tail && NOUN_LEXICON[tail]) return NOUN_LEXICON[tail];
    return null;
  }

  function colorizeTokens(text) {
    var parts = String(text || '').match(/[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*|[^A-Za-zÄÖÜäöüß]+/g) || [];
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!/^[A-Za-zÄÖÜäöüß]/.test(p)) {
        out.push({ text: p, word: false, cls: '' });
        continue;
      }
      var low = p.toLowerCase();
      // Article followed by mapped Capitalized Noun (e.g. "in der Küche" -> RED because Küche is die!)
      if (ARTICLES[low] && i + 2 < parts.length && /^\s+$/.test(parts[i + 1]) && /^[A-ZÄÖÜ]/.test(parts[i + 2])) {
        var nextInfo = lookupNoun(parts[i + 2]);
        if (nextInfo) {
          var cls = nextInfo.pl === parts[i + 2] && nextInfo.base ? 'g-ochre' : colorClassForArt(nextInfo.art);
          out.push({ text: p, word: true, cls: cls, linkedNoun: parts[i + 2] });
          out.push({ text: parts[i + 1], word: false, cls: '' });
          out.push({ text: parts[i + 2], word: true, cls: cls });
          i += 2;
          continue;
        }
      }
      // Capitalized standalone noun
      if (/^[A-ZÄÖÜ]/.test(p)) {
        var info = lookupNoun(p);
        if (info) {
          var ncls = (info.pl === p && info.base) ? 'g-ochre' : colorClassForArt(info.art);
          out.push({ text: p, word: true, cls: ncls });
          continue;
        }
      }
      // Grammar trigger token
      var sp = SPECIAL_TOKENS[low];
      if (sp) {
        out.push({ text: p, word: true, cls: 'g-' + sp.tag });
        continue;
      }
      out.push({ text: p, word: true, cls: '' });
    }
    return out;
  }

  function inspectWord(word, sentence) {
    var clean = String(word || '').replace(/^[^A-Za-zÄÖÜäöüß]+|[^A-Za-zÄÖÜäöüß]+$/g, '');
    var low = clean.toLowerCase();
    var sent = String(sentence || '');
    var noun = lookupNoun(clean);
    var sp = SPECIAL_TOKENS[low];

    // Context-aware overrides for ambiguous words like "auf", "in", "der", "ein"
    if (low === 'der' && /\bin der\b/i.test(sent)) {
      return {
        word: clean,
        badge: 'DATIV (DIE → DER)',
        cls: 'g-die',
        title: 'Здесь «der» — это женский род (die) в Dativ!',
        explanation: 'После предлога места «in» на вопрос «Где?» (покой) включается Dativ, где женский артикль die превращается в der (die Küche → in der Küche).',
        lab: 'space'
      };
    }
    if (low === 'auf' && /auf\.\s*$|auf\s+und\b/i.test(sent)) {
      return {
        word: clean,
        badge: 'ОТДЕЛЯЕМАЯ ПРИСТАВКА',
        cls: 'g-das',
        title: 'Приставка auf- (вверх / открыть)',
        explanation: 'В настоящем времени отделяемая приставка улетает от глагола (aufstehen, aufmachen) в самый конец фразы, закрывая рамку.',
        lab: 'frame'
      };
    }
    if (noun) {
      return {
        word: (noun.base ? noun.base : noun.art + ' ' + clean),
        badge: (noun.pl === clean && noun.base) ? 'PLURAL (DIE)' : noun.art.toUpperCase(),
        cls: (noun.pl === clean && noun.base) ? 'g-ochre' : colorClassForArt(noun.art),
        title: clean + ' — ' + noun.ru,
        parts: noun.parts || null,
        plural: noun.pl && noun.pl !== '-' ? 'Мн. ч.: ' + noun.pl : null,
        explanation: noun.rule,
        lab: noun.parts ? 'compound' : 'space'
      };
    }
    if (sp) {
      return {
        word: clean,
        badge: sp.role.toUpperCase(),
        cls: 'g-' + sp.tag,
        title: clean + ' · ' + sp.role,
        explanation: sp.why,
        lab: (low === 'weil' || low === 'dass' || low === 'denn' || low === 'will' || low === 'muss' || low === 'zu' || low === 'aus' || low === 'an') ? 'frame'
          : (low === 'in' || low === 'zur' || low === 'im') ? 'space' : 'verbs'
      };
    }
    // Check live ending detector if capitalized
    if (/^[A-ZÄÖÜ]/.test(clean)) {
      var guessed = detectNounGender(clean);
      if (guessed.detected) {
        return {
          word: guessed.art + ' ' + clean,
          badge: guessed.art.toUpperCase() + ' · ПО ОКОНЧАНИЮ',
          cls: colorClassForArt(guessed.art),
          title: 'Определено по правилу: ' + guessed.trigger,
          explanation: guessed.why,
          lab: 'compound'
        };
      }
    }
    return {
      word: clean,
      badge: 'СЛОВО В КОНТЕКСТЕ',
      cls: '',
      title: clean,
      explanation: 'Кликните на артикль, существительное, предлог (in/auf/zur) или глагол/союз (muss/weil/dass/auf), чтобы увидеть грамматическую механику.',
      lab: null
    };
  }

  var GENDER_RULES = [
    { re: /(?:chen|lein)$/i, art: 'das', conf: '100%', trigger: '-chen / -lein', why: 'Уменьшительный суффикс (даже если это одушевлённое существо, как das Mädchen) ВСЕГДА даёт средний род das!' },
    { re: /(?:ung)$/i, art: 'die', conf: '100%', trigger: '-ung', why: 'Суффикс действия/результата -ung на 100% делает слово женского рода (die Wohnung, die Zeitung).' },
    { re: /(?:heit|keit)$/i, art: 'die', conf: '100%', trigger: '-heit / -keit', why: 'Абстрактные качества на -heit / -keit всегда женского рода (die Freiheit, die Möglichkeit).' },
    { re: /(?:schaft)$/i, art: 'die', conf: '100%', trigger: '-schaft', why: 'Окончание -schaft на 100% даёт артикль die (die Freundschaft).' },
    { re: /(?:tion|sion|tät)$/i, art: 'die', conf: '100%', trigger: '-tion / -tät', why: 'Интернациональные слова на -tion / -tät всегда женского рода (die Station, die Information).' },
    { re: /(?:ment|um)$/i, art: 'das', conf: '~98%', trigger: '-ment / -um', why: 'Существительные на -ment и -um почти всегда среднего рода (das Dokument, das Zentrum).' },
    { re: /(?:ling)$/i, art: 'der', conf: '100%', trigger: '-ling', why: 'Окончание -ling всегда даёт мужской род der (der Frühling, der Schmetterling).' },
    { re: /(?:ismus)$/i, art: 'der', conf: '100%', trigger: '-ismus', why: 'Все слова на -ismus — мужского рода (der Optimismus, der Tourismus).' },
    { re: /(?:or)$/i, art: 'der', conf: '~98%', trigger: '-or', why: 'Слова на -or (приборы, механизмы) почти всегда мужского рода (der Motor, der Doktor).' },
    { re: /(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|sommer|winter|herbst)$/i, art: 'der', conf: '100%', trigger: 'Календарь', why: 'Все дни недели, месяцы и времена года (кроме «зима/лето» нет, и они тоже der!) — мужского рода.' },
    { re: /(?:er)$/i, art: 'der', conf: '~80%', trigger: '-er (прибор/профессия)', why: 'Приборы и профессии мужского рода на -er обычно имеют артикль der (der Drucker, der Computer, der Lehrer).' },
    { re: /(?:e)$/i, art: 'die', conf: '~90%', trigger: '-e', why: 'Около 90% двусложных существительных на -e — женского рода (die Lampe, die Küche, die Tasche).' }
  ];

  function detectNounGender(rawInput) {
    var clean = String(rawInput || '').trim().replace(/^(der|die|das)\s+/i, '');
    if (!clean) {
      return { detected: false, input: '', art: '?', cls: '', trigger: 'Введите слово', why: 'Например: Kaffeemaschine, Mädchen, Wohnung, Motor, Freitag.' };
    }
    var low = clean.toLowerCase();
    // 1. Exact lexicon match
    if (NOUN_LEXICON[low]) {
      var lx = NOUN_LEXICON[low];
      return {
        detected: true,
        input: clean,
        art: lx.art,
        cls: colorClassForArt(lx.art),
        parts: lx.parts || null,
        trigger: lx.parts ? 'Kompositum (' + lx.parts.join(' + ') + ')' : 'Словарь курса',
        why: lx.rule + ' (' + lx.ru + ').'
      };
    }
    // 2. Compound tail check against known nouns
    var keys = Object.keys(NOUN_LEXICON).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.length >= 4 && low.length > k.length + 2 && low.slice(-k.length) === k) {
        var tail = NOUN_LEXICON[k];
        var head = clean.slice(0, clean.length - k.length);
        var capTail = clean.slice(clean.length - k.length);
        return {
          detected: true,
          input: clean,
          art: tail.art,
          cls: colorClassForArt(tail.art),
          parts: [head, tail.art + ' ' + capTail],
          trigger: 'Последнее слово: ' + tail.art + ' ' + capTail,
          why: 'Правило композитов: первое слово (' + head + ') лишь уточняет смысл, а род 100% задаёт последний блок (' + tail.art + ' ' + capTail + ').'
        };
      }
    }
    // 3. Morphological suffix rules
    for (var r = 0; r < GENDER_RULES.length; r++) {
      var rule = GENDER_RULES[r];
      if (rule.re.test(clean)) {
        return {
          detected: true,
          input: clean,
          art: rule.art,
          cls: colorClassForArt(rule.art),
          trigger: rule.trigger + ' (' + rule.conf + ')',
          why: rule.why
        };
      }
    }
    return {
      detected: false,
      input: clean,
      art: '?',
      cls: 'g-ochre',
      trigger: 'Нет 100%-суффикса',
      why: 'У слова «' + clean + '» нет однозначного суффикса рода (-ung/-chen/-heit/-ismus). Попробуйте композит (напр. Haustürschlüssel) или слово с суффиксом.'
    };
  }

  function checkTileSentence(chosenTiles, acceptedAnswers) {
    var built = chosenTiles.join(' ').replace(/\s+([.,!?])/g, '$1').trim();
    for (var i = 0; i < acceptedAnswers.length; i++) {
      if (built.toLowerCase() === acceptedAnswers[i].toLowerCase()) {
        return { ok: true, built: built };
      }
    }
    return { ok: false, built: built };
  }

  var api = {
    NOUN_LEXICON: NOUN_LEXICON,
    colorizeTokens: colorizeTokens,
    inspectWord: inspectWord,
    detectNounGender: detectNounGender,
    checkTileSentence: checkTileSentence
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DL_ENGINE = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
