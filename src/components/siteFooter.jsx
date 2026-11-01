import React, { useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { MdOutlineEmail } from 'react-icons/md';
import { CiLocationOn } from 'react-icons/ci';
import { BiLogoTelegram } from 'react-icons/bi';
import { FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor } from 'react-icons/fa';
import './About.css';

const SiteFooter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | error | success

  const handleSubscribe = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setStatus(ok ? 'success' : 'error');
    if (ok) setEmail('');
  };

  return (
    <>
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
    </>
  );
};

export default SiteFooter;