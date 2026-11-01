import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMapPin, LuMail, LuPhone, LuClock, LuSend } from 'react-icons/lu';
import { CiMap } from 'react-icons/ci';
import { PiTelegramLogo } from 'react-icons/pi';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

import Navbar from './navbar';
import SiteFooter from './siteFooter';
import { Reveal } from './Reveal'; 

import './Contact.css'; // keeps your existing #bg-head photo

const ADDRESS_LINE_1 = 'Jl. Pantai Kuta No. 34,';
const ADDRESS_LINE_2 = 'Badung, Bali';
const PHONE = '+62831-2864-3491';
const EMAIL = 'contact@burgry.com';
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=Jalan+Pantai+Kuta+Bali';

// Optional: set a file name to use a specific hero photo (e.g. '/contact-bg.jpg').
// Leave it empty to keep using the photo your Contact.css already sets on #bg-head.
const HERO_IMAGE = '';

// Opening hours are 10:00 to 21:00 in Bali (UTC+8)
const isOpenNow = () => {
  const h = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Makassar' }).format(new Date())
  );
  return h >= 10 && h < 21;
};

const INFO = [
  { Icon: CiMap, title: 'Location', lines: [ADDRESS_LINE_1, ADDRESS_LINE_2], href: MAPS_LINK, external: true },
  { Icon: PiTelegramLogo, title: 'Email', lines: [EMAIL], href: `mailto:${EMAIL}` },
  { Icon: LuPhone, title: 'Phone', lines: [PHONE], href: `tel:${PHONE.replace(/[^+\d]/g, '')}` },
  { Icon: LuClock, title: 'Open hour', lines: ['10.00 am - 09.00 pm', 'Every day'], badge: true },
];

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!v.subject.trim()) e.subject = 'Please add a subject.';
  if (v.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.';
  return e;
};

const labelCls =
  "pointer-events-none absolute left-4 top-2 text-[11px] font-semibold uppercase tracking-wider text-[#ffba00] transition-all duration-200 " +
  "peer-[:placeholder-shown:not(:focus)]:top-[1.1rem] peer-[:placeholder-shown:not(:focus)]:text-sm peer-[:placeholder-shown:not(:focus)]:font-medium " +
  "peer-[:placeholder-shown:not(:focus)]:normal-case peer-[:placeholder-shown:not(:focus)]:tracking-normal peer-[:placeholder-shown:not(:focus)]:text-[#8a8a8a]";

