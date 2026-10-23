/* Clarity A&A – Nebel, der sich in Klarheit auflöst
   1) Intro: dichter Nebel über der unscharfen Seite reisst von der Mitte her auf.
   2) Hero: leichter Dunst am unteren Rand, den man mit der Maus wegwischt. */
(function () {
  var root = document.documentElement;
  var body = document.body;
  var blurLayer = document.querySelector('.fog-blur');
  var introCanvas = document.querySelector('.fog-intro-canvas');
  var heroCanvas = document.querySelector('.fog-hero-canvas');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function announceClear() {
    window.__clarityClear = true;
    window.dispatchEvent(new Event('clarity:clear'));
  }

  /* ---------- WebGL-Nebel ---------- */
  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform float uDensity;uniform float uClear;',
    'uniform vec2 uMouse;uniform float uMouseR;uniform float uBottom;uniform vec3 uColor;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);',
    ' for(int k=0;k<5;k++){v+=a*n(p);p=m*p;a*=.5;}return v;}',
    'void main(){',
    ' vec2 px=gl_FragCoord.xy;vec2 uv=px/uRes.y;float t=uTime;',
    ' vec2 q=vec2(fbm(uv*1.4+vec2(t*.035,t*.01)),fbm(uv*1.4+vec2(5.2,1.3)-t*.02));',
    ' float f=fbm(uv*2.2+q*1.7+vec2(-t*.05,t*.012));',
    ' float a=uDensity*smoothstep(.04,.68,f*.95+q.x*.35);',
    // Aufreissen von der Mitte aus, mit unruhiger Kante
    ' float d=length((px-uRes*.5)/length(uRes))*2.;',
    ' a*=smoothstep(uClear-.22,uClear+.08,d+(f-.5)*.45);',
    // Dunst am unteren Rand verdichten
    ' float y=px.y/uRes.y;a*=mix(1.,smoothstep(1.0,0.,y)*1.3,uBottom);',
    // Mausspur wischt den Nebel weg
    ' float md=length(px-uMouse);a*=mix(.15,1.,smoothstep(uMouseR*.25,uMouseR,md+(f-.5)*uMouseR*.5));',
    ' a=clamp(a,0.,1.);gl_FragColor=vec4(uColor*a,a);}'
  ].join('\n');

  function createFog(canvas, scale) {
    var gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var u = {};
    ['uRes', 'uTime', 'uDensity', 'uClear', 'uMouse', 'uMouseR', 'uBottom', 'uColor'].forEach(function (k) { u[k] = gl.getUniformLocation(prog, k); });

    function size() {
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * scale)), hgt = Math.max(1, Math.round(r.height * scale));
      if (canvas.width !== w || canvas.height !== hgt) { canvas.width = w; canvas.height = hgt; }
      gl.viewport(0, 0, w, hgt);
    }
    return {
      scale: scale,
      draw: function (s) {
        size();
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform1f(u.uTime, s.time);
        gl.uniform1f(u.uDensity, s.density);
        gl.uniform1f(u.uClear, s.clear);
        gl.uniform2f(u.uMouse, s.mx * scale, (canvas.height - s.my * scale));
        gl.uniform1f(u.uMouseR, s.mr * scale);
        gl.uniform1f(u.uBottom, s.bottom);
        gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }

  /* ---------- 1) Intro ---------- */
  function endIntro() {
    if (blurLayer) blurLayer.remove();
    if (introCanvas) introCanvas.remove();
    body.classList.remove('fog-intro');
    root.classList.add('fog-done');
    if (!location.hash && window.__clarityTop) window.__clarityTop();
    try { sessionStorage.setItem('clarity-fog', '1'); } catch (e) {}
    announceClear();
  }

  if (!blurLayer || root.classList.contains('fog-skip')) {
    endIntro();
  } else {
    // Ruhiges Aufklaren: Nebel und Unschärfe blendet der Browser selbst per CSS aus (flüssig, ohne Ruckeln).
    // Der Nebel selbst wabert dabei weiter langsam.
    var fog = introCanvas ? createFog(introCanvas, 0.35) : null;
    var HOLD = 800, done = false, t0 = performance.now();
    if (!fog && introCanvas) introCanvas.style.display = 'none';
    function finish() {
      if (done) return; done = true;
      endIntro();
    }
    function drift(now) {
      if (done || !fog) return;
      fog.draw({ time: (now - t0) / 1000 * .6 + 20, density: .7, clear: -1,
                 mx: -9999, my: -9999, mr: 1, bottom: 0, color: [.80, .90, .88] });
      requestAnimationFrame(drift);
    }
    if (fog) drift(t0);
    setTimeout(function () {
      root.classList.add('fog-clearing');
      blurLayer.addEventListener('transitionend', function (ev) {
        if (ev.propertyName === 'opacity') finish();
      });
      setTimeout(finish, 4600); // Sicherheitsnetz
    }, HOLD);
    // Klick, Taste oder Scrollen: schneller klar werden
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, function () { root.classList.add('fog-fast'); }, { once: true, passive: true });
    });
  }

  /* ---------- 2) Dunst im Hero ---------- */
  if (heroCanvas && !reduce) {
    var mist = createFog(heroCanvas, 0.5);
    if (mist) {
      var hero = heroCanvas.parentElement;
      var m = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
      var visible = true, running = false, t0 = performance.now(), fade = 0;
      hero.addEventListener('pointermove', function (ev) {
        var r = heroCanvas.getBoundingClientRect();
        m.tx = ev.clientX - r.left; m.ty = ev.clientY - r.top;
        if (m.x < -1000) { m.x = m.tx; m.y = m.ty; }
      });
      hero.addEventListener('pointerleave', function () { m.tx = m.ty = -9999; m.x = m.y = -9999; });
      function loop(now) {
        if (!visible) { running = false; return; }
        m.x += (m.tx - m.x) * .08; m.y += (m.ty - m.y) * .08;
        fade = Math.min(1, fade + .006);
        mist.draw({
          time: (now - t0) / 1000, density: .4 * fade, clear: -1,
          mx: m.x, my: m.y, mr: 260, bottom: 1, color: [.60, .78, .76]
        });
        requestAnimationFrame(loop);
      }
      function run() { if (!running && visible) { running = true; requestAnimationFrame(loop); } }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }).observe(hero);
      }
      // Dunst erst einblenden, wenn das Intro aufgeklart hat
      if (window.__clarityClear) run(); else window.addEventListener('clarity:clear', run, { once: true });
    }
  }
})();
