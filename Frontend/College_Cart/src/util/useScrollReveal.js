import { useEffect, useRef } from 'react';

export const useScrollReveal = ({ threshold = 0.12, rootMargin = '0px 0px -60px 0px', stagger = 70 } = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      root.querySelectorAll('.cc-reveal').forEach((el) => el.classList.add('cc-revealed'));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry, index) => {
            entry.target.style.transitionDelay = `${index * stagger}ms`;
            entry.target.classList.add('cc-revealed');
            obs.unobserve(entry.target);
          });
      },
      { threshold, rootMargin }
    );

    const observe = (el) => {
      if (el.dataset.ccRevealBound) return;
      el.dataset.ccRevealBound = '1';
      io.observe(el);
    };

    const scan = () => root.querySelectorAll('.cc-reveal').forEach(observe);
    scan();

    const mo = new MutationObserver((records) => {
      let added = false;
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (node.nodeType !== 1) continue;
          added = true;
          break;
        }
        if (added) break;
      }
      if (added) scan();
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [threshold, rootMargin, stagger]);

  return containerRef;
};

export default useScrollReveal;
