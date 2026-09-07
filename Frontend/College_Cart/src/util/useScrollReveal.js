import { useEffect, useRef } from 'react';

/**
 * Reveals elements as they scroll into view.
 *
 * Attach the returned ref to any container; every descendant carrying the
 * `cc-reveal` class gets `cc-revealed` added once it enters the viewport, which
 * drives the opacity/transform transition declared in index.css.
 *
 * Uses one IntersectionObserver per container rather than a scroll listener, so
 * nothing runs on the main thread between intersections, and unobserves each
 * element once it lands so the work is strictly one-shot.
 *
 * A MutationObserver runs alongside it because most of these containers are
 * populated asynchronously: the product grids render skeletons first and swap
 * in real cards when the fetch resolves. Observing only the elements present at
 * mount left everything that arrived later stuck at opacity 0 - the cards were
 * in the DOM and simply never became visible. New `.cc-reveal` nodes are picked
 * up as they are inserted.
 *
 * @param {{ threshold?: number, rootMargin?: string, stagger?: number }} options
 *   stagger - ms added per element in a batch, for a cascade rather than a snap.
 */
export const useScrollReveal = ({ threshold = 0.12, rootMargin = '0px 0px -60px 0px', stagger = 70 } = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Respect the OS setting and skip the machinery entirely; index.css already
    // renders .cc-reveal in its final state under reduced motion. Same fallback
    // if the browser lacks IntersectionObserver - show everything rather than
    // hiding it forever.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      root.querySelectorAll('.cc-reveal').forEach((el) => el.classList.add('cc-revealed'));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        // Order the batch by document position so a stagger cascades downward
        // rather than in whatever order the callback happens to deliver.
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

    // Catch content that arrives after mount (fetched cards, expanded lists).
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
