import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  getRouteMeta,
} from './seoConfig';

const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const JSON_LD_ID = 'cc-route-jsonld';

const upsertJsonLd = (serialized) => {
  const existing = document.getElementById(JSON_LD_ID);
  if (!serialized) {
    if (existing) existing.remove();
    return;
  }
  const el = existing || document.createElement('script');
  if (!existing) {
    el.type = 'application/ld+json';
    el.id = JSON_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = serialized;
};

export const useSeo = (overrides = {}) => {
  const { pathname } = useLocation();
  const { title, description, image, noindex, canonicalPath, jsonLd } = overrides;
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const route = getRouteMeta(pathname);
    const resolvedTitle = title || route?.title || DEFAULT_TITLE;
    const resolvedDescription = description || route?.description || DEFAULT_DESCRIPTION;
    const resolvedImage = image || OG_IMAGE;
    const canonical = `${SITE_URL}${canonicalPath || pathname}`;
    const blocked = noindex === true || (noindex === undefined && route === null);

    document.title = resolvedTitle;

    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta(
      'name',
      'robots',
      blocked
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', resolvedImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);
    upsertMeta('name', 'twitter:image', resolvedImage);

    upsertJsonLd(serializedJsonLd);
  }, [pathname, title, description, image, noindex, canonicalPath, serializedJsonLd]);
};

export default useSeo;
