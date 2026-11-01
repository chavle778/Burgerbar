import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CiForkAndKnife, CiDeliveryTruck, CiLocationOn } from "react-icons/ci";
import { GiWaterDrop, GiHamburgerMenu } from "react-icons/gi";
import { LuLeaf } from "react-icons/lu";
import { FaCheck, FaPlay, FaRegMoneyBillAlt, FaQuoteRight, FaArrowRight, FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor, FaTimes } from "react-icons/fa";
import { BiLogoTelegram } from "react-icons/bi";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import BurgerScroll from "./burgerScroll";


/* ---------- Global CSS: fonts, animations, 3D ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Poppins:wght@300;400;500;600;700&display=swap');
.hm{font-family:'Poppins',system-ui,sans-serif}
.hm .display{font-family:'Anton','Poppins',sans-serif;letter-spacing:.02em;font-weight:400;text-transform:uppercase}
.hm .script{font-family:'Kaushan Script',cursive;letter-spacing:0}
.rv{opacity:0;transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0ms);will-change:transform,opacity}
.rv.up{transform:translateY(50px)}.rv.left{transform:translateX(-70px)}.rv.right{transform:translateX(70px)}
.rv.zoom{transform:scale(.85)}.rv.flip{transform:perspective(900px) rotateX(35deg) translateY(40px);transform-origin:top}
.rv.in{opacity:1;transform:none}
.pop{animation:pop .6s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0ms)}
@keyframes pop{from{opacity:0;transform:perspective(800px) rotateY(-25deg) translateY(30px) scale(.9)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-22px) rotate(2deg)}}
@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.15)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,186,0,.6)}100%{box-shadow:0 0 0 28px rgba(255,186,0,0)}}
.float{animation:float 6s ease-in-out infinite}
.hero-bg{background:radial-gradient(ellipse at 70% 30%,#2a1a00 0%,#0b0b0d 55%,#000 100%)}
.grid-bg{background-image:linear-gradient(rgba(255,186,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,186,0,.06) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(circle at 60% 40%,#000,transparent 70%)}
.tilt{transform-style:preserve-3d;transition:transform .15s ease-out,box-shadow .3s}
.gold-text{background:linear-gradient(90deg,#ffba00,#ff7a00,#ffd966);-webkit-background-clip:text;background-clip:text;color:transparent}
.btn{position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s}
.btn:hover{transform:translateY(-3px);box-shadow:0 10px 30px -8px rgba(255,186,0,.7)}
.btn:active{transform:scale(.96)}
.nl{position:relative}.nl:after{content:'';position:absolute;left:0;bottom:-6px;height:2px;width:0;background:#ffba00;transition:width .3s}.nl:hover:after{width:100%}
@keyframes rise{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-140px);opacity:0}}
@keyframes bob{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(10px);opacity:.3}}
@media (prefers-reduced-motion:reduce){.rv,.pop,.float{animation:none!important;transition:none!important;opacity:1!important;transform:none!important}}
`;

/* ---------- Helpers ---------- */
const Container = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>
);

function Reveal({ children, dir = "up", delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.15 });
    ref.current && io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ "--d": `${delay}ms` }} className={`rv ${dir} ${on ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function Tilt({ children, className = "", max = 12 }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(10px)`;
  };
  const leave = () => (ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0)");
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

