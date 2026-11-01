import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ვიდეოს კადრები: public/frames/f001.webp ... f121.webp
   f121 = აწყობილი ბურგერი (საწყისი და ბოლო მდგომარეობა)
   f082 ≈ f001 (ვიდეოს დასაწყისი) -> გადასვლა შეუმჩნეველია */
const FRAME_COUNT = 121;
const LAST = FRAME_COUNT - 1;
const MATCH = 81;
const frameUrl = (i) => `/frames/f${String(i + 1).padStart(3, "0")}.webp`;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const SPARKS = Array.from({ length: 16 }, (_, i) => [(i * 37) % 100, (i * 53) % 100, (i % 5) * 0.9, 3 + (i % 4)]);
const MARQUEE = ["Fresh beef", "Homemade buns", "Grilled to order", "Free delivery", "Open every day"];
/* სქროლის ტაიმლაინი (0..1) — მხოლოდ დესკტოპზე (>= 1024px) */
const T = { rev0: 0.05, rev1: 0.22, fwd0: 0.24, fwd1: 0.8, back0: 0.82, back1: 0.95 };
const AMB_REVEAL = [0.03, 0.22];
const DESKTOP_QUERY = "(min-width: 1024px)";

const HERO_CSS = `
@keyframes heroFadeUp {
  0% { opacity: 0; transform: translateY(35px) scale(0.96); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
@keyframes heroSlideRight {
  0% { opacity: 0; transform: translateX(-35px); filter: blur(4px); }
  100% { opacity: 1; transform: translateX(0); filter: blur(0px); }
}
@keyframes heroPopBadge {
  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
  70% { transform: scale(1.08) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes heroBigTitle {
  0% { opacity: 0; transform: translateY(45px) scale(0.92); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes heroBigBurgerText {
  0% { opacity: 0; transform: scale(0.75) translateY(-50%); letter-spacing: 0.1em; }
  100% { opacity: 1; transform: scale(1) translateY(-50%); letter-spacing: normal; }
}

.bs-marquee{animation:bsMarquee 34s linear infinite}
@keyframes bsMarquee{to{transform:translateX(-50%)}}

.hero-enter-bigtext { animation: heroBigBurgerText 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.hero-enter-script { animation: heroSlideRight 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 150ms; opacity: 0; }
.hero-enter-badge { animation: heroPopBadge 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 300ms; opacity: 0; }
.hero-enter-title { animation: heroBigTitle 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 450ms; opacity: 0; }
.hero-enter-desc { animation: heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 600ms; opacity: 0; }
.hero-enter-buttons { animation: heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 750ms; opacity: 0; }
.hero-enter-hint { animation: heroFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 950ms; opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .hero-enter-bigtext, .hero-enter-script, .hero-enter-badge, .hero-enter-title,
  .hero-enter-desc, .hero-enter-buttons, .hero-enter-hint { animation-duration: 0.01s; animation-delay: 0s; }
  .bs-marquee { animation: none; }
}
`;

const CHAPTERS = [
  ["Every Layer Apart", "Seven layers hang in the air, each one cooked and prepared separately."],
  ["Melted Cheddar", "Aged cheddar drapes over a smashed beef patty with a caramelised crust."],
  ["Stacked & Ready", "Everything drops back into place, ready for your first bite."],
];
const CH_RANGES = [[0.27, 0.45], [0.47, 0.63], [0.65, 0.79]];

const VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const FRAG_MAIN = `
uniform sampler2D uA;uniform sampler2D uB;uniform float uMix;uniform float uOp;varying vec2 vUv;
void main(){
  vec3 c=mix(texture2D(uA,vUv).rgb,texture2D(uB,vUv).rgb,uMix);
  float e=smoothstep(0.,.2,vUv.x)*smoothstep(0.,.2,1.-vUv.x)*smoothstep(0.,.07,vUv.y)*smoothstep(0.,.07,1.-vUv.y);
  gl_FragColor=vec4(c,e*uOp);
}`;
const FRAG_AMB = `
uniform sampler2D uA;uniform sampler2D uB;uniform float uMix;uniform vec2 uCover;uniform float uFade;varying vec2 vUv;
vec3 s(vec2 p){return mix(texture2D(uA,p).rgb,texture2D(uB,p).rgb,uMix);}
void main(){
  vec2 f=.5+(vUv-.5)*uCover;
  float r=.045;
  vec3 c=s(f)*.28;
  c+=s(f+vec2(r,0.))*.12+s(f-vec2(r,0.))*.12+s(f+vec2(0.,r))*.12+s(f-vec2(0.,r))*.12;
  c+=s(f+vec2(r,r)*.7)*.06+s(f-vec2(r,r)*.7)*.06+s(f+vec2(r,-r)*.7)*.06+s(f-vec2(r,-r)*.7)*.06;
  float g=dot(c,vec3(.3,.59,.11));
  c=mix(vec3(g),c,.75)*.62;
  c*=mix(.35,1.,smoothstep(.0,.55,vUv.x))*smoothstep(.0,.25,vUv.y)*smoothstep(.0,.25,1.-vUv.y);
  gl_FragColor=vec4(c,uFade);
}`;

