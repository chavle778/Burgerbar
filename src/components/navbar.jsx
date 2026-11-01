import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoClose } from 'react-icons/io5';
import './About.css';

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

      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#FFBA00]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
};

export default Navbar;