const BurgerIcon = ({ className = "" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs><linearGradient id="bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd34d" /><stop offset="1" stopColor="#ff8a00" /></linearGradient></defs>
    <path d="M8 28C8 14 20 6 32 6s24 8 24 22z" fill="url(#bn)" />
    <g fill="#fff" opacity=".85"><ellipse cx="22" cy="16" rx="2" ry="1.2" /><ellipse cx="32" cy="12" rx="2" ry="1.2" /><ellipse cx="42" cy="16" rx="2" ry="1.2" /></g>
    <path d="M6 31q5 5 9 0t9 0 9 0 9 0 9 0 7 0v4H6z" fill="#7ed321" />
    <path d="M8 35h48l-4 6H12z" fill="#ffba00" />
    <rect x="7" y="41" width="50" height="7" rx="3.5" fill="#5a2d12" />
    <path d="M8 50h48c0 6-5 8-10 8H18c-5 0-10-2-10-8z" fill="url(#bn)" />
  </svg>
);

const Title = ({ children, sub }) => (
  <Reveal className="text-center">
    <h2 className="display text-4xl sm:text-5xl md:text-6xl text-white uppercase">{children}</h2>
    <div className="mx-auto mt-4 h-1 w-24 rounded bg-gradient-to-r from-[#ffba00] to-[#ff7a00]" />
    {sub && <p className="mx-auto mt-6 max-w-xl text-[#9a9a9a]">{sub}</p>}
  </Reveal>
);

const LOREM = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.";

/* ---------- Data ---------- */
const menu = {
  food: [
    ["Black Beef Burger", "burger1.png", "$42.00"], ["Big Meety", "burger2.png", "$45.00"],
    ["Chicken Burger", "burger3.png", "$15.00"], ["Double Mac Burger", "burger4.png", "$20.00"],
    ["Beef Cheese Burger", "burger5.png", "$45.00"], ["Big Meety", "burger6.png", "$35.00"],
    ["Crispy Chicken", "burger7.png", "$45.00"], ["Regular Beef Burger", "burger8.png", "$25.00"],
  ],
  snack: [
    ["French Fries", "meat.png", "$45.00"], ["French Fries", "fri.png", "$45.00"],
    ["Chicken Nuggets", "nuggets.png", "$45.00"], ["Beef Cheese Burger", "meat.png", "$45.00"],
    ["Tacos", "taco.png", "$45.00"], ["Chips", "chips.png", "$45.00"],
  ],
  beverage: [
    ["Cola", "cola.png", "$45.00"], ["Sweet Doughnut", "donut.png", "$45.00"],
    ["Ice Cream Pancake", "miniPancake.png", "$45.00"], ["Fruit Pancake", "pancake.png", "$45.00"],
    ["Sweet Smoothie", "drink.png", "$45.00"],
  ],
};
const tabs = [["food", "Food"], ["snack", "Snack"], ["beverage", "Beverage"]];
const nav = [["Home", "/"], ["About Us", "/about"], ["Menu", "/menu"], ["Contact Us", "/contact"]];

function Home() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("food");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = "#050505";
    document.body.style.overflowX = "hidden";
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setScrollY(y);
      setProgress((y / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="hm min-h-screen overflow-x-clip bg-[#050505] text-white">
      <style>{CSS}</style>

      {/* scroll progress */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-[#ffba00] to-[#ff7a00]" style={{ width: `${progress}%` }} />

      {/* ---------- NAVBAR ---------- */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "bg-black/80 backdrop-blur-xl shadow-lg shadow-black/40" : "bg-transparent"}`}>
        <Container className="flex h-[76px] items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <BurgerIcon className="h-10 w-10 transition duration-500 group-hover:rotate-[360deg] group-hover:scale-110 md:h-11 md:w-11" />
            <img src="/logo.png" className="w-[100px] md:w-[130px]" alt="Logo" />
          </Link>
          <nav className="hidden items-center gap-9 md:flex">
            {nav.map(([l, to], i) => (
              <Link key={l} to={to} className={`nl text-sm font-medium uppercase tracking-wider ${i === 0 ? "text-[#ffba00]" : "text-white/90"}`}>{l}</Link>
            ))}
            <button className="btn h-10 rounded-full bg-[#ffba00] px-6 text-sm font-semibold text-black">Shop Online</button>
          </nav>
          <button aria-label="menu" onClick={() => setOpen((p) => !p)} className="relative h-10 w-10 md:hidden">
            <GiHamburgerMenu className={`absolute inset-0 m-auto text-3xl transition-all duration-300 ${open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
            <FaTimes className={`absolute inset-0 m-auto text-2xl text-[#ffba00] transition-all duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
          </button>
        </Container>
        {/* animated dropdown */}
        <div className={`grid transition-[grid-template-rows] duration-500 ease-out md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="mx-auto flex max-w-[480px] flex-col gap-1 px-5 pb-6 pt-2">
              {nav.map(([l, to], i) => (
                <Link key={l} to={to} onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 70 + 100}ms` : "0ms" }}
                  className={`rounded-xl px-4 py-3 text-lg transition-all duration-500 hover:bg-white/5 hover:text-[#ffba00] ${open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>{l}</Link>
              ))}
              <button style={{ transitionDelay: open ? "400ms" : "0ms" }}
                className={`btn mt-3 h-12 rounded-full bg-[#ffba00] font-semibold text-black transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>Shop Online</button>
            </div>
          </div>
        </div>
      </header>

      <BurgerScroll />

      {/* ---------- CATEGORY CARDS ---------- */}
      <Container className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[["FOOD", "#ffba00", "#ff8a00", "text-black", "food-div"], ["SNACK", "#007f3f", "#00a050", "text-white", "food-div2"], ["BEVERAGE", "#cc2e2e", "#ef4444", "text-white", "food-div3"]].map(([t, c1, c2, tc, id], i) => (
          <Reveal key={t} dir="flip" delay={i * 120}>
            <Tilt className="mx-auto max-w-[420px] cursor-pointer sm:max-w-none" max={10}>
              <div className="group relative flex h-[120px] items-center gap-5 overflow-hidden rounded-2xl pr-5 shadow-xl transition-shadow hover:shadow-2xl" style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 transition duration-500 group-hover:scale-150" />
                <div id={id} className="h-full w-[110px] shrink-0 bg-cover bg-center transition duration-500 group-hover:scale-110 group-hover:-rotate-3" style={{ transform: "translateZ(40px)" }} />
                <div className="relative">
                  <p className={`display text-3xl ${tc}`}>{t}</p>
                  <p className={`text-sm opacity-90 ${tc}`}>Lorem ipsum dolor sit.</p>
                  <p className={`mt-1 inline-flex items-center gap-2 text-sm font-bold ${i ? "text-[#ffba00]" : "text-black"}`}>Buy Online <FaArrowRight className="text-xs transition group-hover:translate-x-2" /></p>
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </Container>

      {/* ---------- PROMOS ---------- */}
      <Container className="mt-24 grid gap-8 lg:grid-cols-2">
        {[["Get a 10% discount on payday week", "/flying-burger-isolated-on-white-background.png"], ["Buy 1 Coke Get 1 Free", "/cola.png"]].map(([t, img], i) => (
          <Reveal key={t} dir={i ? "right" : "left"}>
            <Tilt className="mx-auto max-w-[460px] lg:max-w-none">
              <div className="flex flex-col-reverse items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1d21] to-[#0d0f11] p-6 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <p className="text-sm text-[#ffba00]">Payday promo</p>
                  <h3 className="display mt-2 text-3xl uppercase">{t}</h3>
                  <p className="mt-2 text-sm text-[#7a7a7a]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <p className="mt-3 cursor-pointer text-sm font-bold text-[#ffba00]">Buy Online →</p>
                </div>
                <img src={img} alt="" className="float w-[200px] object-contain" style={{ transform: "translateZ(50px)" }} />
              </div>
            </Tilt>
          </Reveal>
        ))}
      </Container>

      {/* ---------- ABOUT ---------- */}
      <Container className="mt-28 grid items-center gap-12 lg:grid-cols-2">
        <Reveal dir="left"><Tilt max={8}><img src="homemade.jpg" alt="burger" className="mx-auto w-full max-w-[520px] rounded-3xl object-cover shadow-2xl shadow-black lg:max-w-none" /></Tilt></Reveal>
        <div className="mx-auto max-w-xl text-center lg:text-left">
          <Reveal dir="right"><h2 className="display text-4xl uppercase sm:text-5xl">Find your best tasted food &amp; drink <span className="gold-text">in one place</span></h2></Reveal>
          <Reveal dir="right" delay={120}><p className="mt-5 text-[#a0a0a0]">{LOREM} Cum sociis natoque penatibus et magnis dis parturient montes.</p></Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Best Price", "Best Service", "Fresh Ingredient", "Health Protocol"].map((t, i) => (
              <Reveal key={t} delay={i * 100} dir="zoom">
                <div className="flex items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition hover:bg-[#ffba00]/10 sm:justify-start">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ffba00] text-black"><FaCheck className="text-xs" /></span>{t}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}><button className="btn mt-9 h-12 rounded-full bg-[#ffba00] px-8 font-semibold text-black">About Us</button></Reveal>
        </div>
      </Container>

      {/* ---------- MENU ---------- */}
      <section className="mt-28">
        <Container>
          <Title sub={LOREM}>Our Best Menu</Title>
          <Reveal delay={150}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {tabs.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`h-11 w-[110px] rounded-full text-sm font-semibold transition-all duration-300 ${tab === id ? "scale-105 bg-[#ffba00] text-black shadow-lg shadow-[#ffba00]/30" : "bg-[#171717] hover:bg-[#ffba00]/20"}`}>{label}</button>
              ))}
            </div>
          </Reveal>
          <div key={tab} className="mx-auto mt-12 grid max-w-[420px] gap-8 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menu[tab].map(([name, img, price], i) => (
              <div key={name + i} className="pop" style={{ "--d": `${i * 70}ms` }}>
                <Tilt max={16}>
                  <div className="group rounded-3xl border border-white/5 bg-[#111] p-5 text-center transition hover:border-[#ffba00]/40">
                    <div className="grid h-[180px] place-items-center rounded-2xl bg-gradient-to-b from-[#222] to-[#151515]">
                      <img src={img} alt={name} className="w-[140px] transition duration-500 group-hover:-translate-y-2 group-hover:scale-110 group-hover:rotate-3" style={{ transform: "translateZ(40px)" }} />
                    </div>
                    <h3 className="mt-4 font-bold uppercase tracking-wide">{name}</h3>
                    <p className="mt-1 text-sm text-[#7a7a7a]">Lorem ipsum dolor sit amet, consectetur.</p>
                    <p className="mt-2 text-lg font-bold text-[#ffba00]">{price}</p>
                    <button className="btn mt-3 rounded-full bg-[#ffba00] px-6 py-2 text-sm font-semibold text-black">Add to Cart</button>
                  </div>
                </Tilt>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- VIDEO (parallax) ---------- */}
      <section className="relative mt-28 h-[80vh] min-h-[460px] overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-[120%] w-full object-cover" style={{ transform: `translateY(${-(scrollY * 0.05)}px)` }}>
          <source src="/vid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/60 to-[#050505]" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <Reveal dir="zoom"><button aria-label="play" className="grid h-20 w-20 place-items-center rounded-full bg-[#ffba00]" style={{ animation: "pulse 1.8s infinite" }}><FaPlay className="ml-1 text-2xl text-black" /></button></Reveal>
          <Reveal delay={150}><h2 className="display mt-6 text-5xl uppercase sm:text-6xl md:text-7xl">We serve you the best</h2></Reveal>
          <Reveal delay={250}><p className="mx-auto mt-4 max-w-xl text-[#c0c0c0]">{LOREM}</p></Reveal>
        </div>
      </section>

      {/* ---------- ORDER BY PHONE ---------- */}
      <Container className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <Reveal dir="left"><img src="/food-clay.jpg" alt="food" className="float mx-auto w-full max-w-[420px] rounded-3xl" /></Reveal>
        <div className="mx-auto max-w-xl text-center lg:text-left">
          <Reveal dir="right"><h2 className="display text-4xl sm:text-5xl">Don't worry! You can order your food <span className="gold-text">just by phone</span></h2></Reveal>
          <Reveal dir="right" delay={100}><p className="mt-5 text-[#a0a0a0]">{LOREM}</p></Reveal>
          <div className="mt-8 grid gap-4">
            {[[CiDeliveryTruck, "Free Delivery"], [FaRegMoneyBillAlt, "Special Promo"]].map(([I, t], i) => (
              <Reveal key={t} dir="right" delay={150 + i * 120}>
                <div className="group flex items-center gap-5 rounded-2xl bg-[#141414] p-5 text-left transition hover:-translate-y-1 hover:bg-[#1c1c1c]">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#ffba00] text-black transition group-hover:rotate-[360deg] duration-700"><I className="text-4xl" /></div>
                  <div><h3 className="text-xl font-bold">{t}</h3><p className="text-[#9a9a9a]">Lorem ipsum dolor sit amet.</p></div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <div className="mt-8 flex justify-center gap-4 lg:justify-start">
              <img src="apple.png" alt="apple" className="w-[130px] cursor-pointer transition hover:scale-105 sm:w-[150px]" />
              <img src="google-play.png" alt="google play" className="w-[130px] cursor-pointer transition hover:scale-105 sm:w-[150px]" />
            </div>
          </Reveal>
        </div>
      </Container>

      {/* ---------- REVIEWS ---------- */}
      <section className="mt-28 bg-[#0d0d0d] py-20">
        <Container>
          <Title sub={LOREM}>Customer Review</Title>
          <div className="mx-auto mt-12 grid max-w-[460px] gap-6 md:max-w-none md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Reveal key={i} dir="flip" delay={i * 120}>
                <Tilt>
                  <div className="relative h-full rounded-2xl border border-white/5 bg-black p-6">
                    <p className="mb-6 text-[#b0b0b0]">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
                    <div className="flex items-center gap-4">
                      <img src={`john${i}.jpg`} alt="john doe" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#ffba00]" />
                      <div><h4 className="font-bold uppercase">John Doe</h4><p className="text-sm text-[#8a8a8a]">Designation</p></div>
                    </div>
                    <FaQuoteRight className="absolute bottom-5 right-5 text-4xl text-[#ffba00]/80" />
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- RESERVATION CTA ---------- */}
      <section id="bg-image" className="relative bg-fixed bg-cover bg-center">
        <div className="bg-black/55 py-24 md:py-32">
          <Container className="text-center md:text-left">
            <Reveal><h2 className="display max-w-2xl text-4xl uppercase sm:text-5xl md:text-6xl">Get a special offer for your <span className="gold-text">special occasion</span></h2></Reveal>
            <Reveal delay={150}><p className="mt-5 max-w-xl text-[#d0d0d0]">{LOREM}</p></Reveal>
            <Reveal delay={250}><button className="btn mt-8 h-12 rounded-full bg-[#ffba00] px-8 font-semibold text-black">Book a Reservation</button></Reveal>
          </Container>
        </div>
      </section>

      {/* ---------- NEWS ---------- */}
      <Container className="mt-20">
        <Title sub={LOREM}>Our News &amp; Article</Title>
        <div className="mx-auto mt-12 grid max-w-[460px] gap-8 lg:max-w-none lg:grid-cols-3">
          {[["juicy-burger", "Look how we make beef meat tasty with this technique"], ["food", "Get a 20% discount at our birthday event for $20 spend"], ["shake", "Strawberry smoothie is the best beverage for your hot day"]].map(([id, t], i) => (
            <Reveal key={t} delay={i * 130}>
              <article className="group">
                <div className="relative h-[240px] overflow-hidden rounded-2xl shadow-lg shadow-black/50">
                  <div id={id} className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-110 group-hover:rotate-1" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition group-hover:opacity-30" />
                </div>
                <h3 className="mt-4 text-lg font-bold uppercase leading-6">{t}</h3>
                <p className="mt-2 text-sm text-[#9a9a9a]">{LOREM}</p>
                <a href="#" className="mt-3 inline-flex items-center gap-2 text-[#ffba00]">Read more <FaArrowRight className="text-xs transition group-hover:translate-x-2" /></a>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ---------- NEWSLETTER ---------- */}
      <section className="mt-28 bg-[#ffba00] py-12">
        <Container className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
          <Reveal dir="left"><h2 className="display text-4xl uppercase text-black sm:text-5xl">Get Exclusive Update</h2><p className="mt-1 text-black/70">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></Reveal>
          <Reveal dir="right" className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <input type="email" placeholder="Email" className="h-14 w-full rounded-full bg-white px-6 text-[#333] outline-none focus:ring-4 focus:ring-black/20 sm:w-[320px]" />
            <button className="btn flex h-14 items-center justify-center gap-2 rounded-full bg-black px-7 text-white"><BiLogoTelegram className="text-2xl" />Subscribe Now</button>
          </Reveal>
        </Container>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-black py-14">
        <Container className="grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
          <div><img src="/logo.png" alt="logo" className="mx-auto h-10 w-36 object-contain sm:mx-0" /><p className="mt-5 text-sm leading-relaxed text-[#9a9a9a]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.</p></div>
          <div>
            <h4 className="display mb-4 text-2xl">Support</h4>
            <ul className="space-y-2 text-sm text-[#9a9a9a]">{["FAQ's", "Privacy Policy", "Terms & Conditions", "Contact"].map((t) => <li key={t} className="cursor-pointer transition hover:text-[#ffba00]">{t}</li>)}</ul>
          </div>
          <div>
            <h4 className="display mb-4 text-2xl">Contact</h4>
            <p className="flex items-center justify-center gap-2 text-sm text-[#9a9a9a] sm:justify-start"><FiPhone className="text-xl text-[#ffba00]" />+62831-2864-349-1</p>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-[#9a9a9a] sm:justify-start"><MdOutlineEmail className="text-xl text-[#ffba00]" />contact@burgry.com</p>
          </div>
          <div>
            <h4 className="display mb-4 text-2xl">Address</h4>
            <p className="flex items-start justify-center gap-2 text-sm text-[#9a9a9a] sm:justify-start"><CiLocationOn className="mt-[2px] text-2xl text-[#ffba00]" />Jl. Pantai Kuta No. 34, Badung, Bali.</p>
            <div className="mt-5 flex justify-center gap-4 text-lg text-[#ffba00] sm:justify-start">
              {[FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor].map((I, i) => <I key={i} className="cursor-pointer transition hover:-translate-y-1 hover:scale-125" />)}
            </div>
          </div>
        </Container>
        <Container><hr className="my-10 border-white/10" />
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-[#7a7a7a] md:flex-row"><p>Burger Template Kit by Nika Chavleishvili</p><p>Copyright © 2025. All rights reserved</p></div>
        </Container>
      </footer>
    </div>
  );
}

export default Home;