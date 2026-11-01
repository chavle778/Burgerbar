import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiHamburgerMenu, GiHamburger } from 'react-icons/gi';
import { SlBadge } from 'react-icons/sl';
import { IoStorefrontOutline, IoClose } from 'react-icons/io5';
import { FaPlay, FaPause, FaFacebook, FaPinterest, FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor } from 'react-icons/fa';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { FiPhone } from 'react-icons/fi';
import { MdOutlineEmail } from 'react-icons/md';
import { CiLocationOn } from 'react-icons/ci';
import { BiLogoTelegram } from 'react-icons/bi';

import './About.css';

// Hero background photo (a burger photo from /public). Swap the name to change it.
const HERO_IMAGE = '/homemade.jpg';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen];
};

const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const [ref, seen] = useInView(0.15);
  return (
    <Tag
      ref={ref}
      style={{ '--d': `${delay}s` }}
      className={`reveal ${seen ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
};

const CountUp = ({ to, suffix = '' }) => {
  const [ref, seen] = useInView(0.4);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return;
    }
    let raf;
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Navbar (fixed)                                                      */
/* ------------------------------------------------------------------ */

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/menu', label: 'Menu' },
  { to: '/contact', label: 'Contact Us' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-black/85 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
          : 'bg-transparent'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10 transition-all duration-300 ${
          solid ? 'h-[76px]' : 'h-[104px]'
        }`}
      >
        <Link to="/" aria-label="Home">
          <img
            src="/logo.png"
            alt="Logo"
            className={`transition-all duration-300 ${solid ? 'w-[104px]' : 'w-[130px] md:w-[140px]'}`}
          />
        </Link>

        <nav className="hidden items-center gap-9 text-white md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${pathname === item.to ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="h-11 w-[140px] cursor-pointer rounded-sm bg-[#FFBA00] font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white"
          >
            Shop Online
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="cursor-pointer text-3xl text-white md:hidden"
        >
          {open ? <IoClose /> : <GiHamburgerMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden bg-black/95 transition-[max-height] duration-500 ease-out md:hidden ${
          open ? 'max-h-[420px]' : 'max-h-0'
        }`}
      >
        <div className="space-y-1 px-6 pb-6 pt-2 text-white">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block border-b border-white/10 py-3 text-lg ${
                pathname === item.to ? 'text-[#FFBA00]' : 'hover:text-[#FFBA00]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="mt-4 h-11 w-full cursor-pointer rounded-sm bg-[#FFBA00] font-semibold text-black"
          >
            Shop Online
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#FFBA00]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const CHEFS = [
  { name: 'George Shaw', role: 'Head Chef', image: '/chef1.jpg' },
  { name: 'Callum Rose', role: 'Grill Master', image: '/chef2.jpg' },
  { name: 'Tine Bauer', role: 'Sauce & Pastry', image: '/chef3.jpg' },
];

const STATS = [
  { Icon: SlBadge, value: 15, suffix: '', label: 'Years of experience', iconClass: 'fill-[#ffba00]' },
  { Icon: GiHamburger, value: 90, suffix: '+', label: 'Menu variants', iconClass: 'fill-[#ffba00]' },
  { Icon: IoStorefrontOutline, value: 24, suffix: '', label: 'Restaurant branches', iconClass: 'stroke-[#ffba00]' },
];

const AboutUs = () => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | error | success

  const heroBgRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
  }, []);

  // Hero parallax (writes the transform directly, no re-render on scroll)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = heroBgRef.current;
      if (!el) return;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      const shift = Math.min(y * 0.35, 200);
      const scale = 1 + Math.min(y * 0.0003, 0.2);
      el.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setStatus(ok ? 'success' : 'error');
    if (ok) setEmail('');
  };

  return (
    <div className="about-page">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section id="header-bg" className="relative w-full overflow-hidden bg-black">
        {/* Parallax photo: moves slower than the page and zooms slightly on scroll */}
        <div ref={heroBgRef} className="absolute inset-x-0 -top-[40%] h-[180%] will-change-transform">
          <div
            className="hero-zoom h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />
        </div>
        <div className="relative z-10 flex min-h-[460px] w-full flex-col items-center justify-center bg-gradient-to-b from-black/80 via-black/60 to-black px-6 pb-16 pt-[140px] text-center md:min-h-[520px]">
          <nav aria-label="Breadcrumb" className="hero-fade mb-6 flex items-center gap-2 text-sm text-[#c0c0c0]">
            <Link to="/" className="transition hover:text-[#ffba00]">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">About Us</span>
          </nav>

          <h1 className="font-display text-[3.5rem] font-black uppercase text-white sm:text-[5rem] md:text-[6.5rem]">
            <span className="hero-mask"><span style={{ '--d': '0.1s' }}>About</span></span>
            <span className="hero-mask"><span style={{ '--d': '0.25s' }}>Us</span></span>
          </h1>

          <div className="hero-rule mt-6 h-[3px] bg-[#ffba00]" />

          <p className="hero-fade mt-6 max-w-[520px] text-base leading-relaxed text-[#c0c0c0]">
            Fifteen years of grills, fresh buns and honest ingredients, now serving 24 branches.
          </p>
        </div>
      </section>

      <main>
        {/* ---------------- Story ---------------- */}
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 lg:flex-row lg:gap-20 lg:px-12 lg:py-32">
          <StoryImage />

          <div className="flex w-full flex-col lg:max-w-[520px]">
            <Reveal>
              <h2 className="font-display text-[2.6rem] font-extrabold uppercase text-white sm:text-[3.4rem]">
                Good food for your all-day good mood
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 h-[3px] w-[100px] bg-[#ffba00]" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-[60ch] text-base leading-[1.8] text-[#c0c0c0]">
                We started with one grill and a simple rule: cook everything to order. Our patties are
                ground daily, our buns come from a local bakery, and our sauces are made in-house every
                morning.
              </p>
              <p className="mt-4 max-w-[60ch] text-base leading-[1.8] text-[#c0c0c0]">
                Fifteen years later the menu has grown to more than ninety items, but the rule has not
                changed.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <img src="/signature.png" className="mt-8 w-52" alt="Signature of George Shaw" />
              <p className="mt-2 text-lg font-bold text-white">George Shaw, CEO</p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <section className="border-y border-white/10 bg-[#101010]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {STATS.map(({ Icon, value, suffix, label, iconClass }, i) => (
              <Reveal key={label} delay={i * 0.12} className="group flex flex-col items-center px-6 py-14">
                <Icon className={`${iconClass} text-5xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110`} />
                <h3 className="font-display mt-5 text-[4rem] font-black text-white">
                  <CountUp to={value} suffix={suffix} />
                </h3>
                <p className="mt-1 text-[#c0c0c0]">{label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- Video ---------------- */}
        <section className="relative h-[80vh] min-h-[460px] w-full overflow-hidden">
          <video ref={videoRef} autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="/vid.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-10 bg-black/60" />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
            <button
              type="button"
              onClick={toggleVideo}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[#ffba00] text-black transition hover:scale-110"
            >
              {playing && (
                <span className="absolute inset-0 animate-ping rounded-full bg-[#ffba00] opacity-30" aria-hidden="true" />
              )}
              {playing ? <FaPause className="relative text-2xl" /> : <FaPlay className="relative ml-1 text-2xl" />}
            </button>
            <Reveal>
              <h2 className="font-display mt-8 text-5xl font-black uppercase text-white md:text-7xl">
                We serve you the best
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mx-auto mt-6 h-[3px] w-24 bg-[#ffba00]" />
              <p className="mx-auto mt-6 max-w-[560px] text-base leading-relaxed text-[#d4d4d4]">
                Watch how a burger goes from the grill to your table in under ten minutes.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Chefs ---------------- */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="font-display text-[3rem] font-extrabold uppercase text-white md:text-[4.2rem]">
              Our best chefs
            </h2>
            <div className="mt-5 h-[3px] w-[100px] bg-[#ffba00]" />
            <p className="mt-6 max-w-[480px] text-[#c0c0c0]">
              The people behind the grill, each with more than a decade of cooking behind them.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CHEFS.map((chef, i) => (
              <Reveal key={chef.name} delay={i * 0.12}>
                <article className="chef-card">
                  <div className="relative overflow-hidden rounded-md">
                    <img
                      src={chef.image}
                      alt={chef.name}
                      className="chef-photo aspect-[4/5] w-full object-cover"
                    />
                    <div className="chef-socials absolute bottom-5 right-5 flex flex-col gap-3 text-[1.6rem]">
                      <button type="button" aria-label={`${chef.name} on Facebook`} className="cursor-pointer">
                        <FaFacebook className="fill-[#ffba00] transition hover:fill-white" />
                      </button>
                      <button type="button" aria-label={`${chef.name} on Twitter`} className="cursor-pointer">
                        <AiFillTwitterCircle className="fill-[#ffba00] transition hover:fill-white" />
                      </button>
                      <button type="button" aria-label={`${chef.name} on Pinterest`} className="cursor-pointer">
                        <FaPinterest className="fill-[#ffba00] transition hover:fill-white" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-l-[3px] border-[#ffba00] pl-4">
                    <h3 className="font-display text-3xl font-extrabold uppercase text-white">{chef.name}</h3>
                    <p className="text-sm text-[#c0c0c0]">{chef.role}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* ---------------- Newsletter ---------------- */}
      <section className="w-full bg-[#ffba00] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-4xl font-black uppercase text-black md:text-5xl">
              Get exclusive updates
            </h2>
            <p className="mt-2 text-base text-black/70">
              New menu items and branch openings, straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} noValidate className="w-full lg:w-auto">
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder="Email"
                aria-label="Email address"
                aria-invalid={status === 'error'}
                className="h-[55px] w-full rounded-lg bg-white p-4 text-[#333] placeholder:text-[#5a5a5a] sm:w-[320px] lg:w-[380px]"
              />
              <button
                type="submit"
                className="flex h-[55px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-6 font-semibold text-white transition hover:bg-[#222] sm:w-[190px]"
              >
                <BiLogoTelegram className="text-2xl" />
                <span>Subscribe</span>
              </button>
            </div>
            <p role="status" className="mt-3 min-h-[1.25rem] text-center text-sm font-medium text-black sm:text-left">
              {status === 'error' && 'Enter a valid email address.'}
              {status === 'success' && 'Subscribed. Check your inbox.'}
            </p>
          </form>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="w-full bg-black px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/logo.png" className="h-10 w-36 object-contain object-left" alt="Logo" />
            <p className="mt-6 max-w-[34ch] leading-relaxed text-[#c0c0c0]">
              Fresh burgers, grilled to order since 2010.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Support</h2>
            <ul className="space-y-2 text-sm text-[#c0c0c0]">
              {["FAQ's", 'Privacy Policy', 'Terms & Conditions', 'Contact'].map((t) => (
                <li key={t} className="w-fit cursor-pointer transition hover:translate-x-1 hover:text-[#ffba00]">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Contact</h2>
            <div className="mb-3 flex items-center gap-2 text-[#c0c0c0]">
              <FiPhone className="text-xl text-[#ffba00]" />
              <p className="cursor-pointer text-sm transition hover:text-[#ffba00]">+62831-2864-349-1</p>
            </div>
            <div className="flex items-center gap-2 text-[#c0c0c0]">
              <MdOutlineEmail className="text-xl text-[#ffba00]" />
              <p className="cursor-pointer text-sm transition hover:text-[#ffba00]">contact@burgry.com</p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Address</h2>
            <div className="mb-6 flex items-start gap-2 text-sm text-[#c0c0c0]">
              <CiLocationOn className="mt-[2px] text-2xl text-[#ffba00]" />
              <p>Jl. Pantai Kuta No. 34, Badung, Bali.</p>
            </div>
            <h2 className="mb-3 text-lg font-bold">Follow us</h2>
            <div className="flex gap-4 text-lg text-[#ffba00]">
              {[FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor].map((Icon, i) => (
                <button key={i} type="button" aria-label="Social link" className="cursor-pointer transition hover:-translate-y-1 hover:text-white">
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="mx-auto my-10 max-w-7xl border-white/10" />

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-2 text-xs text-[#9a9a9a] md:flex-row">
          <p>Burger Template Kit by Nika Chavleishvili</p>
          <p>Copyright © 2025. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

/* Image with a single wipe-in reveal */
const StoryImage = () => {
  const [ref, seen] = useInView(0.2);
  return (
    <div ref={ref} className="relative w-full lg:max-w-[560px]">
      <div className={`img-reveal overflow-hidden rounded-lg ${seen ? 'is-visible' : ''}`}>
        <img src="/homemade.jpg" alt="Homemade burger" className="h-auto w-full object-cover" />
      </div>
      <div
        className={`absolute -bottom-6 -right-2 rounded-md bg-[#ffba00] px-6 py-4 text-black shadow-xl transition-all delay-700 duration-700 sm:-right-6 ${
          seen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <p className="font-display text-4xl font-black">Since 2010</p>
        <p className="text-sm font-medium">Grilled to order</p>
      </div>
    </div>
  );
};

export default AboutUs;