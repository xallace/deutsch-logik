/* Unified Curriculum Data for DEUTSCH·LOGIK
   Synthesizes Workflow D (Story A0), Workflow C (20 Grammar Shorts),
   Workflow E (DOCH), and Workflow B (Beim Arzt Survival Dialogue). */
(function (root) {
  'use strict';

  var SYSTEM_MODULES = [
    {
      id: 'space',
      num: '01',
      title: 'Пространство и падежи',
      subtitle: 'Вектор vs. Покой · Оси координат',
      accent: 'die',
      lab: 'space',
      summary: 'В русском «в» и «на» работают почти на автомате. В немецком падеж жёстко кодирует физику: есть ли вектор движения к цели (Wohin? → Akkusativ) или объект уже покоится (Wo? → Dativ), стоит ли он вертикально (stellen/stehen) или лежит плоско (legen/liegen).',
      rules: ['01', '09', '10', '11', '12', '20']
    },
    {
      id: 'frame',
      num: '02',
      title: 'Механика предложения',
      subtitle: 'Ось Позиции 2 · Рамка · Катапульта',
      accent: 'der',
      lab: 'frame',
      summary: 'Немецкая фраза строится как стальной каркас. Спрягаемый глагол прибит к Позиции 2, смысловая часть закрывает рамку в самом конце, а союзы weil/dass катапультируют глагол в финал.',
      rules: ['02', '04', '07', '17', '18']
    },
    {
      id: 'verbs',
      num: '03',
      title: 'Двигатель глаголов и DOCH',
      subtitle: 'haben/sein · werden · модальные · doch',
      accent: 'das',
      lab: 'verbs',
      summary: 'Каждый вспомогательный или модальный глагол меняет режим всей фразы: маршрут А→Б включает sein, призма werden даёт 3 разных смысла по хвосту фразы, а частица doch переворачивает чужое отрицание.',
      rules: ['05', '06', '08', '16', '19', '21']
    },
    {
      id: 'words',
      num: '04',
      title: 'Инженерия слов и рода',
      subtitle: 'Komposita · Детектор der / die / das',
      accent: 'ochre',
      lab: 'compound',
      summary: 'Длинные слова не нужно учить целиком: артикль ВСЕГДА задаёт последний блок. А десятки тысяч одиночных слов мгновенно выдают свой род через 100%-суффиксы.',
      rules: ['03', '13', '14', '15']
    }
  ];

  var RULES = [
    {
      id: '01', module: 'space', level: 'A1–A2', accent: 'die', lab: 'space',
      title: 'Wo? (Dativ) vs. Wohin? (Akkusativ)',
      subtitle: 'Движение внутрь/на поверхность vs. покой на месте',
      formula: 'Куда? (вектор) → Akkusativ (der→den) · Где? (покой) → Dativ (der/das→dem, die→der)',
      ru_vs_de: 'В русском: «на стол» (В.п.) vs «на столе» (П.п.). В немецком логика та же: действие-вектор включает Akkusativ, а нахождение на месте — Dativ. В Akkusativ меняется ТОЛЬКО мужской род (der → den)!',
      examples: [
        { de: 'Ich lege das Buch in die Kiste.', ru: 'Я кладу книгу (куда?) в коробку.', note: 'die Kiste остаётся die (Akk)' },
        { de: 'Das Buch liegt in der Kiste.', ru: 'Книга лежит (где?) в коробке.', note: 'die → der (Dativ!)' },
        { de: 'Ich lege den Hausschlüssel auf den Tisch.', ru: 'Я кладу ключ от дома на стол.', note: 'der Tisch → auf den Tisch (Akk)' },
        { de: 'Der Hausschlüssel liegt auf dem Tisch.', ru: 'Ключ лежит на столе.', note: 'der Tisch → auf dem Tisch (Dat)' }
      ],
      trap: { wrong: 'Der Schlüssel liegt auf den Tisch.', right: 'Der Schlüssel liegt auf dem Tisch.', why: 'Ключ уже лежит (нет движения, вопрос «где?») → нужен Dativ (dem).' }
    },
    {
      id: '02', module: 'frame', level: 'A1–A2', accent: 'der', lab: 'frame',
      title: 'Satzklammer (Немецкая глагольная рамка)',
      subtitle: 'Позиция 2 (кто/как) + всё остальное + Конец (главный смысл)',
      formula: 'Позиция 2: изменяемый глагол · Конец: Infinitiv / Partizip II / приставка',
      ru_vs_de: 'В русском мы говорим «Я хочу сегодня выпить кофе» — оба глагола рядом. Немцы растягивают глаголы как две скобки [will ... trinken], запирая внутри время, место и дополнения.',
      examples: [
        { de: 'Ich will Kaffee trinken.', ru: 'Я хочу выпить кофе.', note: 'will (2) ... trinken (конец)' },
        { de: 'Ich muss heute früh arbeiten.', ru: 'Я должен сегодня рано работать.', note: 'muss (2) ... arbeiten (конец)' },
        { de: 'Ich habe ein Buch gekauft.', ru: 'Я купил книгу.', note: 'Perfekt тоже рамка: habe ... gekauft' }
      ],
      trap: { wrong: 'Ich muss arbeiten heute früh.', right: 'Ich muss heute früh arbeiten.', why: 'Второй глагол всегда закрывает рамку в самом конце предложения.' }
    },
    {
      id: '03', module: 'words', level: 'A1–B1', accent: 'die', lab: 'compound',
      title: 'Komposita: артикль длинных слов',
      subtitle: 'Род и артикль ВСЕГДА задаёт ПОСЛЕДНЕЕ слово',
      formula: '[уточнение 1] + [уточнение 2] + [ГЛАВНОЕ СЛОВО] → род главного слова',
      ru_vs_de: 'Не пугайтесь слов из 18 букв! Смотрите сразу с конца: das Haus + die Tür + der Schlüssel = der Haustürschlüssel, потому что в конце стоит der Schlüssel.',
      examples: [
        { de: 'Die Kaffeemaschine ist neu, aber der Kaffee ist nicht heiß.', ru: 'Кофемашина новая, но кофе не горячий.', note: 'der Kaffee + die Maschine → die!' },
        { de: 'Das Krankenhaus ist ganz nah.', ru: 'Больница совсем рядом.', note: 'kranken + das Haus → das!' },
        { de: 'Der Arbeitsplatz ist modern.', ru: 'Рабочее место современное.', note: 'die Arbeit + der Platz → der!' }
      ],
      trap: { wrong: 'der Kaffeemaschine (по слову Kaffee)', right: 'die Kaffeemaschine (по слову die Maschine)', why: 'Первые части работают как прилагательные-определения; главный блок — всегда последний.' }
    },
    {
      id: '04', module: 'frame', level: 'A1–A2', accent: 'das', lab: 'frame',
      title: 'Отделяемые приставки (AUF / ZU / EIN / AUS / AN)',
      subtitle: 'Физический вектор действия + рамка',
      formula: 'auf (открыть/вверх) · zu (закрыть) · ein (внутрь) · aus (наружу/выкл)',
      ru_vs_de: 'Не нужно зубрить десятки глаголов: приставка задаёт 3D-вектор! В настоящем времени она отрывается от корня и встаёт в конец предложения как правая скобка рамки.',
      examples: [
        { de: 'Es ist sieben Uhr. Ich stehe auf.', ru: 'Семь часов. Я встаю.', note: 'aufstehen → stehe ... auf (вверх)' },
        { de: 'Ich mache die Augen auf.', ru: 'Я открываю глаза.', note: 'aufmachen → открыть' },
        { de: 'Ich mache das Licht aus und mache die Tür zu.', ru: 'Я выключаю свет и закрываю дверь.', note: 'aus (выкл) · zu (закрыть)' },
        { de: 'Ich steige aus und rufe meinen Freund an.', ru: 'Я выхожу и звоню своему другу.', note: 'aussteigen · anrufen' }
      ],
      trap: { wrong: 'Ich aufstehe um sieben.', right: 'Ich stehe um sieben auf.', why: 'Ударная приставка auf- в настоящем времени обязательно отделяется в конец.' }
    },
    {
      id: '05', module: 'verbs', level: 'A2', accent: 'die', lab: 'verbs',
      title: 'Perfekt: haben или sein?',
      subtitle: 'Маршрут A → B или смена состояния vs. действие на месте',
      formula: 'Движение A→B / смена состояния = sein · Остальные 90% = haben',
      ru_vs_de: 'В русском прошедшее время одно («пил / побежал»). В немецком вспомогательный глагол работает как датчик физики: переместилось ли тело из точки A в точку B (или сменило состояние)? Да → sein. Нет → haben.',
      examples: [
        { de: 'Ich bin schnell zur U-Bahn-Station gelaufen.', ru: 'Я быстро побежал к станции метро.', note: 'маршрут A→B → sein' },
        { de: 'Sie ist früh aufgewacht.', ru: 'Она рано проснулась.', note: 'смена состояния (сон→бодрств.) → sein' },
        { de: 'Ich habe meinen Kaffee getrunken.', ru: 'Я выпил свой кофе.', note: 'действие на месте → haben' }
      ],
      trap: { wrong: 'Ich habe nach Berlin gefahren.', right: 'Ich bin nach Berlin gefahren.', why: 'fahren (ехать) перемещает вас из А в Б → строго sein!' }
    },
    {
      id: '06', module: 'verbs', level: 'A1', accent: 'ochre', lab: 'verbs',
      title: 'Отрицание: nicht vs. kein',
      subtitle: 'Существительное без артикля vs. глагол / качество',
      formula: 'ein / ∅ + существительное → kein(e) · глагол / прилагательное / der-die-das → nicht',
      ru_vs_de: 'В русском везде «не / нет». В немецком kein буквально «стирает» неопределённый артикль перед существительным («никакого хлеба»), а nicht ставит щит перед действием или качеством.',
      examples: [
        { de: 'Ich habe kein Brot und keine Zeit.', ru: 'У меня нет хлеба и нет времени.', note: 'Brot/Zeit без артикля → kein/keine' },
        { de: 'Der Kaffee ist nicht heiß.', ru: 'Кофе не горячий.', note: 'прилагательное heiß → nicht' },
        { de: 'Ich arbeite heute nicht.', ru: 'Я сегодня не работаю.', note: 'отрицание глагола → nicht' }
      ],
      trap: { wrong: 'Ich habe nicht Zeit.', right: 'Ich habe keine Zeit.', why: 'Zeit — существительное без артикля → перед ним можно только kein/keine!' }
    },
    {
      id: '07', module: 'frame', level: 'A2', accent: 'der', lab: 'frame',
      title: 'Катапульта глагола: weil / dass vs. denn',
      subtitle: 'Куда улетает глагол после запятой?',
      formula: 'weil / dass / wenn → глагол в КОНЕЦ · denn / aber / und → Позиция 2',
      ru_vs_de: 'Подчинительные союзы (weil, dass, wenn) строят вложенную камеру и катапультируют изменяемый глагол в самый конец. Если хотите говорить с привычным порядком — берите союз-спасатель denn!',
      examples: [
        { de: 'Ich warte im Café, weil ich müde bin.', ru: 'Я жду в кафе, потому что я устал.', note: 'weil → bin в конце' },
        { de: 'Plötzlich merke ich, dass mein Schlüssel weg ist!', ru: 'Вдруг я замечаю, что моего ключа нет!', note: 'dass → ist в конце' },
        { de: 'Mein Freund kommt, denn er hat meinen Ersatzschlüssel.', ru: 'Мой друг приходит, так как у него есть мой запасной ключ.', note: 'denn → hat на 2-м месте!' }
      ],
      trap: { wrong: 'Ich bleibe hier, weil ich bin müde.', right: 'Ich bleibe hier, weil ich müde bin.', why: 'После weil глагол должен замкнуть придаточное предложение в конце.' }
    },
    {
      id: '08', module: 'verbs', level: 'A2–B1', accent: 'ochre', lab: 'verbs',
      title: '3 лица глагола werden (Оптическая призма)',
      subtitle: 'Смотрите в конец фразы — хвост сразу выдаёт смысл',
      formula: '1) один = стать · 2) + Infinitiv = будущее · 3) + Partizip II = пассив',
      ru_vs_de: 'Один глагол werden расщепляется на 3 луча в зависимости от того, что стоит в конце рамки: прилагательное («становится темно»), инфинитив («буду учить») или 3-я форма («дом строится»).',
      examples: [
        { de: 'Es wird langsam dunkel.', ru: 'Становится потихоньку темно.', note: 'без второго глагола = становиться' },
        { de: 'Ich werde gut Deutsch sprechen.', ru: 'Я буду хорошо говорить по-немецки.', note: '+ Infinitiv (sprechen) = Futur I' },
        { de: 'Das Haus wird schnell gebaut.', ru: 'Дом быстро строится.', note: '+ Partizip II (gebaut) = Passiv' }
      ],
      trap: { wrong: 'Das Haus wird bauen.', right: 'Das Haus wird gebaut.', why: 'Инфинитив даёт будущее время («дом будет строить»), а пассив требует Partizip II (gebaut).' }
    },
    {
      id: '09', module: 'space', level: 'A1', accent: 'der', lab: 'space',
      title: 'Навигатор направлений: nach / zu / in',
      subtitle: 'Три немецких предлога на место русского «в / к»',
      formula: 'nach = города/страны/Hause · zu = люди/цели (+Dat) · in = внутрь здания (+Akk)',
      ru_vs_de: 'По-русски мы идём «в Берлин», «к врачу» и «в кино». Немцы делят маршруты по масштабу цели: точка на карте (nach), контакт с человеком/местом (zu) или вход внутрь стены (in).',
      examples: [
        { de: 'Ich fahre nach Berlin.', ru: 'Я еду в Берлин.', note: 'город без артикля → nach' },
        { de: 'Ich gehe heute zum Arzt.', ru: 'Я сегодня иду к врачу.', note: 'к человеку: zu + dem = zum' },
        { de: 'Wir gehen heute ins Kino.', ru: 'Мы сегодня идём в кино.', note: 'внутрь помещения: in + das = ins' }
      ],
      trap: { wrong: 'Ich fahre in Berlin. / Ich gehe nach Arzt.', right: 'Ich fahre nach Berlin. / Ich gehe zum Arzt.', why: 'Города без артикля берут nach, люди и профессии — zu.' }
    },
    {
      id: '10', module: 'space', level: 'A2', accent: 'das', lab: 'space',
      title: 'Геометрия глаголов: stellen/stehen vs. legen/liegen',
      subtitle: 'Вертикаль (↕) vs. Горизонталь (↔) × Движение vs. Покой',
      formula: 'буква «e» (stEllen/lEgen) = КУДА (Akk) · stEhen/lIEgen = ГДЕ (Dat)',
      ru_vs_de: 'Четыре глагола, которые путают даже на B1, строятся как 2×2 матрица осей. Буква E в корне (stellen, legen) означает действие-перемещение (Akkusativ); stehen/liegen — статичное состояние (Dativ).',
      examples: [
        { de: 'Ich stelle die Flasche auf den Tisch.', ru: 'Я ставлю бутылку (вертикально) на стол.', note: 'вертикально + куда → stellen (Akk)' },
        { de: 'Die Flasche steht auf dem Tisch.', ru: 'Бутылка стоит на столе.', note: 'вертикально + где → stehen (Dat)' },
        { de: 'Ich lege das Handy auf den Tisch.', ru: 'Я кладу телефон (горизонтально) на стол.', note: 'плашмя + куда → legen (Akk)' },
        { de: 'Das Handy liegt auf dem Tisch.', ru: 'Телефон лежит на столе.', note: 'плашмя + где → liegen (Dat)' }
      ],
      trap: { wrong: 'Das Handy legt auf dem Tisch.', right: 'Das Handy liegt auf dem Tisch.', why: 'legen — это класть (действие), а лежать (покой) — liegen!' }
    },
    {
      id: '11', module: 'space', level: 'A1–A2', accent: 'das', lab: 'space',
      title: 'Магниты Dativ: mit · aus · bei · von',
      subtitle: 'Предлоги, после которых 100% всегда Dativ',
      formula: 'mit, aus, bei, von, zu, nach, seit → ВСЕГДА dem / der / dem / den (+n)',
      ru_vs_de: 'После этих предлогов не нужно задавать вопрос «где или куда?» — они механически притягивают Dativ. Часто сливаются с dem: bei + dem = beim, von + dem = vom, zu + dem = zum.',
      examples: [
        { de: 'Ich fahre mit dem Bus.', ru: 'Я еду на автобусе (букв. с автобусом).', note: 'der Bus → mit dem Bus' },
        { de: 'Er kommt aus dem Haus.', ru: 'Он выходит из дома.', note: 'das Haus → aus dem Haus' },
        { de: 'Ich bin beim Arzt.', ru: 'Я у врача.', note: 'bei + dem = beim' }
      ],
      trap: { wrong: 'Ich gehe mit den Freund.', right: 'Ich gehe mit dem Freund.', why: 'mit всегда требует Dativ (der → dem, а не den).' }
    },
    {
      id: '12', module: 'space', level: 'A1', accent: 'die', lab: 'space',
      title: 'Магниты Akkusativ: für · durch · gegen · ohne',
      subtitle: 'Предлоги, после которых 100% всегда Akkusativ',
      formula: 'für, durch, gegen, ohne, um, bis → ВСЕГДА Akkusativ (меняется только der → den)',
      ru_vs_de: 'Отличная новость для начинающих: после всех этих предлогов меняется ТОЛЬКО мужской род (der → den / einen). Женский (die) и средний (das) не меняются вообще!',
      examples: [
        { de: 'Wir gehen durch den Park.', ru: 'Мы идём через парк (насквозь).', note: 'der Park → durch den Park' },
        { de: 'Das Buch ist für einen Freund.', ru: 'Эта книга для друга.', note: 'der Freund → für einen Freund' },
        { de: 'Er fährt nie ohne einen Plan.', ru: 'Он никогда не едет без плана.', note: 'der Plan → ohne einen Plan' }
      ],
      trap: { wrong: 'Das Geschenk ist für dem Vater.', right: 'Das Geschenk ist für den Vater.', why: 'für — магнит Akkusativ (den, а не dem).' }
    },
    {
      id: '13', module: 'words', level: 'A1', accent: 'die', lab: 'compound',
      title: '5 окончаний = 100% артикль DIE',
      subtitle: 'Тысячи слов женского рода без зубрёжки',
      formula: '-ung · -heit · -keit · -schaft · -tion → ВСЕГДА die',
      ru_vs_de: 'Вместо того чтобы учить род каждого слова отдельно, сканируйте хвост слова. Если оно заканчивается на любой из этих 5 суффиксов — ставьте красный артикль die со 100% гарантией.',
      examples: [
        { de: 'Die Wohnung ist hell und groß.', ru: 'Квартира светлая и большая.', note: '-ung → die' },
        { de: 'Die Gesundheit ist am wichtigsten.', ru: 'Здоровье — самое важное.', note: '-heit → die' },
        { de: 'Die Information ist sehr wichtig.', ru: 'Эта информация очень важна.', note: '-tion → die' }
      ],
      trap: { wrong: 'der Zeitung / das Station', right: 'die Zeitung / die Station', why: '-ung и -tion без исключений дают женский род die.' }
    },
    {
      id: '14', module: 'words', level: 'A1', accent: 'das', lab: 'compound',
      title: 'Почему «девочка» — DAS Mädchen? (3 ключа к DAS)',
      subtitle: 'Уменьшительный луч -chen/-lein, -ment/-um и глагол с большой буквы',
      formula: '-chen / -lein (100%) · -ment / -um · Infinitiv с большой буквы → das',
      ru_vs_de: 'Слово Mädchen образовано от устаревшего die Magd + уменьшительный суффикс -chen. В немецком грамматический суффикс -chen/-lein перебивает биологический пол и включает средний род das!',
      examples: [
        { de: 'Das Mädchen isst ein Brötchen.', ru: 'Девочка ест булочку.', note: 'оба слова на -chen = das!' },
        { de: 'Das Dokument liegt im Zentrum.', ru: 'Документ лежит в центре.', note: '-ment и -um → das' },
        { de: 'Das Lernen macht heute Spaß.', ru: 'Учёба сегодня приносит удовольствие.', note: 'глагол lernen → das Lernen' }
      ],
      trap: { wrong: 'die Mädchen', right: 'das Mädchen', why: 'Любое слово на -chen (das Brötchen, das Hündchen, das Mädchen) — среднего рода.' }
    },
    {
      id: '15', module: 'words', level: 'A1', accent: 'der', lab: 'compound',
      title: '4 верных признака артикля DER',
      subtitle: 'Календарь, приборы на -er и суффиксы -or / -ling / -ismus',
      formula: 'Дни/месяцы/сезоны · -er (приборы/профессии) · -or · -ling · -ismus → der',
      ru_vs_de: 'Большинство календарных понятий (кроме die Nacht / die Woche) и почти все технические приборы на -er (der Drucker, der Computer) принадлежат к мужскому роду der.',
      examples: [
        { de: 'Der Montag beginnt früh.', ru: 'Понедельник начинается рано.', note: 'дни недели = der' },
        { de: 'Der Drucker funktioniert perfekt.', ru: 'Принтер работает идеально.', note: 'прибор на -er = der' },
        { de: 'Der Motor läuft sehr ruhig.', ru: 'Мотор работает очень тихо.', note: '-or = der' }
      ],
      trap: { wrong: 'das Montag / die Computer', right: 'der Montag / der Computer', why: 'Дни недели и приборы на -er — мужского рода (der).' }
    },
    {
      id: '16', module: 'verbs', level: 'A1–A2', accent: 'der', lab: 'verbs',
      title: '3 «знать»: wissen · kennen · können',
      subtitle: 'Факт vs. Знакомство vs. Навык',
      formula: 'wissen (факт) · kennen (человек/город/фильм) · können (уметь / язык)',
      ru_vs_de: 'Русское «знать» покрывает сразу три разных процесса. Немцы строго разделяют: обладать информацией (wissen), быть знакомым с объектом (kennen) и владеть навыком или языком (können).',
      examples: [
        { de: 'Ich weiß die Antwort.', ru: 'Я знаю ответ.', note: 'wissen = конкретный факт' },
        { de: 'Ich kenne Berlin sehr gut.', ru: 'Я очень хорошо знаю Берлин.', note: 'kennen = знаком с городом' },
        { de: 'Sie kann gut Deutsch.', ru: 'Она хорошо знает немецкий.', note: 'können = умеет (язык/навык)' }
      ],
      trap: { wrong: 'Ich weiß Berlin. / Ich weiß Deutsch.', right: 'Ich kenne Berlin. / Ich kann Deutsch.', why: 'С городами и людьми — kennen, с языками и навыками — können!' }
    },
    {
      id: '17', module: 'frame', level: 'A2–B1', accent: 'ochre', lab: 'frame',
      title: 'Код порядка слов: Te-Ka-Mo-Lo',
      subtitle: 'Как расставить обстоятельства в середине предложения',
      formula: 'TE (Когда?) → KA (Почему?) → MO (Как?) → LO (Куда / Где?)',
      ru_vs_de: 'В русском мы свободно переставляем «поеду в Мюнхен сегодня на поезде». В немецком середина рамки течёт по ритму Te-Ka-Mo-Lo: от абстрактного времени к конкретной географической точке в конце.',
      examples: [
        { de: 'Ich fahre heute wegen der Arbeit mit dem Zug nach München.', ru: 'Я еду сегодня из-за работы на поезде в Мюнхен.', note: 'TE (heute) → KA (wegen...) → MO (mit...) → LO (nach...)' },
        { de: 'Ich fahre heute mit dem Zug nach Berlin.', ru: 'Я еду сегодня на поезде в Берлин.', note: 'если слота KA нет — порядок не меняется' }
      ],
      trap: { wrong: 'Ich fahre nach München mit dem Zug heute.', right: 'Ich fahre heute mit dem Zug nach München.', why: 'Время (TE) всегда стремится вперёд, а место (LO) замыкает середину перед вторым глаголом.' }
    },
    {
      id: '18', module: 'frame', level: 'A1', accent: 'die', lab: 'frame',
      title: 'Качели инверсии (Ось Позиции 2)',
      subtitle: 'Почему «Heute GEHE ICH», а не «Heute ich gehe»',
      formula: 'Позиция 1 (кто/когда/где) | ПОЗИЦИЯ 2 (ГЛАГОЛ!) | Позиция 3 (остальное)',
      ru_vs_de: 'Главная ошибка русскоязычных: перенести на Позицию 1 время («Heute») и оставить «ich gehe» за ним, сдвигая глагол на 3-е место. Глагол в немецком прибит ко 2-му месту как ось качелей: если 3-й элемент прыгнул на 1-е место, подлежащее (ich) перелетает на 3-е!',
      examples: [
        { de: 'Ich gehe heute ins Büro.', ru: 'Я иду сегодня в офис.', note: 'прямой порядок: 1(Ich) 2(gehe) 3(heute)' },
        { de: 'Heute gehe ich ins Büro.', ru: 'Сегодня я иду в офис.', note: 'инверсия: 1(Heute) 2(gehe) 3(ich)' },
        { de: 'In Berlin wohne ich gern.', ru: 'В Берлине я живу с удовольствием.', note: 'место на 1-м месте → глагол снова 2-й!' }
      ],
      trap: { wrong: 'Heute ich gehe ins Büro.', right: 'Heute gehe ich ins Büro.', why: 'Перед глаголом в обычном повествовательном предложении может стоять ТОЛЬКО один смысловой блок!' }
    },
    {
      id: '19', module: 'verbs', level: 'A1–A2', accent: 'das', lab: 'verbs',
      title: 'Светофор модальных: müssen · dürfen · sollen',
      subtitle: 'Обязанность, разрешение/запрет и чужой совет',
      formula: 'müssen (должен) · dürfen (разрешено) · nicht dürfen (НЕЛЬЗЯ!) · müssen nicht (не обязан)',
      ru_vs_de: 'Критическая ловушка: русское «нельзя / не должен» переводится ПО-РАЗНОМУ. Запрет (по закону/правилам) — это строго nicht dürfen. А nicht müssen означает всего лишь «не обязательно»!',
      examples: [
        { de: 'Ich muss morgen früh arbeiten.', ru: 'Я должен завтра рано работать.', note: 'жёсткая необходимость (müssen)' },
        { de: 'Hier darf man nicht parken.', ru: 'Здесь нельзя парковаться (запрещено!).', note: 'nicht dürfen = запрет' },
        { de: 'Ich soll viel Wasser trinken.', ru: 'Мне следует пить много воды (совет врача).', note: 'sollen = поручение/совет' }
      ],
      trap: { wrong: 'Hier muss man nicht rauchen (= здесь запрещено).', right: 'Hier darf man nicht rauchen.', why: 'muss nicht значит «курить необязательно», а полный запрет — всегда darf nicht!' }
    },
    {
      id: '20', module: 'space', level: 'A1', accent: 'der', lab: 'space',
      title: 'Ловушка «es gibt» (+ всегда Akkusativ!)',
      subtitle: 'Почему русское «есть парк» становится «einen Park»',
      formula: 'es gibt + AKKUSATIV (einen / keinen для мужского рода; глагол всегда gibt)',
      ru_vs_de: 'В русском «В городе есть парк» слово «парк» стоит в именительном падеже. В немецком «es» — формальное подлежащее («оно даёт»), а объект после gibt — прямое дополнение в Akkusativ!',
      examples: [
        { de: 'Hier gibt es einen großen Park.', ru: 'Здесь есть большой парк.', note: 'der Park → einen Park (Akk!)' },
        { de: 'Dort gibt es ein kleines Café.', ru: 'Там есть маленькое кафе.', note: 'das Café → ein Café' },
        { de: 'Leider gibt es keinen Platz.', ru: 'К сожалению, места нет.', note: 'der Platz → keinen Platz' }
      ],
      trap: { wrong: 'Hier gibt es ein Supermarkt.', right: 'Hier gibt es einen Supermarkt.', why: 'der Supermarkt — мужского рода, поэтому после es gibt обязательно einen!' }
    },
    {
      id: '21', module: 'verbs', level: 'A1–A2', accent: 'das', lab: 'verbs',
      title: 'Магическое слово DOCH (Workflow E)',
      subtitle: '1 короткое слово = 3 суперсилы, которых нет в русском',
      formula: '1) ответ «ДА» на вопрос с nicht · 2) возражение на «нет» · 3) тёплая просьба',
      ru_vs_de: 'В русском на вопрос «Ты не пойдёшь?» можно запутаться между «да» и «нет». Немцы создали специальный переключатель DOCH: он отменяет любое отрицание, а в повелительном наклонении делает сухой приказ дружелюбным («Да заходи же!»).',
      examples: [
        { de: 'Kommst du heute nicht mit? — Doch!', ru: 'Ты сегодня не идёшь с нами? — Нет, иду!', note: 'на вопрос с nicht нельзя отвечать ja!' },
        { de: 'Du hast keine Zeit! — Doch, ich habe Zeit!', ru: 'У тебя нет времени! — Да есть у меня время!', note: 'отмена чужого отрицания' },
        { de: 'Komm doch rein!', ru: 'Да заходи же!', note: 'мягкая дружелюбная частица' }
      ],
      trap: { wrong: 'Kommst du nicht? — Ja, ich komme.', right: 'Kommst du nicht? — Doch, ich komme!', why: 'Просто «Ja» на отрицательный вопрос звучит противоречиво; нужен переключатель Doch.' }
    }
  ];

  var STORY_A0 = {
    title_de: 'Mein erster Morgen in Deutschland',
    title_ru: 'Моё первое утро в Германии: кофе, ключи и метро',
    subtitle_ru: '20 фраз уровня A0 · Все 7 базовых правил в одной связной истории',
    chapters: [
      { num: 1, de: 'Kapitel 1 · Aufwachen & Kaffee', ru: 'Глава 1 · Пробуждение и кофе', audio_de: 'Aufwachen und Kaffee.' },
      { num: 2, de: 'Kapitel 2 · Keine Zeit & der Hausschlüssel', ru: 'Глава 2 · Нет времени и ключ от дома', audio_de: 'Keine Zeit und der Hausschlüssel.' },
      { num: 3, de: 'Kapitel 3 · Die U-Bahn & der Schock', ru: 'Глава 3 · Метро и неожиданный шок', audio_de: 'Die U-Bahn und der Schock.' },
      { num: 4, de: 'Kapitel 4 · Happy End im Café', ru: 'Глава 4 · Счастливый финал в кафе', audio_de: 'Happy End im Café.' }
    ],
    sentences: [
      { n: 1, ch: 1, rule: '04', accent: 'das', tag: 'ПРАВИЛО 4 · ПРИСТАВКА AUF', kind: 'frame_auf',
        de: 'Es ist sieben Uhr. Ich stehe auf.', ru: 'Семь часов. Я встаю.',
        hint: 'Отделяемая приставка auf- (вверх) улетает в самый конец фразы.' },
      { n: 2, ch: 1, rule: '04', accent: 'das', tag: 'ПРАВИЛО 4 · ПРИСТАВКА AUF', kind: 'frame_auf',
        de: 'Ich mache die Augen auf.', ru: 'Я открываю глаза.',
        hint: 'aufmachen = открыть. Глагол mache на 2-м месте, приставка auf в конце.' },
      { n: 3, ch: 1, rule: '01', accent: 'die', tag: 'ПРАВИЛО 1 · WOHIN? → AKKUSATIV', kind: 'space_in_akk',
        de: 'Ich gehe in die Küche.', ru: 'Я иду на кухню.',
        hint: 'Вопрос «Куда?» (движение внутрь) → Akkusativ: in die Küche.' },
      { n: 4, ch: 1, rule: '02', accent: 'der', tag: 'ПРАВИЛО 1 + 2 · WO (DAT) + РАМКА', kind: 'frame_will',
        de: 'Ich bin in der Küche. Ich will Kaffee trinken.', ru: 'Я на кухне. Я хочу выпить кофе.',
        hint: 'Где? (покой) → Dativ: in der Küche (die → der). Рамка: will (2) ... trinken (конец).' },
      { n: 5, ch: 1, rule: '03', accent: 'die', tag: 'ПРАВИЛО 3 + 6 · КОМПОЗИТА + NICHT', kind: 'comp_kaffee',
        de: 'Die Kaffeemaschine ist neu, aber der Kaffee ist nicht heiß.', ru: 'Кофемашина новая, но кофе не горячий.',
        hint: 'Род по последнему слову: die Maschine → die Kaffeemaschine. Перед качеством — nicht.' },
      { n: 6, ch: 2, rule: '06', accent: 'die', tag: 'ПРАВИЛО 6 · KEIN / KEINE', kind: 'verb_kein',
        de: 'Ich habe kein Brot und keine Zeit.', ru: 'У меня нет хлеба и нет времени.',
        hint: 'Отрицаем существительные без артикля → всегда kein / keine (никогда nicht!).' },
      { n: 7, ch: 2, rule: '02', accent: 'der', tag: 'ПРАВИЛО 2 · SATZKLAMMER', kind: 'frame_muss',
        de: 'Ich muss heute früh arbeiten.', ru: 'Я должен сегодня рано работать.',
        hint: 'Немецкая рамка: muss строго на 2-м месте, arbeiten улетает в конец.' },
      { n: 8, ch: 2, rule: '01', accent: 'die', tag: 'ПРАВИЛО 3 + 1 · КОМПОЗИТА + AKK', kind: 'space_auf_akk',
        de: 'Ich lege den Hausschlüssel auf den Tisch.', ru: 'Я кладу ключ от дома на стол.',
        hint: 'der Schlüssel → der Hausschlüssel. Куда? (движение) → auf den Tisch (Akkusativ).' },
      { n: 9, ch: 2, rule: '01', accent: 'das', tag: 'ПРАВИЛО 1 · WO? → DATIV', kind: 'space_auf_dat',
        de: 'Der Hausschlüssel liegt auf dem Tisch.', ru: 'Ключ от дома лежит на столе.',
        hint: 'Теперь ключ уже лежит на месте (где?) → Dativ: auf dem Tisch.' },
      { n: 10, ch: 2, rule: '04', accent: 'die', tag: 'ПРАВИЛО 4 · ПРИСТАВКИ AUS И ZU', kind: 'frame_zu',
        de: 'Ich mache das Licht aus und mache die Tür zu.', ru: 'Я выключаю свет и закрываю дверь.',
        hint: 'ausmachen = выключить (aus в конец), zumachen = закрыть (zu в конец).' },
      { n: 11, ch: 3, rule: '05', accent: 'die', tag: 'ПРАВИЛО 5 + 3 · PERFEKT (SEIN)', kind: 'verb_sein',
        de: 'Ich bin schnell zur U-Bahn-Station gelaufen.', ru: 'Я быстро побежал к станции метро.',
        hint: 'Движение из точки А в точку Б → Perfekt с sein (bin gelaufen). die Station → zur Station.' },
      { n: 12, ch: 3, rule: '05', accent: 'das', tag: 'ПРАВИЛО 5 + 4 · PERFEKT (SEIN) + EIN', kind: 'frame_ein',
        de: 'Ich bin in die U-Bahn eingestiegen.', ru: 'Я сел (вошёл) в метро.',
        hint: 'Приставка ein- (внутрь) + движение → Perfekt с sein: bin eingestiegen.' },
      { n: 13, ch: 3, rule: '05', accent: 'der', tag: 'ПРАВИЛО 5 · PERFEKT (HABEN)', kind: 'verb_haben',
        de: 'Ich habe meinen Kaffee getrunken.', ru: 'Я выпил свой кофе.',
        hint: 'Обычное действие на месте (нет перемещения А → Б) → Perfekt с haben!' },
      { n: 14, ch: 3, rule: '07', accent: 'der', tag: 'ПРАВИЛО 7 · КАТАПУЛЬТА DASS', kind: 'frame_dass',
        de: 'Plötzlich merke ich, dass mein Schlüssel weg ist!', ru: 'Вдруг я замечаю, что моего ключа нет!',
        hint: 'После союза dass глагол ist катапультируется в самый конец придаточного!' },
      { n: 15, ch: 3, rule: '05', accent: 'der', tag: 'ПРАВИЛО 5 · PERFEKT (HABEN)', kind: 'verb_haben',
        de: 'Ich habe den Hausschlüssel zu Hause vergessen!', ru: 'Я забыл ключ от дома дома!',
        hint: 'Забыть — действие, не связанное с движением → Perfekt с haben.' },
      { n: 16, ch: 4, rule: '04', accent: 'ochre', tag: 'ПРАВИЛО 4 · ПРИСТАВКИ AUS И AN', kind: 'frame_aus',
        de: 'Ich steige aus und rufe meinen Freund an.', ru: 'Я выхожу и звоню своему другу.',
        hint: 'aussteigen = выйти наружу (aus), anrufen = позвонить (an улетает в конец).' },
      { n: 17, ch: 4, rule: '06', accent: 'die', tag: 'ПРАВИЛО 6 · KEIN И NICHT ВМЕСТЕ', kind: 'verb_kein',
        de: 'Er sagt: „Kein Problem! Ich bin nicht weit.“', ru: 'Он говорит: «Без проблем! Я недалеко.»',
        hint: 'Problem (существительное) → kein Problem. weit (наречие) → nicht weit.' },
      { n: 18, ch: 4, rule: '07', accent: 'die', tag: 'ПРАВИЛО 7 · КАТАПУЛЬТА WEIL', kind: 'frame_weil',
        de: 'Ich warte im Café, weil ich müde bin.', ru: 'Я жду в кафе, потому что я устал.',
        hint: 'После союза weil глагол bin улетает со второго места в самый конец.' },
      { n: 19, ch: 4, rule: '07', accent: 'das', tag: 'ПРАВИЛО 7 + 3 · DENN + КОМПОЗИТА', kind: 'frame_denn',
        de: 'Mein Freund kommt, denn er hat meinen Ersatzschlüssel.', ru: 'Мой друг приходит, так как у него есть мой запасной ключ.',
        hint: 'Союз denn НЕ двигает глагол! А род слова Ersatzschlüssel задаёт der Schlüssel.' },
      { n: 20, ch: 4, rule: '03', accent: 'das', tag: 'ФИНАЛ ИСТОРИИ · 20 / 20', kind: 'comp_ersatz',
        de: 'Ich lache: Mein erster Morgen in Deutschland ist super!', ru: 'Я смеюсь: моё первое утро в Германии — супер!',
        hint: 'Вы только что разобрали целую историю на немецком со всеми семью правилами!' }
    ]
  };

  var SURVIVAL_ARZT = {
    title_de: 'Beim Arzt in Deutschland',
    title_ru: 'На приёме у врача в Германии (Workflow B)',
    subtitle_ru: 'Живой диалог A1–A2 · 3 ловушки русскоязычных · Озвучка Katja & Conrad',
    speakers: {
      A: { name: 'Frau Weber (Praxis)', label_ru: 'Регистратура / Врач', cls: 'g-der' },
      B: { name: 'Alex (Patient)', label_ru: 'Пациент', cls: 'g-die' }
    },
    dialogue: [
      { n: 1, spk: 'A', de: 'Guten Morgen, Praxis Doktor Klein. Haben Sie einen Termin?', ru: 'Доброе утро, праксис доктора Кляйна. У вас есть запись?',
        trap: { wrong: 'Termin = «термин» (слово)', right: 'der Termin = запись на приём / назначенное время', why: 'Ложный друг переводчика! В Германии Termin нужен почти везде: к врачу, в банк, в Bürgeramt.' } },
      { n: 2, spk: 'B', de: 'Guten Morgen! Ja, ich habe um zehn Uhr einen Termin.', ru: 'Доброе утро! Да, у меня запись на десять часов.',
        note: 'einen Termin (Akkusativ, мужской род der Termin)' },
      { n: 3, spk: 'A', de: 'Darf ich bitte Ihre Versichertenkarte sehen?', ru: 'Можно, пожалуйста, посмотреть вашу страховую карту?',
        note: 'die Versichertenkarte (или Krankenkassenkarte) — карточка медстраховки.' },
      { n: 4, spk: 'B', de: 'Ja, natürlich. Hier ist meine Karte.', ru: 'Да, конечно. Вот моя карта.',
        note: 'meine Karte (женский род die Karte).' },
      { n: 5, spk: 'A', de: 'Danke! Was fehlt Ihnen denn heute?', ru: 'Спасибо! Что вас сегодня беспокоит?',
        trap: { wrong: 'Was fehlt Ihnen? = «Чего вам не хватает?»', right: 'Was fehlt Ihnen? = «На что жалуетесь? / Что болит?»', why: 'Буквально «чего не хватает», но у врача это вежливый стандартный вопрос о симптомах.' } },
      { n: 6, spk: 'B', de: 'Ich habe starkes Fieber und mir tut der Kopf weh.', ru: 'У меня высокая температура и болит голова.',
        trap: { wrong: 'Mein Kopf schmerzt mich (калька с русского)', right: 'Mir tut der Kopf weh / Ich habe Kopfschmerzen', why: 'Запомните конструкцию: Dativ (mir) + tut + часть тела + weh!' } },
      { n: 7, spk: 'A', de: 'Brauchen Sie eine Krankschreibung für die Arbeit?', ru: 'Вам нужен больничный лист для работы?',
        note: 'die Krankschreibung (или AU) — больничный лист (-ung = 100% die!).' },
      { n: 8, spk: 'B', de: 'Ja, bitte. Und bekomme ich auch ein Rezept für die Apotheke?', ru: 'Да, пожалуйста. И я получу также рецепт для аптеки?',
        note: 'das Rezept (средний род). Антибиотики в Германии только по рецепту.' }
    ],
    vocab: [
      { de: 'der Termin', art: 'der', ru: 'запись на приём, встреча', note: 'Ложный друг! Не «термин».' },
      { de: 'die Versichertenkarte', art: 'die', ru: 'карта медстраховки', note: 'die Karte в конце → die!' },
      { de: 'das Fieber', art: 'das', ru: 'температура, жар', note: 'Ich habe Fieber.' },
      { de: 'der Kopf', art: 'der', ru: 'голова', note: 'Mir tut der Kopf weh.' },
      { de: 'die Krankschreibung', art: 'die', ru: 'больничный лист', note: 'Суффикс -ung → всегда die!' },
      { de: 'das Rezept', art: 'das', ru: 'рецепт (врачебный)', note: 'Средний род (das).' },
      { de: 'die Apotheke', art: 'die', ru: 'аптека', note: 'Женский род (die).' },
      { de: 'Was fehlt Ihnen?', art: 'ochre', ru: 'На что жалуетесь?', note: 'Идиома врача — не переводите дословно.' }
    ]
  };

  var DIAGNOSTICS = [
    { id: 'd1', rule: '01', q: '«Книга уже лежит на столе». Выберите верный немецкий вариант:',
      opts: [
        { t: 'Das Buch liegt auf den Tisch.', ok: false, why: 'auf den Tisch — это Akkusativ (вопрос «куда?»). Но книга уже лежит на месте!' },
        { t: 'Das Buch liegt auf dem Tisch.', ok: true, why: 'Верно! Покой (вопрос «где?») включает Dativ: der Tisch → auf dem Tisch.' },
        { t: 'Das Buch legt auf dem Tisch.', ok: false, why: 'legen — это «класть» (движение), а «лежать» — liegen.' }
      ] },
    { id: 'd2', rule: '03', q: 'Какой артикль у длинного слова «Krankenhaus» (kranken + das Haus)?',
      opts: [
        { t: 'der Krankenhaus', ok: false, why: 'Артикль всегда определяется по ПОСЛЕДНЕМУ слову: das Haus.' },
        { t: 'die Krankenhaus', ok: false, why: 'Нет, смотрите на последний блок — das Haus.' },
        { t: 'das Krankenhaus', ok: true, why: 'Точно! В композитах последнее слово (das Haus) задаёт род всему слову.' }
      ] },
    { id: 'd3', rule: '18', q: 'Начните фразу со слова «Heute» (Сегодня я иду в офис):',
      opts: [
        { t: 'Heute ich gehe ins Büro.', ok: false, why: 'Калька с русского! Глагол gehe оказался на 3-м месте вместо 2-го.' },
        { t: 'Heute gehe ich ins Büro.', ok: true, why: 'Верно! Качели инверсии: глагол остаётся осью на Позиции 2, а ich перелетает за него.' },
        { t: 'Heute ins Büro gehe ich.', ok: false, why: 'Перед глаголом может стоять только один блок (либо Heute, либо ins Büro).' }
      ] },
    { id: 'd4', rule: '07', q: 'Как правильно перевести «Я жду в кафе, потому что я устал»?',
      opts: [
        { t: 'Ich warte im Café, weil ich bin müde.', ok: false, why: 'После союза weil глагол не может оставаться на 2-м месте — он катапультируется в конец!' },
        { t: 'Ich warte im Café, weil ich müde bin.', ok: true, why: 'Точно! Союз weil отправляет bin в самый конец (или используйте ведь/так как: denn ich bin müde).' },
        { t: 'Ich warte im Café, denn ich müde bin.', ok: false, why: 'Союз denn НЕ двигает глагол в конец: после denn должен быть прямой порядок (denn ich bin müde).' }
      ] },
    { id: 'd5', rule: '06', q: 'Как сказать «У меня нет времени» (die Zeit)?',
      opts: [
        { t: 'Ich habe nicht Zeit.', ok: false, why: 'Перед существительным без артикля нельзя ставить nicht — нужен отрицательный артикль kein!' },
        { t: 'Ich habe keine Zeit.', ok: true, why: 'Верно! Существительное женского рода die Zeit без артикля отрицается через keine.' },
        { t: 'Ich habe kein Zeit.', ok: false, why: 'Почти, но die Zeit женского рода, поэтому нужна форма keine.' }
      ] },
    { id: 'd6', rule: '05', q: '«Я поехал в Берлин» — какой вспомогательный глагол нужен в Perfekt?',
      opts: [
        { t: 'Ich habe nach Berlin gefahren.', ok: false, why: 'Поездка в Берлин — это перемещение из А в Б, а не действие на месте.' },
        { t: 'Ich bin nach Berlin gefahren.', ok: true, why: 'Верно! Маршрут A → B всегда требует sein (ich bin gefahren).' }
      ] },
    { id: 'd7', rule: '19', q: 'Знак на улице: «Здесь НЕЛЬЗЯ (запрещено) парковаться»:',
      opts: [
        { t: 'Hier muss man nicht parken.', ok: false, why: 'muss nicht означает «не обязательно парковаться» (можно, если хочется), а не запрет!' },
        { t: 'Hier darf man nicht parken.', ok: true, why: 'Точно! Запрет по правилам или закону всегда выражается через nicht dürfen.' }
      ] },
    { id: 'd8', rule: '20', q: '«Здесь есть супермаркет» (der Supermarkt). Какая ловушка в «es gibt»?',
      opts: [
        { t: 'Hier gibt es ein Supermarkt.', ok: false, why: 'После русского «есть» идёт именительный падеж, а после немецкого es gibt — строго Akkusativ!' },
        { t: 'Hier gibt es einen Supermarkt.', ok: true, why: 'Браво! es gibt включает прожектор Akkusativ: der → einen.' }
      ] },
    { id: 'd9', rule: '21', q: 'Немец спрашивает: «Kommst du heute nicht mit?» (Ты не пойдёшь?). Как ответить «Нет, пойду!»?',
      opts: [
        { t: 'Ja!', ok: false, why: 'На вопрос с отрицанием нельзя отвечать простым Ja — это запутывает собеседника.' },
        { t: 'Doch!', ok: true, why: 'Верно! Переключатель DOCH отменяет отрицание в вопросе и означает «как раз да, пойду!»' }
      ] },
    { id: 'd10', rule: '14', q: 'Почему «девочка» по-немецки среднего рода — das Mädchen?',
      opts: [
        { t: 'Исключение без причины, нужно просто вызубрить.', ok: false, why: 'Наоборот, это одно из самых железных правил немецкой морфологии!' },
        { t: 'Из-за уменьшительного суффикса -chen, который на 100% даёт das.', ok: true, why: 'Точно! Любое слово с -chen / -lein (das Brötchen, das Hündchen, das Mädchen) всегда среднего рода.' }
      ] },
    { id: 'd11', rule: '08', q: 'Какое предложение с глаголом werden означает ПАССИВ («Дом строится»)?',
      opts: [
        { t: 'Das Haus wird schnell bauen.', ok: false, why: 'werden + инфинитив (bauen) = будущее время («дом будет строить»).' },
        { t: 'Das Haus wird schnell gebaut.', ok: true, why: 'Верно! Призма werden + Partizip II (gebaut) в конце даёт пассивный залог.' }
      ] },
    { id: 'd12', rule: '01', q: 'Вы на приёме у врача. Что значит вопрос «Was fehlt Ihnen?»',
      opts: [
        { t: 'Каких документов вам не хватает?', ok: false, why: 'Буквально «чего не хватает», но у врача это устойчивая медицинская идиома.' },
        { t: 'Что вас беспокоит / на что жалуетесь?', ok: true, why: 'Верно! Стандартный вежливый вопрос врача о симптомах.' }
      ] }
  ];

  var CONSTRUCTORS = [
    {
      id: 'c1', rule: '02', title: 'Соберите глагольную рамку (Satzklammer)',
      prompt_ru: 'Я должен сегодня рано работать.',
      tiles: ['arbeiten.', 'muss', 'Ich', 'heute früh'],
      answers: ['Ich muss heute früh arbeiten.'],
      hint: 'Позиция 2: muss · Конец рамки: arbeiten.'
    },
    {
      id: 'c2', rule: '18', title: 'Переверните качели инверсии (начните с Morgen)',
      prompt_ru: 'Завтра я покупаю хлеб.',
      tiles: ['kaufe', 'Brot.', 'Morgen', 'ich'],
      answers: ['Morgen kaufe ich Brot.'],
      hint: 'Глагол kaufe прибит ко 2-му месту; ich перелетает за него!'
    },
    {
      id: 'c3', rule: '07', title: 'Включите катапульту weil',
      prompt_ru: 'Я жду в кафе, потому что я устал.',
      tiles: ['weil', 'müde', 'bin.', 'Ich warte im Café,', 'ich'],
      answers: ['Ich warte im Café, weil ich müde bin.'],
      hint: 'После weil: подлежащее (ich) → качество (müde) → глагол (bin) в самом конце!'
    },
    {
      id: 'c4', rule: '17', title: 'Выстройте код Te-Ka-Mo-Lo',
      prompt_ru: 'Я еду сегодня из-за работы на поезде в Мюнхен.',
      tiles: ['nach München.', 'heute', 'mit dem Zug', 'Ich fahre', 'wegen der Arbeit'],
      answers: ['Ich fahre heute wegen der Arbeit mit dem Zug nach München.'],
      hint: 'TE (heute) → KA (wegen der Arbeit) → MO (mit dem Zug) → LO (nach München).'
    },
    {
      id: 'c5', rule: '04', title: 'Оторвите приставку в конец',
      prompt_ru: 'Я открываю глаза.',
      tiles: ['auf.', 'mache', 'die Augen', 'Ich'],
      answers: ['Ich mache die Augen auf.'],
      hint: 'mache на 2-м месте, отделяемая приставка auf замыкает фразу.'
    },
    {
      id: 'c6', rule: '01', title: 'Движение внутрь vs. покой',
      prompt_ru: 'Я кладу ключ от дома на стол (движение, куда?).',
      tiles: ['den Hausschlüssel', 'auf den Tisch.', 'Ich lege'],
      answers: ['Ich lege den Hausschlüssel auf den Tisch.'],
      hint: 'Куда? (Akkusativ): auf den Tisch.'
    }
  ];

  var data = {
    SYSTEM_MODULES: SYSTEM_MODULES,
    RULES: RULES,
    STORY_A0: STORY_A0,
    SURVIVAL_ARZT: SURVIVAL_ARZT,
    DIAGNOSTICS: DIAGNOSTICS,
    CONSTRUCTORS: CONSTRUCTORS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = data;
  } else {
    root.DL_DATA = data;
  }
})(typeof window !== 'undefined' ? window : globalThis);
