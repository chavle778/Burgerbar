import React, { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.2) => {
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

export const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
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