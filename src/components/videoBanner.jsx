import React, { useRef, useState } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { Reveal } from './Reveal';
import './About.css';

const VideoBanner = ({ title, text }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
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

  return (
    <section className="relative h-[80vh] min-h-[460px] w-full overflow-hidden">
      <video ref={videoRef} autoPlay loop muted playsInline className="h-full w-full object-cover">
        <source src="/vid.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-10 bg-black/60" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[#ffba00] text-black transition hover:scale-110"
        >
          {playing && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[#ffba00] opacity-30" aria-hidden="true" />
          )}
          {playing ? <FaPause className="relative text-2xl" /> : <FaPlay className="relative ml-1 text-2xl" />}
        </button>
        <Reveal>
          <h2 className="font-display mt-8 text-5xl font-black uppercase text-white md:text-7xl">{title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-6 h-[3px] w-24 bg-[#ffba00]" />
          <p className="mx-auto mt-6 max-w-[560px] text-base leading-relaxed text-[#d4d4d4]">{text}</p>
        </Reveal>
      </div>
    </section>
  );
};

export default VideoBanner;