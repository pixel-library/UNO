import { useEffect } from 'react';

/**
 * Custom React hook that sets up an IntersectionObserver to observe
 * elements with `.scroll-3d-reveal`, `.scroll-3d-card`, or `.scroll-3d-scale` classes,
 * adding `.is-visible` whenever they scroll into view.
 */
export const useScroll3D = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('.scroll-3d-reveal, .scroll-3d-card, .scroll-3d-scale');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
};