// Floating-label field: the label sits inside the input and lifts when you focus or type
const FloatField = ({ id, label, error, hint, as: Tag = 'input', ...props }) => (
  <div>
    <div
      className={`relative rounded-xl border bg-[#151515] transition duration-300 focus-within:border-[#ffba00] focus-within:shadow-[0_0_0_4px_rgba(255,186,0,0.1)] ${
        error ? 'border-[#ff6b6b]/70' : 'border-white/10'
      }`}
    >
      <Tag
        id={id}
        name={id}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={`${id}-err`}
        {...props}
        className={`peer w-full bg-transparent px-4 pb-2.5 pt-6 text-sm text-white outline-none sm:text-base ${Tag === 'textarea' ? 'resize-none' : ''}`}
      />
      <label htmlFor={id} className={labelCls}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {hint && <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-[#6f6f6f]">{hint}</span>}
    </div>
    <p id={`${id}-err`} role="alert" className="mt-1.5 min-h-[1.1rem] text-xs text-[#ff6b6b]">
      {error}
    </p>
  </div>
);

const Contact = () => {
  const heroRef = useRef(null);
  const mapRef = useRef(null);
  const timer = useRef(null);

  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [open, setOpen] = useState(true);

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
    setOpen(isOpenNow());
    return () => clearTimeout(timer.current);
  }, []);

  // Hero parallax, eased so the layers glide instead of jumping with the wheel
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
      if (fadeEl) fadeEl.style.opacity = String(1 - Math.min(yy / (window.innerHeight * 0.8), 1) * 0.65);
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('sending');
    // TODO: replace this timeout with a real request to your backend or form service
    timer.current = setTimeout(() => {
      setStatus('sent');
      setValues({ name: '', email: '', subject: '', message: '' });
    }, 900);
  };

  const scrollToMap = () => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="about-page">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section ref={heroRef} className="relative isolate w-full overflow-hidden bg-black">
        {/* Photo: drifts slower than the page, settles in with a slow zoom on load */}
        <div data-depth="-0.3" className="absolute inset-x-0 -top-[35%] h-[170%] will-change-transform" aria-hidden="true">
          <div
            id="bg-head"
            className="hero-zoom h-full w-full bg-cover bg-center"
            style={HERO_IMAGE ? { backgroundImage: `url('${HERO_IMAGE}')` } : undefined}
          />
        </div>

        {/* Overlays: dark base, soft vignette, top shade for the navbar, fade into the page */}
        <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden="true" />
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_50%_45%,transparent_30%,rgba(0,0,0,0.65)_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 z-[3] h-40 bg-gradient-to-b from-black/80 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 z-[3] h-40 bg-gradient-to-b from-transparent to-black" aria-hidden="true" />

        <div className="relative z-20 flex min-h-[540px] flex-col items-center justify-center px-6 pb-24 pt-[130px] text-center md:min-h-[620px]">
          <div data-depth="-0.1" data-fade className="flex flex-col items-center">
            <nav aria-label="Breadcrumb" className="hero-fade mb-7 flex items-center gap-2 text-sm text-[#d0d0d0]">
              <Link to="/" className="transition hover:text-[#ffba00]">Home</Link>
              <span aria-hidden="true" className="text-white/40">/</span>
              <span className="text-white">Contact Us</span>
            </nav>

            <div className="hero-fade flex items-center gap-4" style={{ animationDelay: '0.2s' }}>
              <span className="h-px w-10 bg-[#ffba00]/70" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-[#ffba00]">We'd love to hear from you</span>
              <span className="h-px w-10 bg-[#ffba00]/70" aria-hidden="true" />
            </div>

            <h1 className="font-display mt-5 text-[3.8rem] font-black uppercase leading-none text-white sm:text-[5.6rem] md:text-[7rem]">
              <span className="hero-mask pb-2"><span style={{ '--d': '0.1s' }}>Contact us</span></span>
            </h1>

            <div className="hero-rule mt-5 h-[3px] bg-[#ffba00]" />

            <p className="hero-fade mt-6 max-w-[500px] text-base leading-relaxed text-[#d0d0d0]">
              Questions, feedback or a table for a big group? Send us a message and we will reply within a day.
            </p>

            <div className="hero-fade mt-9 flex flex-wrap justify-center gap-3">
              <a href={`tel:${PHONE.replace(/[^+\d]/g, '')}`} className="flex h-12 items-center gap-2 rounded-full bg-[#ffba00] px-7 font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_rgba(255,186,0,0.7)]">
                <LuPhone /> Call us
              </a>
              <a href={`mailto:${EMAIL}`} className="flex h-12 items-center gap-2 rounded-full border border-white/25 bg-black/30 px-7 font-semibold text-white backdrop-blur transition hover:border-[#ffba00] hover:text-[#ffba00]">
                <LuMail /> Email us
              </a>
              <button type="button" onClick={scrollToMap} className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-black/30 px-7 font-semibold text-white backdrop-blur transition hover:border-[#ffba00] hover:text-[#ffba00]">
                <LuMapPin /> Directions
              </button>
            </div>
          </div>
        </div>

        <div className="hero-fade absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3" aria-hidden="true">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">Scroll</span>
          <div className="scroll-cue" />
        </div>
      </section>

      <main>
        {/* ---------------- Info + form ---------------- */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b] shadow-[0_40px_120px_-50px_rgba(255,186,0,0.3)]">
              <div className="pointer-events-none absolute -left-24 -top-24 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(255,186,0,0.18),transparent_65%)]" aria-hidden="true" />

              <div className="grid lg:grid-cols-[1.05fr_1fr]">
                {/* Left: get closer */}
                <div className="relative overflow-hidden p-8 sm:p-12 lg:p-14">
                  <img
                    src="/burger4.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-12 -right-14 w-[280px] -rotate-[14deg] opacity-[0.13]"
                  />

                  <div className="relative">
                    <h2 className="font-display text-[3.2rem] font-extrabold uppercase leading-none text-white sm:text-[4.2rem]">
                      Get <span className="gold-text">closer</span>
                    </h2>
                    <div className="mt-5 h-[3px] w-[90px] bg-[#ffba00]" />
                    <p className="mt-6 max-w-[48ch] leading-[1.8] text-[#c0c0c0]">
                      Come by for a burger, call ahead for a large order, or write to us. Every message is read by a real person on our team.
                    </p>

                    <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                      {INFO.map(({ Icon, title, lines, href, external, badge }, i) => {
                        const body = (
                          <>
                            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[#ffba00]/30 bg-[#ffba00]/5 text-[2.1rem] text-[#ffba00] transition duration-300 group-hover:-rotate-6 group-hover:border-[#ffba00] group-hover:bg-[#ffba00] group-hover:text-black">
                              <Icon />
                            </span>
                            <span className="min-w-0">
                              <span className="font-display flex flex-wrap items-center gap-2 text-2xl font-extrabold uppercase text-white">
                                {title}
                                {badge && (
                                  <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold normal-case tracking-wide ${open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {open ? 'Open now' : 'Closed now'}
                                  </span>
                                )}
                              </span>
                              {lines.map((l) => (
                                <span key={l} className="block break-words text-sm text-[#a5a5a5]">{l}</span>
                              ))}
                            </span>
                          </>
                        );
                        const cls = 'group flex items-center gap-4 border-t border-white/10 pt-6';
                        return (
                          <Reveal key={title} delay={0.1 + i * 0.08}>
                            {href ? (
                              <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className={cls}>{body}</a>
                            ) : (
                              <div className={cls}>{body}</div>
                            )}
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: form */}
                <div className="relative border-t border-white/10 bg-[#101010] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
                  {status === 'sent' ? (
                    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center" role="status">
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ffba00] text-2xl text-black">
                        <FaCheck />
                      </div>
                      <h2 className="font-display mt-6 text-4xl font-extrabold uppercase text-white">Message sent</h2>
                      <p className="mt-3 max-w-[34ch] text-[#a5a5a5]">Thanks for reaching out. We will get back to you within a day.</p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-8 h-11 cursor-pointer rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-[#ffba00] hover:text-[#ffba00]"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} noValidate>
                      <h2 className="font-display text-[2.4rem] font-extrabold uppercase leading-none text-white sm:text-5xl">Your details</h2>
                      <p className="mb-8 mt-3 text-sm text-[#8a8a8a]">Fill in the form and we will answer within a day.</p>

                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <FloatField id="name" label="First Name" autoComplete="given-name" value={values.name} onChange={onChange} error={errors.name} />
                        <FloatField id="email" label="Email Address" type="email" autoComplete="email" value={values.email} onChange={onChange} error={errors.email} />
                      </div>
                      <FloatField id="subject" label="Subject" value={values.subject} onChange={onChange} error={errors.subject} />
                      <FloatField id="message" as="textarea" rows="5" maxLength={600} label="Comments / Questions" value={values.message} onChange={onChange} error={errors.message} hint={`${values.message.length}/600`} />

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="group mt-3 flex h-14 w-full cursor-pointer items-center justify-between rounded-xl bg-[#ffba00] pl-7 pr-2 font-bold text-black transition hover:shadow-[0_14px_40px_-12px_rgba(255,186,0,0.8)] disabled:cursor-wait disabled:opacity-70"
                      >
                        <span>{status === 'sending' ? 'Sending...' : 'Submit Message'}</span>
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-black text-lg text-[#ffba00] transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                          <LuSend />
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---------------- Map ---------------- */}
        <section ref={mapRef} className="mx-auto max-w-6xl px-6 pb-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <iframe
                className="h-[360px] w-full sm:h-[460px]"
                style={{ filter: 'invert(92%) hue-rotate(180deg) saturate(0.7) contrast(0.95)' }}
                loading="lazy"
                src="https://maps.google.com/maps?q=jalan%20pantai%20kuta&t=m&z=16&output=embed&iwloc=near"
                title="Burgry location, Jalan Pantai Kuta"
                allowFullScreen
              />
              <div className="absolute left-4 top-4 hidden max-w-[260px] rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-md md:block">
                <p className="text-xs uppercase tracking-[0.25em] text-[#ffba00]">Visit us</p>
                <p className="mt-2 text-sm text-white">{ADDRESS_LINE_1}<br />{ADDRESS_LINE_2}</p>
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#ffba00] transition hover:text-white">
                  Get directions <FaArrowRight className="text-xs" />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <div className="mt-24">
        <SiteFooter />
      </div>
    </div>
  );
};

export default Contact;