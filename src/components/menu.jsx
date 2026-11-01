import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CiDeliveryTruck } from 'react-icons/ci';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { IoClose, IoBagHandleOutline } from 'react-icons/io5';

import Navbar from './Navbar';
import VideoBanner from './VideoBanner';
import SiteFooter from './SiteFooter';
import { Reveal } from './Reveal';

import './About.css';

const TABS = [
  { id: 'food', label: 'Food' },
  { id: 'snack', label: 'Snack' },
  { id: 'beverage', label: 'Beverage' },
];

const MENU = {
  food: [
    { name: 'Black Beef Burger', img: '/burger1.png', price: 42, desc: 'Charred beef patty, black bun, smoked cheddar.' },
    { name: 'Big Meety', img: '/burger2.png', price: 45, desc: 'Double patty, pickles and house sauce.' },
    { name: 'Chicken Burger', img: '/burger3.png', price: 15, desc: 'Grilled chicken, lettuce and light mayo.' },
    { name: 'Double Mac Burger', img: '/burger4.png', price: 20, desc: 'Two patties, three buns, extra cheese.' },
    { name: 'Beef Cheese Burger', img: '/burger5.png', price: 45, desc: 'Beef patty with melted cheese and onions.' },
    { name: 'Big Meety Classic', img: '/burger6.png', price: 35, desc: 'The original, with tomato and crisp lettuce.' },
    { name: 'Crispy Chicken', img: '/burger7.png', price: 45, desc: 'Fried chicken fillet with spicy slaw.' },
    { name: 'Regular Beef Burger', img: '/burger8.png', price: 25, desc: 'Simple beef burger, grilled to order.' },
  ],
  snack: [
    { name: 'Grilled Meat Bites', img: '/meat.png', price: 18, desc: 'Skewered meat bites with dipping sauce.' },
    { name: 'French Fries', img: '/fri.png', price: 8, desc: 'Crisp fries with sea salt.' },
    { name: 'Chicken Nuggets', img: '/nuggets.png', price: 12, desc: 'Golden nuggets, six pieces.' },
    { name: 'Beef Taco', img: '/taco.png', price: 14, desc: 'Soft taco with beef and fresh salsa.' },
    { name: 'Potato Chips', img: '/chips.png', price: 6, desc: 'Thin-cut chips, lightly salted.' },
  ],
  beverage: [
    { name: 'Cola', img: '/cola.png', price: 5, desc: 'Ice-cold cola, 0.5 L.' },
    { name: 'Sweet Doughnut', img: '/donut.png', price: 7, desc: 'Glazed doughnut, baked fresh.' },
    { name: 'Ice Cream Pancake', img: '/miniPancake.png', price: 12, desc: 'Mini pancakes with vanilla ice cream.' },
    { name: 'Fruit Pancake', img: '/pancake.png', price: 14, desc: 'Pancake stack with seasonal fruit.' },
    { name: 'Sweet Smoothie', img: '/drink.png', price: 10, desc: 'Fruit smoothie blended to order.' },
  ],
};

const money = (n) => `$${n.toFixed(2)}`;

const MIN_BURGER = Math.min(...MENU.food.map((i) => i.price));
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  delay: `${((i * 0.9) % 6).toFixed(1)}s`,
  duration: `${5 + (i % 4)}s`,
}));

