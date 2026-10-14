import React, { useEffect, useState } from 'react';

export const ReadingProgressBar = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setScrollPercentage(percentage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(scrollPercentage)}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className="h-full bg-theme-accent transition-all duration-150 ease-out"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
};
