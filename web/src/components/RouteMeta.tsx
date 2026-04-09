import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultPageMeta, routeMetaMap } from '../routeMeta';

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function RouteMeta() {
  const { pathname } = useLocation();
  const meta = routeMetaMap[pathname] ?? defaultPageMeta;

  useEffect(() => {
    document.title = meta.title;
    setMetaName('description', meta.description);
    setMetaProperty('og:title', meta.title);
    setMetaProperty('og:description', meta.description);
    setMetaProperty('og:type', 'website');
    setMetaName('twitter:card', 'summary');
    setMetaName('twitter:title', meta.title);
    setMetaName('twitter:description', meta.description);
  }, [pathname, meta.title, meta.description]);

  return null;
}