function useIsDesktop() {
  const [is, setIs] = useState(() => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const on = () => setIs(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return is;
}

function Background() {
  return (
    <>
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#ffba00]/15 blur-[100px]" style={{ animation: "orb 9s ease-in-out infinite" }} />
      <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[#ff4d00]/15 blur-[110px]" style={{ animation: "orb 11s ease-in-out infinite reverse" }} />
      {SPARKS.map(([l, t, d, sz], i) => <span key={i} className="absolute rounded-full bg-[#ffba00]" style={{ left: `${l}%`, top: `${t}%`, width: sz, height: sz, animation: `rise ${5 + (i % 3)}s ease-in infinite`, animationDelay: `${d}s` }} />)}
    </>
  );
}

function Marquee({ className = "" }) {
  return (
    <div className={`overflow-hidden border-t border-white/10 bg-black/45 py-3 backdrop-blur-sm ${className}`} aria-hidden="true">
      <div className="bs-marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="display flex shrink-0 items-center gap-10 pr-10 text-lg tracking-[0.2em] text-white/65 sm:text-xl">
            {MARQUEE.map((w) => (
              <span key={w} className="flex items-center gap-10">
                {w}
                <span className="text-[#ffba00]">&#10022;</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroText({ txtRef, btnsRef, desktop }) {
  return (
    <div ref={txtRef} className={`mx-auto max-w-xl text-center ${desktop ? "lg:mx-0 lg:text-left" : ""}`}>
      <p className="hero-enter-script script text-3xl text-white sm:text-4xl md:text-5xl lg:text-4xl">Craving Something</p>
      <span className="hero-enter-badge mt-3 inline-block rounded-full border border-[#ffba00]/40 bg-[#ffba00]/10 px-4 py-1 text-[10px] uppercase tracking-[.25em] text-[#ffba00] sm:text-xs">Fresh · Juicy · Fast</span>
      <h1 className="hero-enter-title display mt-4 text-[clamp(2rem,8vw,3.75rem)] leading-[1.05] lg:text-6xl xl:text-7xl">Enjoy burgery <br /><span className="gold-text">make your tummy happy</span></h1>
      <p className="hero-enter-desc mt-5 hidden max-w-md leading-relaxed text-[#a0a0a0] sm:mx-auto sm:block lg:mx-0 lg:mt-6">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.</p>
      <div ref={btnsRef} className={`hero-enter-buttons mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 ${desktop ? "lg:mt-8 lg:justify-start" : ""}`}>
        <button className="btn h-12 cursor-pointer rounded-full bg-[#ffba00] px-7 font-semibold text-black sm:px-8">Order Now</button>
        <button className="btn h-12 cursor-pointer rounded-full border border-white/20 px-7 font-semibold hover:border-[#ffba00] sm:px-8">Learn More</button>
      </div>
    </div>
  );
}

/* < 1024px: მხოლოდ ტექსტი და ფონი, ბურგერის ფოტოს და სქროლანიმაციის გარეშე */
function BurgerStatic() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <style>{HERO_CSS}</style>
      <div className="hero-bg absolute inset-0" />
      <Background />
      <div className="hero-enter-bigtext display pointer-events-none absolute left-[4vw] top-1/2 select-none whitespace-nowrap text-[34vw] leading-none" style={{ WebkitTextStroke: "1px rgba(255,186,0,.14)", color: "transparent" }}>BURGER</div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side,rgba(255,150,0,.18),transparent)" }} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16 pt-24 sm:px-8">
        <HeroText desktop={false} />
      </div>
      <Marquee className="relative z-10 hidden sm:block" />
    </section>
  );
}

/* >= 1024px: სრული სქროლანიმაცია */
function BurgerScrollDesktop() {
  const sec = useRef(null), stage = useRef(null), canvas = useRef(null), big = useRef(null), glow = useRef(null);
  const intro = useRef(null), hint = useRef(null), cap = useRef(null), bar = useRef(null);
  const txt = useRef(null), btns = useRef(null);
  const doneRef = useRef(false);
  const [chap, setChap] = useState(-1);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const has = "scrollRestoration" in window.history;
    const prev = has ? window.history.scrollRestoration : "auto";
    if (has) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const top = () => window.scrollTo(0, 0);
    window.addEventListener("pagehide", top);
    return () => {
      window.removeEventListener("pagehide", top);
      if (has) window.history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    let dead = false, raf = 0;
    const cleanups = [];
    const imgs = new Array(FRAME_COUNT);
    doneRef.current = false;

    Promise.all(Array.from({ length: FRAME_COUNT }, (_, i) => new Promise((res) => {
      const im = new Image();
      im.onload = () => { imgs[i] = im; res(); };
      im.onerror = () => res();
      im.src = frameUrl(i);
    }))).then(() => {
      if (dead || !imgs[0] || !imgs[LAST] || !canvas.current || !stage.current) return;
      const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
      cam.position.z = 9;
      const ASP = imgs[0].naturalWidth / imgs[0].naturalHeight;

      const mk = (im) => { const t = new THREE.Texture(im); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; };
      const texA = mk(imgs[LAST]), texB = mk(imgs[0]);
      const uniforms = { uA: { value: texA }, uB: { value: texB }, uMix: { value: 0 }, uOp: { value: 1 } };

      const plane = new THREE.PlaneGeometry(1, 1);
      const mainMat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG_MAIN, transparent: true, depthWrite: false });
      const main = new THREE.Mesh(plane, mainMat);
      main.renderOrder = 2;
      const ambMat = new THREE.ShaderMaterial({
        uniforms: { ...uniforms, uCover: { value: new THREE.Vector2(1, 1) }, uFade: { value: 0 } },
        vertexShader: VERT, fragmentShader: FRAG_AMB, transparent: true, depthWrite: false,
      });
      const amb = new THREE.Mesh(plane, ambMat);
      amb.position.z = -1; amb.renderOrder = 1;
      scene.add(amb, main);

      const lay = { big: 1, small: 1, x: 0, y: 0 };

      let VW = 1, VH = 1;
      const size = () => {
        if (!stage.current) return;
        const w = stage.current.clientWidth, h = stage.current.clientHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h; cam.updateProjectionMatrix();
        VH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        VW = VH * cam.aspect;
        lay.big = Math.min(VH * 1.1, (VW * 1.12) / ASP);
        /* ტექსტი მარცხნივ, ბურგერი მარჯვენა ნახევარში */
        lay.small = Math.min(lay.big, (VW * 0.56) / ASP, VH);
        lay.x = VW * 0.22; lay.y = 0;

        amb.scale.set(VW * 1.3, VH * 1.3, 1);
        const sa = VW / VH, k = ASP / sa;
        ambMat.uniforms.uCover.value.set(k > 1 ? 1 / k : 1, k > 1 ? 1 : k);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(stage.current);
      if (txt.current) ro.observe(txt.current);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) size(); });

      let target = 0, cur = 0, mx = 0, my = 0, pmx = 0, pmy = 0, la = -1, lb = -1, lastChap = -2;
      let inView = true;

      const finish = () => {
        const el = sec.current;
        if (!el || doneRef.current) return;
        doneRef.current = true;
        target = 1; cur = 1;
        const before = el.offsetHeight;
        const root = document.documentElement;
        root.style.overflowAnchor = "none";
        el.style.height = "100vh";
        const delta = before - el.offsetHeight;
        window.scrollTo({ top: window.scrollY - delta, behavior: "instant" });
        requestAnimationFrame(() => { root.style.overflowAnchor = ""; });
      };

      const read = () => {
        const el = sec.current; if (!el || doneRef.current) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < window.innerHeight - 40) { finish(); return; }
        target = clamp(-r.top / (el.offsetHeight - window.innerHeight));
      };
      const move = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
      window.addEventListener("scroll", read, { passive: true });
      window.addEventListener("pointermove", move);

      const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0 });
      io.observe(sec.current);

      read(); cur = target;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!inView) return;

        cur += (target - cur) * (reduce ? 1 : 0.085);
        const p = cur;

        ambMat.uniforms.uFade.value = sstep(AMB_REVEAL[0], AMB_REVEAL[1], p);

        let ia, ib = 0, mix = 0, rev = 0;
        if (p < T.rev1) {
          rev = sstep(T.rev0, T.rev1, p);
          ia = Math.round(lerp(LAST, MATCH, rev));
        } else if (p < T.fwd0) {
          ia = MATCH; ib = 0; mix = sstep(T.rev1, T.fwd0, p);
        } else {
          const u = clamp((p - T.fwd0) / (T.fwd1 - T.fwd0));
          ia = Math.round(lerp(0, LAST, lerp(u, u * u * (3 - 2 * u), 0.35)));
        }
        if (ia !== la) { texA.image = imgs[ia]; texA.needsUpdate = true; la = ia; }
        if (ib !== lb) { texB.image = imgs[ib]; texB.needsUpdate = true; lb = ib; }
        uniforms.uMix.value = mix;

        const side = clamp((1 - sstep(0.04, 0.3, p)) + sstep(T.back0, T.back1, p));
        const fh = lerp(lay.big, lay.small, side);
        uniforms.uOp.value = 1;
        main.scale.set(fh * ASP, fh, 1);
        main.position.x = lay.x * side;
        main.position.y = lay.y * side;
        pmx += (mx - pmx) * 0.06; pmy += (my - pmy) * 0.06;
        main.rotation.y = Math.sin(rev * Math.PI) * 0.32 + Math.sin(p * Math.PI * 2.4) * 0.1 + pmx * 0.26;
        main.rotation.x = -pmy * 0.13 + Math.sin(p * Math.PI * 1.6) * 0.04;
        renderer.render(scene, cam);

        let ci = -1;
        CH_RANGES.forEach(([a, b], i) => { if (p >= a && p < b) ci = i; });
        if (ci !== lastChap) { lastChap = ci; setChap(ci); }

        if (big.current) big.current.style.transform = `translate3d(${-p * 10}vw,-50%,0)`;
        const io2 = 1 - sstep(0, 0.1, p), oo = sstep(T.back0, T.back1, p), vis = clamp(io2 + oo);
        if (intro.current) { intro.current.style.opacity = vis; intro.current.style.transform = `translateY(${p < 0.5 ? -sstep(0, 0.12, p) * 60 : (1 - oo) * 40}px)`; intro.current.style.pointerEvents = vis < 0.1 ? "none" : "auto"; }
        if (hint.current) hint.current.style.opacity = 1 - sstep(0, 0.04, p);
        if (cap.current) cap.current.style.opacity = ci >= 0 ? 1 : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${doneRef.current ? 0 : p})`;
      };
      raf = requestAnimationFrame(frame);
      setReady(true);

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("scroll", read);
        window.removeEventListener("pointermove", move);
        document.documentElement.style.overflowAnchor = "";
        plane.dispose(); mainMat.dispose(); ambMat.dispose(); texA.dispose(); texB.dispose(); renderer.dispose();
      });
    });

    return () => { dead = true; cancelAnimationFrame(raf); cleanups.forEach((fn) => fn()); };
  }, []);

  const C = chap >= 0 ? CHAPTERS[chap] : null;

  return (
    <section ref={sec} className="relative h-[560vh]">
      <style>{HERO_CSS}</style>
      <div ref={stage} className="hero-bg sticky top-0 h-screen overflow-hidden" style={{ perspective: 1400 }}>
        <Background />
        <div ref={big} className="hero-enter-bigtext display pointer-events-none absolute left-[4vw] top-1/2 select-none whitespace-nowrap text-[34vw] leading-none" style={{ WebkitTextStroke: "1px rgba(255,186,0,.14)", color: "transparent" }}>BURGER</div>
        <div ref={glow} className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side,rgba(255,150,0,.22),transparent)" }} />

        <canvas ref={canvas} aria-label="Exploding burger" className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000 ease-out ${ready ? "opacity-100" : "opacity-0"}`} style={{ mixBlendMode: "screen" }} />

        <div ref={intro} className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1200px] px-8">
            <HeroText txtRef={txt} btnsRef={btns} desktop />
          </div>
        </div>

        <div ref={hint} className="hero-enter-hint absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[.3em] text-white/60">
          Scroll to take it apart
          <span className="block h-9 w-5 rounded-full border border-white/40"><span className="mx-auto mt-2 block h-2 w-1 rounded bg-[#ffba00]" style={{ animation: "bob 1.4s infinite" }} /></span>
        </div>

        <div ref={cap} className="pointer-events-none absolute inset-x-0 bottom-14 px-5 opacity-0 transition-opacity duration-500">
          <div className="ml-[6vw] max-w-[420px] rounded-2xl border border-white/10 bg-black/50 p-5 text-left backdrop-blur-md">
            {C && (
              <div key={chap} className="pop">
                <p className="text-xs tracking-[.3em] text-[#ffba00]">{String(chap + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}</p>
                <h3 className="display mt-1 text-4xl">{C[0]}</h3>
                <p className="mt-2 text-sm text-[#b5b5b5]">{C[1]}</p>
              </div>
            )}
          </div>
        </div>

        <ul className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 space-y-3 text-right">
          {CHAPTERS.map(([n], i) => (
            <li key={n} className={`flex items-center justify-end gap-3 text-xs uppercase tracking-widest transition-all duration-500 ${chap === i ? "text-[#ffba00]" : chap < 0 ? "opacity-0" : "text-white/30"}`}>
              {n}<span className={`h-[2px] rounded transition-all duration-500 ${chap === i ? "w-10 bg-[#ffba00]" : "w-4 bg-white/30"}`} />
            </li>
          ))}
        </ul>

        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10"><div ref={bar} className="h-full origin-left bg-[#ffba00]" style={{ transform: "scaleX(0)" }} /></div>
      </div>

      <Marquee className="absolute inset-x-0 bottom-0 z-[15]" />
    </section>
  );
}

function BurgerScroll() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <BurgerScrollDesktop /> : <BurgerStatic />;
}

export default React.memo(BurgerScroll);