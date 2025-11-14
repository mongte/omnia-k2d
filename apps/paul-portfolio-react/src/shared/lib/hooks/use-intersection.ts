'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersection(options: UseIntersectionOptions = {}) {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entry]) => setEntry(entry), observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, threshold, root, rootMargin, frozen]);

  return [setNode, entry] as const;
}
