import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position on navigation.
 *
 * A client-side route change does not scroll the window, so moving from
 * halfway down the product list to a detail page used to open that page
 * already scrolled past its own header. Several screens patched around this
 * with a local `window.scrollTo(0, 0)` effect; doing it once here covers every
 * route, including the lazily loaded ones.
 *
 * `behavior: 'instant'` is deliberate: index.css sets `scroll-behavior: smooth`
 * globally for anchor jumps, which would otherwise make each navigation animate
 * a long scroll back to the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
