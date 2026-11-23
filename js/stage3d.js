/* Interactive Three.js 3D Logic Stage + Canvas 2D Blueprint Fallback
   Visualizes: Space/Cases (Wo/Wohin, stellen/legen, nach/zu/in),
   Word-Order Frame (Satzklammer, Inversion, weil/denn, TeKaMoLo),
   Komposita Block Docker, and Verb Prism / DOCH switchboard. */
(function (root) {
  'use strict';

  function StageController(container) {
    this.el = container;
    this.mode = 'space';
    this.state = {
      // Space
      spaceQ: 'akk',       // 'akk' | 'dat'
      spacePrep: 'in',     // 'in' | 'auf' | 'unter' | 'neben'
      spacePosture: 'book',// 'book' (legen/liegen) | 'bottle' (stellen/stehen)
      // Frame
      frameMode: 'klammer',// 'klammer' | 'inversion' | 'catapult' | 'tekamolo'
      frameInverted: false,
      frameConj: 'weil',   // 'weil' | 'denn'
      framePreset: 'will', // 'will' | 'muss' | 'perf' | 'auf'
      // Compound
      compPreset: 'kaffee',// 'kaffee' | 'haus' | 'wasser' | 'krank' | 'platz'
      // Verbs
      verbMode: 'perfekt', // 'perfekt' | 'werden' | 'modal' | 'doch'
      verbSub: 'sein'      // varies per verbMode
    };
    this.animT = 0;
    this.useWebGL = false;
    this.disposed = false;
    this._initRenderer();
  }

  StageController.prototype._initRenderer = function () {
    var self = this;
    var THREE = root.THREE;
    if (THREE && typeof THREE.WebGLRenderer === 'function') {
      try {
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x070b12, 1);
        this.el.innerHTML = '';
        this.el.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(36, 1.6, 0.1, 60);
        camera.position.set(3.8, 2.5, 4.3);

        var controls = null;
        if (typeof THREE.OrbitControls === 'function') {
          controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.target.set(0, 0.35, 0);
        }

        scene.add(new THREE.AmbientLight(0xeef2f8, 0.65));
        var key = new THREE.DirectionalLight(0xeef2f8, 0.78);
        key.position.set(4, 6, 4);
        scene.add(key);

        var grid = new THREE.GridHelper(6.4, 16, 0x3b4d68, 0x151e2e);
        grid.position.y = -0.02;
        scene.add(grid);

        this.THREE = THREE;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.rootGrp = new THREE.Group();
        scene.add(this.rootGrp);
        this.useWebGL = true;
      } catch (e) {
        this.useWebGL = false;
      }
    }

    if (!this.useWebGL) {
      var canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      this.el.innerHTML = '';
      this.el.appendChild(canvas);
      this.canvas2d = canvas;
      this.ctx2d = canvas.getContext('2d');
    }

    this._onResize = function () { self.resize(); };
    root.addEventListener('resize', this._onResize);
    this.resize();
    this.rebuild();

    var last = performance.now();
    function loop(now) {
      if (self.disposed) return;
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      self.tick(dt, now / 1000);
    }
    requestAnimationFrame(loop);
  };

  StageController.prototype.resize = function () {
    if (!this.el) return;
    var w = this.el.clientWidth || 620;
    var h = this.el.clientHeight || 380;
    if (this.useWebGL && this.renderer) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    } else if (this.canvas2d) {
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      this.canvas2d.width = Math.round(w * dpr);
      this.canvas2d.height = Math.round(h * dpr);
      this._w2d = w;
      this._h2d = h;
      this._dpr = dpr;
    }
  };

  StageController.prototype.setModeAndState = function (mode, patch) {
    this.mode = mode;
    if (patch) {
      for (var k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) {
          this.state[k] = patch[k];
        }
      }
    }
    this.animT = 0;
    this.rebuild();
  };

  StageController.prototype.replay = function () {
    this.animT = 0;
  };

  StageController.prototype._clearGroup = function (grp) {
    while (grp.children.length) {
      var c = grp.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(function (m) { m.dispose(); });
        else c.material.dispose();
      }
    }
  };

  StageController.prototype._box = function (sx, sy, sz, colorHex, edgeHex, opacity) {
    var T = this.THREE;
    var matOpts = { color: colorHex };
    if (opacity !== undefined && opacity < 1) {
      matOpts.transparent = true;
      matOpts.opacity = opacity;
    }
    var m = new THREE.Mesh(new T.BoxGeometry(sx, sy, sz), new T.MeshStandardMaterial(matOpts));
    if (edgeHex !== null) {
      m.add(new T.LineSegments(
        new T.EdgesGeometry(m.geometry, 20),
        new T.LineBasicMaterial({ color: edgeHex })
      ));
    }
    return m;
  };

  StageController.prototype.rebuild = function () {
    if (!this.useWebGL) return;
    var T = this.THREE;
    this._clearGroup(this.rootGrp);
    this.animators = [];

    var COL = {
      der: 0x56a8e4,
      die: 0xff7d61,
      das: 0x58b691,
      ochre: 0xed864b,
      panel: 0x182336,
      dim: 0x26354d,
      ink: 0xeef2f8
    };

    var st = this.state;
    var self = this;

    if (this.mode === 'space') {
      var useTable = (st.spacePrep === 'auf' || st.spacePrep === 'unter' || st.spacePosture === 'bottle');
      if (!useTable) {
        var kiste = this._box(1.35, 1.05, 1.15, 0x152033, 0xa6b4c8, 0.24);
        kiste.position.set(0, 0.52, 0);
        this.rootGrp.add(kiste);
      } else {
        var topM = this._box(2.1, 0.12, 1.25, COL.panel, COL.ink, 1);
        topM.position.set(0, 0.72, 0);
        this.rootGrp.add(topM);
        [[-0.88, -0.48], [0.88, -0.48], [-0.88, 0.48], [0.88, 0.48]].forEach(function (p) {
          var leg = self._box(0.09, 0.66, 0.09, 0x0f1623, 0x75849b, 1);
          leg.position.set(p[0], 0.33, p[1]);
          self.rootGrp.add(leg);
        });
      }

      var isAkk = (st.spaceQ === 'akk');
      var objColor = isAkk ? COL.die : COL.das;
      var actor;
      if (st.spacePosture === 'bottle') {
        actor = new T.Mesh(
          new T.CylinderGeometry(0.18, 0.21, 0.68, 16),
          new T.MeshStandardMaterial({ color: objColor, emissive: objColor, emissiveIntensity: 0.22 })
        );
      } else {
        actor = this._box(0.56, 0.22, 0.42, objColor, COL.ink, 1);
      }
      this.rootGrp.add(actor);

      var sPos, ePos;
      if (st.spacePosture === 'bottle') {
        sPos = new T.Vector3(-1.8, 1.45, 0);
        ePos = new T.Vector3(0, 1.12, 0);
      } else if (st.spacePrep === 'in') {
        sPos = new T.Vector3(-1.85, 1.35, 0);
        ePos = new T.Vector3(0, 0.20, 0);
      } else if (st.spacePrep === 'auf') {
        sPos = new T.Vector3(-1.85, 1.38, 0);
        ePos = new T.Vector3(0, 0.89, 0);
      } else if (st.spacePrep === 'unter') {
        sPos = new T.Vector3(-1.85, 0.14, 0);
        ePos = new T.Vector3(0, 0.14, 0);
      } else {
        sPos = new T.Vector3(2.15, 0.95, 0.3);
        ePos = new T.Vector3(1.18, 0.14, 0);
      }

      if (isAkk) {
        var mid = sPos.clone().lerp(ePos, 0.5);
        mid.y += 0.62;
        var curve = new T.QuadraticBezierCurve3(sPos, mid, ePos);
        var arc = new T.Line(
          new T.BufferGeometry().setFromPoints(curve.getPoints(28)),
          new T.LineBasicMaterial({ color: COL.die })
        );
        this.rootGrp.add(arc);
        this.animators.push(function (ease) {
          actor.position.copy(curve.getPoint(ease));
        });
      } else {
        var ring = new T.Mesh(
          new T.TorusGeometry(0.48, 0.022, 8, 32),
          new T.MeshBasicMaterial({ color: COL.das })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(ePos.x, ePos.y - (st.spacePosture === 'bottle' ? 0.34 : 0.11), ePos.z);
        this.rootGrp.add(ring);
        this.animators.push(function (_ease, gt) {
          actor.position.copy(ePos);
          actor.position.y += Math.sin(gt * 2.4) * 0.025;
          var sc = 1 + Math.sin(gt * 2.4) * 0.06;
          ring.scale.set(sc, sc, 1);
        });
      }
    } else if (this.mode === 'frame') {
      var rail = this._box(4.6, 0.10, 0.58, COL.panel, 0x75849b, 1);
      rail.position.set(0, 0.05, 0);
      this.rootGrp.add(rail);

      if (st.frameMode === 'klammer') {
        var b1 = this._box(0.68, 0.45, 0.44, COL.dim, 0xa6b4c8, 1); b1.position.set(-1.75, 0.32, 0);
        var b2 = this._box(0.78, 0.68, 0.50, COL.der, COL.ink, 1); b2.position.set(-0.82, 0.44, 0);
        var bMid = this._box(1.20, 0.44, 0.44, COL.panel, 0xa6b4c8, 1); bMid.position.set(0.38, 0.32, 0);
        var bEnd = this._box(0.86, 0.68, 0.50, COL.die, COL.ink, 1);
        this.rootGrp.add(b1, b2, bMid, bEnd);
        var cK = new T.QuadraticBezierCurve3(new T.Vector3(-0.2, 0.44, 0), new T.Vector3(0.8, 1.38, 0), new T.Vector3(1.75, 0.44, 0));
        this.rootGrp.add(new T.Line(new T.BufferGeometry().setFromPoints(cK.getPoints(24)), new T.LineBasicMaterial({ color: COL.die })));
        this.animators.push(function (ease) { bEnd.position.copy(cK.getPoint(ease)); });
      } else if (st.frameMode === 'inversion') {
        var pivot = new T.Mesh(new T.ConeGeometry(0.24, 0.42, 4), new T.MeshStandardMaterial({ color: COL.der }));
        pivot.position.set(-0.6, 0.25, 0);
        this.rootGrp.add(pivot);
        var beam = new T.Group();
        beam.position.set(-0.6, 0.52, 0);
        var bL = this._box(0.78, 0.45, 0.44, st.frameInverted ? COL.die : COL.dim, COL.ink, 1); bL.position.set(-0.95, 0.25, 0);
        var bAxis = this._box(0.78, 0.68, 0.48, COL.der, COL.ink, 1); bAxis.position.set(0, 0.35, 0);
        var bR = this._box(0.78, 0.45, 0.44, st.frameInverted ? COL.dim : COL.das, COL.ink, 1); bR.position.set(0.95, 0.25, 0);
        var bTail = this._box(0.92, 0.40, 0.42, COL.panel, 0xa6b4c8, 1); bTail.position.set(1.98, 0.22, 0);
        beam.add(bL, bAxis, bR, bTail);
        this.rootGrp.add(beam);
        this.animators.push(function (ease) {
          var targetTilt = st.frameInverted ? 0.14 : -0.14;
          beam.rotation.z = targetTilt * Math.sin(ease * Math.PI * 0.5);
        });
      } else if (st.frameMode === 'catapult') {
        var cBlock = this._box(0.75, 0.54, 0.46, st.frameConj === 'weil' ? COL.die : COL.das, COL.ink, 1); cBlock.position.set(-1.65, 0.36, 0);
        var subj = this._box(0.66, 0.44, 0.42, COL.dim, 0xa6b4c8, 1); subj.position.set(-0.75, 0.32, 0);
        var adj = this._box(0.84, 0.44, 0.42, COL.panel, 0xa6b4c8, 1); adj.position.set(0.25, 0.32, 0);
        var vBlock = this._box(0.76, 0.66, 0.48, st.frameConj === 'weil' ? COL.die : COL.der, COL.ink, 1);
        this.rootGrp.add(cBlock, subj, adj, vBlock);
        if (st.frameConj === 'weil') {
          var cCat = new T.QuadraticBezierCurve3(new T.Vector3(-0.05, 0.42, 0), new T.Vector3(0.8, 1.48, 0), new T.Vector3(1.55, 0.42, 0));
          this.rootGrp.add(new T.Line(new T.BufferGeometry().setFromPoints(cCat.getPoints(24)), new T.LineBasicMaterial({ color: COL.die })));
          this.animators.push(function (ease) { vBlock.position.copy(cCat.getPoint(ease)); });
        } else {
          adj.position.set(1.25, 0.32, 0);
          this.animators.push(function (_e, gt) { vBlock.position.set(0.22, 0.42 + Math.sin(gt * 2) * 0.02, 0); });
        }
      } else {
        // TeKaMoLo 4 slots
        var cols = [COL.der, COL.ochre, COL.das, COL.die];
        var xs = [-1.45, -0.48, 0.48, 1.45];
        var blocks = [];
        for (var i = 0; i < 4; i++) {
          var tb = this._box(0.82, 0.54 + i * 0.06, 0.48, cols[i], COL.ink, 1);
          tb.position.set(xs[i], 0.38, 0);
          this.rootGrp.add(tb);
          blocks.push(tb);
        }
        this.animators.push(function (ease) {
          blocks.forEach(function (b, idx) {
            var delay = Math.max(0, Math.min(1, ease * 1.4 - idx * 0.18));
            b.position.y = 0.36 + (1 - delay) * 0.6;
          });
        });
      }
    } else if (this.mode === 'compound') {
      var presets = {
        kaffee: [{ w: 1.0, c: COL.der }, { w: 1.25, c: COL.die }],
        haus: [{ w: 0.9, c: COL.das }, { w: 0.9, c: COL.die }, { w: 1.2, c: COL.der }],
        wasser: [{ w: 1.0, c: COL.das }, { w: 1.25, c: COL.die }],
        krank: [{ w: 1.0, c: COL.dim }, { w: 1.25, c: COL.das }],
        platz: [{ w: 1.0, c: COL.die }, { w: 1.25, c: COL.der }]
      };
      var parts = presets[st.compPreset] || presets.kaffee;
      var winCol = parts[parts.length - 1].c;
      var cMeshes = [];
      parts.forEach(function (p, idx) {
        var isLast = idx === parts.length - 1;
        var m = self._box(p.w, isLast ? 0.84 : 0.56, 0.66, isLast ? p.c : COL.panel, isLast ? COL.ink : p.c, 1);
        self.rootGrp.add(m);
        cMeshes.push({ mesh: m, w: p.w, isLast: isLast });
      });
      var ringC = new T.Mesh(new T.TorusGeometry(0.75, 0.028, 8, 32), new T.MeshBasicMaterial({ color: winCol }));
      ringC.rotation.x = Math.PI / 2;
      this.rootGrp.add(ringC);
      this.animators.push(function (ease, gt) {
        var spread = (1 - ease) * 0.65;
        var total = cMeshes.reduce(function (s, x) { return s + x.w; }, 0) + spread * (cMeshes.length - 1);
        var curX = -total / 2;
        cMeshes.forEach(function (item) {
          var cx = curX + item.w / 2;
          curX += item.w + spread;
          item.mesh.position.set(cx, item.isLast ? 0.44 + Math.sin(gt * 3) * 0.03 : 0.30, 0);
          if (item.isLast) ringC.position.set(cx, 0.02, 0);
        });
      });
    } else {
      // Verbs / Prism / DOCH
      if (st.verbMode === 'perfekt') {
        if (st.verbSub === 'sein') {
          var pA = this._box(0.5, 0.4, 0.5, COL.dim, COL.ink, 1); pA.position.set(-1.35, 0.22, 0);
          var pB = this._box(0.5, 0.4, 0.5, COL.dim, COL.die, 1); pB.position.set(1.35, 0.22, 0);
          var mover = this._box(0.55, 0.45, 0.45, COL.die, COL.ink, 1);
          var cP = new T.QuadraticBezierCurve3(new T.Vector3(-1.35, 0.55, 0), new T.Vector3(0, 1.45, 0), new T.Vector3(1.35, 0.55, 0));
          this.rootGrp.add(pA, pB, mover, new T.Line(new T.BufferGeometry().setFromPoints(cP.getPoints(24)), new T.LineBasicMaterial({ color: COL.die })));
          this.animators.push(function (ease) { mover.position.copy(cP.getPoint(ease)); });
        } else {
          var boxH = this._box(1.05, 0.72, 0.72, COL.der, COL.ink, 1); boxH.position.set(0, 0.38, 0);
          var ringH = new T.Mesh(new T.TorusGeometry(0.85, 0.025, 8, 32), new T.MeshBasicMaterial({ color: COL.der }));
          ringH.rotation.x = Math.PI / 2; ringH.position.set(0, 0.03, 0);
          this.rootGrp.add(boxH, ringH);
          this.animators.push(function (_e, gt) { boxH.rotation.y = gt * 0.6; });
        }
      } else if (st.verbMode === 'werden') {
        var prism = new T.Mesh(new T.CylinderGeometry(0.65, 0.65, 0.9, 3), new T.MeshStandardMaterial({ color: COL.panel, transparent: true, opacity: 0.7 }));
        prism.position.set(-0.3, 0.5, 0);
        this.rootGrp.add(prism);
        var beams = [
          { y: 0.85, c: COL.das, k: 'become' },
          { y: 0.50, c: COL.der, k: 'futur' },
          { y: 0.15, c: COL.die, k: 'passiv' }
        ];
        beams.forEach(function (b) {
          var active = st.verbSub === b.k;
          var bm = self._box(active ? 1.55 : 0.9, active ? 0.24 : 0.12, 0.22, b.c, COL.ink, active ? 1 : 0.45);
          bm.position.set(1.05, b.y, 0);
          self.rootGrp.add(bm);
        });
        this.animators.push(function (_e, gt) { prism.rotation.y = Math.sin(gt * 0.8) * 0.25; });
      } else {
        // DOCH / Modal switchboard
        var activeCol = st.verbSub === 'doch' || st.verbSub === 'darf' ? COL.das : (st.verbSub === 'soll' ? COL.ochre : COL.die);
        var baseS = this._box(1.8, 0.18, 0.9, COL.panel, 0x75849b, 1); baseS.position.set(0, 0.10, 0);
        var gate = this._box(0.95, 0.72, 0.45, activeCol, COL.ink, 1); gate.position.set(0, 0.55, 0);
        this.rootGrp.add(baseS, gate);
        this.animators.push(function (ease, gt) {
          gate.rotation.y = (1 - ease) * 1.4 + Math.sin(gt * 1.5) * 0.1;
        });
      }
    }
  };

  StageController.prototype.tick = function (dt, gt) {
    this.animT = Math.min(1, this.animT + dt * 0.75);
    var ease = 1 - Math.pow(1 - this.animT, 3);
    if (this.useWebGL) {
      if (this.animators) {
        for (var i = 0; i < this.animators.length; i++) {
          this.animators[i](ease, gt);
        }
      }
      if (this.controls) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    } else if (this.ctx2d) {
      this._draw2dFallback(ease, gt);
    }
  };

  StageController.prototype._draw2dFallback = function (ease, gt) {
    var ctx = this.ctx2d;
    var w = this._w2d || 600;
    var h = this._h2d || 360;
    ctx.save();
    ctx.scale(this._dpr || 1, this._dpr || 1);
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, w, h);
    // Blueprint grid
    ctx.strokeStyle = 'rgba(122,163,200,0.08)';
    ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (var y = 0; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    var st = this.state;
    var cx = w / 2, cy = h / 2 + 20;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.mode === 'space') {
      var isAkk = st.spaceQ === 'akk';
      ctx.strokeStyle = '#a6b4c8';
      ctx.strokeRect(cx - 80, cy - 45, 160, 100);
      var bx = isAkk ? (cx - 190 * (1 - ease)) : cx;
      var by = isAkk ? (cy - 60 * Math.sin(ease * Math.PI)) : (cy + Math.sin(gt * 2.4) * 5);
      ctx.fillStyle = isAkk ? '#ff7d61' : '#58b691';
      ctx.fillRect(bx - 28, by - 16, 56, 32);
      ctx.fillStyle = '#090d16';
      ctx.fillText(st.spacePosture === 'bottle' ? 'Flasche' : 'Buch', bx, by);
    } else if (this.mode === 'frame') {
      var slots = st.frameMode === 'catapult'
        ? (st.frameConj === 'weil' ? ['weil', 'ich', 'müde', 'BIN'] : ['denn', 'ich', 'BIN', 'müde'])
        : ['1', 'POS 2', 'Mitte', 'ENDE'];
      slots.forEach(function (lbl, i) {
        var sx = cx - 165 + i * 110;
        ctx.fillStyle = i === 1 ? '#56a8e4' : (i === 3 ? '#ff7d61' : '#182336');
        ctx.fillRect(sx - 44, cy - 26, 88, 52);
        ctx.fillStyle = (i === 1 || i === 3) ? '#090d16' : '#eef2f8';
        ctx.fillText(lbl, sx, cy);
      });
    } else if (this.mode === 'compound') {
      ctx.fillStyle = '#56a8e4';
      ctx.fillRect(cx - 135, cy - 26, 120, 52);
      ctx.fillStyle = '#ff7d61';
      ctx.fillRect(cx + 15, cy - 36, 130, 72);
      ctx.fillStyle = '#090d16';
      ctx.fillText('Teil 1', cx - 75, cy);
      ctx.fillText('ГЛАВНОЕ', cx + 80, cy);
    } else {
      ctx.fillStyle = '#58b691';
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090d16';
      ctx.fillText(st.verbMode.toUpperCase(), cx, cy);
    }
    ctx.restore();
  };

  StageController.prototype.dispose = function () {
    this.disposed = true;
    root.removeEventListener('resize', this._onResize);
    if (this.renderer) this.renderer.dispose();
  };

  root.DL_STAGE3D = StageController;
})(typeof window !== 'undefined' ? window : globalThis);