const Menu = () => {
  const [activeTab, setActiveTab] = useState('food');
  const [cart, setCart] = useState({}); // { key: { name, price, qty } }
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const timer = useRef(null);
  const heroRef = useRef(null);
  const menuRef = useRef(null);

  // Hero parallax: eased (lerped) so layers glide instead of jumping with the wheel.
  // Each element with data-depth moves at its own speed; positive = up, negative = lags behind.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = heroRef.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll('[data-depth]'));
    const fadeEl = root.querySelector('[data-fade]');
    let target = window.scrollY;
    let current = target;
    let raf = 0;

    const apply = (y) => {
      const yy = Math.min(y, window.innerHeight * 1.3);
      layers.forEach((el) => {
        el.style.transform = `translate3d(0, ${(-yy * parseFloat(el.dataset.depth)).toFixed(2)}px, 0)`;
      });
      if (fadeEl) {
        fadeEl.style.opacity = String(1 - Math.min(yy / (window.innerHeight * 0.9), 1) * 0.65);
      }
    };
    const tick = () => {
      current += (target - current) * 0.09;
      if (Math.abs(target - current) < 0.2) current = target;
      apply(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      target = window.scrollY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    apply(current);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (id) => {
    setActiveTab(id);
    menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
    return () => clearTimeout(timer.current);
  }, []);

  const addItem = (tab, item) => {
    const key = `${tab}:${item.name}`;
    setCart((c) => ({
      ...c,
      [key]: { name: item.name, price: item.price, qty: (c[key]?.qty || 0) + 1 },
    }));
    setJustAdded(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), 900);
  };

  const changeQty = (key, delta) => {
    setCart((c) => {
      const next = { ...c };
      const qty = next[key].qty + delta;
      if (qty <= 0) delete next[key];
      else next[key] = { ...next[key], qty };
      return next;
    });
  };

  const entries = Object.entries(cart);
  const count = entries.reduce((s, [, i]) => s + i.qty, 0);
  const total = entries.reduce((s, [, i]) => s + i.qty * i.price, 0);

  return (
    <div className="about-page">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section
        ref={heroRef}
        className="relative isolate w-full overflow-hidden bg-[radial-gradient(ellipse_at_70%_30%,#2a1a00_0%,#0b0b0d_55%,#000_100%)]"
      >
        <div className="menu-grid absolute inset-0" aria-hidden="true" />
        <div
          data-depth="-0.25"
          className="absolute -right-[10%] top-[5%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(255,138,0,0.22),transparent_65%)] blur-2xl"
          aria-hidden="true"
        />

        {/* Giant outlined word behind everything */}
        <div
          data-depth="-0.18"
          className="font-display outline-text pointer-events-none absolute inset-x-0 top-[12%] select-none text-center text-[clamp(10rem,34vw,32rem)] font-black uppercase leading-none"
          aria-hidden="true"
        >
          Menu
        </div>

        {/* Embers */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {EMBERS.map((e, i) => (
            <span key={i} className="ember" style={{ left: e.left, animationDelay: e.delay, animationDuration: e.duration }} />
          ))}
        </div>

        <div className="relative z-20 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-6 px-6 pb-28 pt-[120px] lg:grid-cols-2 lg:gap-10">
          {/* Left: copy */}
          <div data-depth="-0.12" data-fade className="text-center lg:text-left">
            <p className="hero-fade font-script text-3xl text-[#ffba00] sm:text-4xl">Fresh from the grill</p>
            <span className="hero-fade mt-4 inline-block rounded-full border border-[#ffba00]/50 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-[#ffba00]">
              Juicy &middot; Fresh &middot; Fast
            </span>

            <h1 className="font-display mt-5 text-[3.6rem] font-black uppercase text-white sm:text-[5.2rem] lg:text-[6.4rem]">
              <span className="hero-mask pb-2"><span style={{ '--d': '0.1s' }}>Our delicious</span></span>
              <span className="hero-mask pb-2">
                <span style={{ '--d': '0.25s' }} className="gold-text mx-auto w-fit lg:mx-0">Menu</span>
              </span>
            </h1>

            <p className="hero-fade mx-auto mt-5 max-w-[480px] text-base leading-relaxed text-[#b5b5b5] lg:mx-0">
              Burgers, snacks and drinks, cooked to order and ready in minutes.
            </p>

            <div className="hero-fade mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <button
                type="button"
                onClick={() => goTo('food')}
                className="h-12 cursor-pointer rounded-full bg-[#ffba00] px-8 font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_rgba(255,186,0,0.7)]"
              >
                Order now
              </button>
              <Link
                to="/about"
                className="flex h-12 items-center rounded-full border border-white/20 px-8 font-semibold text-white transition hover:border-[#ffba00] hover:text-[#ffba00]"
              >
                Learn more
              </Link>
            </div>

            <div className="hero-fade mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[#8a8a8a] lg:justify-start">
              {[['food', 'Burgers'], ['snack', 'Snacks'], ['beverage', 'Drinks']].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => goTo(id)}
                  className="cursor-pointer transition hover:text-[#ffba00]"
                >
                  <span className="font-display mr-1 text-2xl font-extrabold text-white">{MENU[id].length}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: burger composition */}
          <div className="relative flex items-center justify-center">
            <div data-depth="0.06" className="relative flex w-full max-w-[520px] items-center justify-center">
              <div className="absolute aspect-square w-[min(88vw,540px)] rounded-full bg-[radial-gradient(circle,rgba(255,186,0,0.32),transparent_65%)]" aria-hidden="true" />
              <div className="spin-slow absolute aspect-square w-[min(80vw,470px)] rounded-full border border-dashed border-[#ffba00]/30" aria-hidden="true" />
              <img
                src="/burger5.png"
                alt="Beef cheese burger"
                className="float-slow relative z-10 h-auto w-[min(76vw,420px)] drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]"
              />
              <div className="absolute bottom-2 left-0 z-20 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md sm:-left-4">
                <p className="text-xs text-[#9a9a9a]">Burgers from</p>
                <p className="font-display text-3xl font-extrabold text-[#ffba00]">{money(MIN_BURGER)}</p>
              </div>
            </div>

            <div data-depth="0.16" className="absolute left-0 top-[58%] z-20 hidden w-[150px] sm:block xl:-left-6 xl:w-[180px]" aria-hidden="true">
              <div className="-rotate-12">
                <img src="/burger2.png" alt="" className="float-slow h-auto w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.65)]" style={{ animationDelay: '1.1s' }} />
              </div>
            </div>
            <div data-depth="0.24" className="absolute right-0 top-[4%] z-20 hidden w-[84px] sm:block xl:-right-2 xl:w-[100px]" aria-hidden="true">
              <div className="rotate-12">
                <img src="/cola.png" alt="" className="float-slow h-auto w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.6)]" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            <div data-depth="0.2" className="absolute bottom-[8%] right-0 z-20 hidden w-[110px] sm:block xl:-right-4 xl:w-[130px]" aria-hidden="true">
              <div className="rotate-6">
                <img src="/fri.png" alt="" className="float-slow h-auto w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.6)]" style={{ animationDelay: '1.7s' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black" />
        <div className="hero-fade absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3" aria-hidden="true">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">Scroll</span>
          <div className="scroll-cue" />
        </div>
      </section>

      <main>
        {/* ---------------- Tabs + items ---------------- */}
        <section ref={menuRef} className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 lg:py-28">
          <div role="tablist" aria-label="Menu categories" className="flex justify-center gap-3 sm:gap-6">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-12 min-w-[110px] cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-[#ffba00] text-black shadow-[0_10px_30px_rgba(255,186,0,0.25)]'
                      : 'bg-[#171717] text-white hover:bg-[#262626]'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs ${active ? 'text-black/60' : 'text-[#7a7a7a]'}`}>
                    {MENU[tab.id].length}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            key={activeTab}
            role="tabpanel"
            className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {MENU[activeTab].map((item, i) => {
              const key = `${activeTab}:${item.name}`;
              const qty = cart[key]?.qty || 0;
              const added = justAdded === key;
              return (
                <article
                  key={key}
                  style={{ '--i': i }}
                  className="menu-card group mx-auto flex w-full max-w-[270px] flex-col items-center text-center"
                >
                  <div className="menu-photo relative flex h-[190px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#171717]">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="menu-img relative z-10 h-auto w-[140px]"
                    />
                    {qty > 0 && (
                      <span className="absolute right-3 top-3 z-20 rounded-full bg-[#ffba00] px-2.5 py-0.5 text-xs font-bold text-black">
                        x{qty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-5 text-[1.7rem] font-extrabold uppercase text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 max-w-[24ch] text-sm leading-relaxed text-[#9a9a9a]">{item.desc}</p>
                  <p className="font-display mt-3 text-2xl font-extrabold text-[#ffba00]">{money(item.price)}</p>
                  <button
                    type="button"
                    onClick={() => addItem(activeTab, item)}
                    className={`mt-3 h-11 w-full max-w-[180px] cursor-pointer rounded-lg font-semibold transition duration-300 ${
                      added ? 'bg-white text-black' : 'bg-[#ffba00] text-black hover:bg-white'
                    }`}
                  >
                    {added ? 'Added' : 'Add to cart'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------------- Promos ---------------- */}
        <section className="mx-auto flex max-w-7xl flex-col flex-wrap justify-center gap-8 px-6 pb-24 lg:flex-row">
          {[
            {
              label: 'Payday promo',
              title: 'Get a 10% discount on payday week',
              text: 'Valid on every burger in all branches.',
              img: '/flying-burger-isolated-on-white-background.png',
              alt: 'Flying burger',
            },
            {
              label: 'Payday promo',
              title: 'Buy 1 Coke, get 1 Coke free',
              text: 'Add any burger to your order to unlock it.',
              img: '/cola.png',
              alt: 'Coke',
            },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12} className="w-full md:w-[500px]">
              <div className="flex h-full flex-col-reverse overflow-hidden rounded-lg bg-[#171717] md:h-[250px] md:flex-row">
                <div className="flex flex-col justify-center gap-2 p-6 text-center md:text-left">
                  <p className="text-sm text-[#ffba00]">{p.label}</p>
                  <h2 className="font-display text-3xl font-extrabold uppercase leading-none text-white">{p.title}</h2>
                  <p className="text-sm text-[#9a9a9a]">{p.text}</p>
                  <button type="button" className="w-fit cursor-pointer self-center text-[0.95rem] font-bold text-[#ffba00] transition hover:text-white md:self-start">
                    Order online
                  </button>
                </div>
                <div className="flex items-center justify-center p-4">
                  <img
                    src={p.img}
                    alt={p.alt}
                    className="float-slow h-auto w-full max-w-[250px] object-contain"
                    style={{ animationDelay: `${i * 0.8}s` }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </section>
      </main>

      <VideoBanner
        title="We serve you the best"
        text="Watch how a burger goes from the grill to your table in under ten minutes."
      />

      {/* ---------------- Order by phone ---------------- */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 lg:flex-row lg:gap-20 lg:py-32">
        <Reveal className="w-full lg:max-w-[480px]">
          <img src="/food-clay.jpg" alt="Burger on a plate" className="h-auto w-full rounded-lg object-cover" />
        </Reveal>

        <div className="flex w-full flex-col lg:max-w-[520px]">
          <Reveal>
            <h2 className="font-display text-center text-[2.6rem] font-extrabold uppercase text-white sm:text-[3.4rem] lg:text-left">
              Don't worry, you can order your food just by phone
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-6 h-[3px] w-[100px] bg-[#ffba00] lg:mx-0" />
            <p className="mt-6 max-w-[56ch] text-center leading-[1.8] text-[#c0c0c0] lg:text-left">
              Call your nearest branch or use our app. Your order is confirmed in seconds and delivered while it is still hot.
            </p>
          </Reveal>

          <div className="mt-8 flex flex-col gap-4">
            {[
              { Icon: CiDeliveryTruck, size: 'text-5xl', title: 'Free delivery', text: 'On every order over $30.' },
              { Icon: FaRegMoneyBillAlt, size: 'text-[2.7rem]', title: 'Special promo', text: 'New offers every payday week.' },
            ].map(({ Icon, size, title, text }, i) => (
              <Reveal key={title} delay={0.15 + i * 0.1}>
                <div className="group flex h-[104px] w-full items-center gap-5 rounded-lg bg-[#171717] px-5 lg:w-[420px]">
                  <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-lg bg-[#ffba00] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                    <Icon className={`${size} fill-black`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold uppercase text-white">{title}</h3>
                    <p className="text-[#9a9a9a]">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.35} className="mt-10 flex justify-center gap-5 lg:justify-start">
            <img src="/apple.png" className="w-[130px] cursor-pointer transition hover:-translate-y-1 sm:w-[150px]" alt="Download on the App Store" />
            <img src="/google-play.png" className="w-[130px] cursor-pointer transition hover:-translate-y-1 sm:w-[150px]" alt="Get it on Google Play" />
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {/* ---------------- Floating cart ---------------- */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
        {cartOpen && (
          <div className="cart-panel w-[min(340px,calc(100vw-2.5rem))] rounded-xl border border-white/10 bg-[#101010]/95 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold uppercase text-white">Your order</h2>
              <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)} className="cursor-pointer text-2xl text-[#9a9a9a] transition hover:text-white">
                <IoClose />
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="py-6 text-sm text-[#9a9a9a]">Your cart is empty. Add something from the menu.</p>
            ) : (
              <>
                <ul className="mt-3 max-h-[280px] divide-y divide-white/10 overflow-y-auto">
                  {entries.map(([key, it]) => (
                    <li key={key} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{it.name}</p>
                        <p className="text-[#9a9a9a]">{money(it.price * it.qty)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-white">
                        <button type="button" aria-label={`Remove one ${it.name}`} onClick={() => changeQty(key, -1)} className="h-7 w-7 cursor-pointer rounded-md bg-[#262626] transition hover:bg-[#ffba00] hover:text-black">-</button>
                        <span className="w-5 text-center">{it.qty}</span>
                        <button type="button" aria-label={`Add one ${it.name}`} onClick={() => changeQty(key, 1)} className="h-7 w-7 cursor-pointer rounded-md bg-[#262626] transition hover:bg-[#ffba00] hover:text-black">+</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[#c0c0c0]">Total</span>
                  <span className="font-display text-3xl font-extrabold text-[#ffba00]">{money(total)}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setCart({})} className="h-11 flex-1 cursor-pointer rounded-lg bg-[#262626] font-semibold text-white transition hover:bg-[#333]">
                    Clear
                  </button>
                  <button type="button" className="h-11 flex-[2] cursor-pointer rounded-lg bg-[#ffba00] font-semibold text-black transition hover:bg-white">
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCartOpen((o) => !o)}
          aria-label={`Cart, ${count} items`}
          aria-expanded={cartOpen}
          className="flex h-14 cursor-pointer items-center gap-3 rounded-full bg-[#ffba00] px-5 font-semibold text-black shadow-[0_12px_30px_rgba(255,186,0,0.35)] transition hover:scale-105"
        >
          <IoBagHandleOutline className="text-2xl" />
          <span key={count} className={count > 0 ? 'cart-bump' : ''}>{count}</span>
          {count > 0 && <span className="hidden sm:inline">{money(total)}</span>}
        </button>
      </div>
    </div>
  );
};

export default Menu;