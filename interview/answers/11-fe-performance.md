Title: Frontend Performance Optimization (React)

Measure first

- Core Web Vitals (LCP, INP, CLS), bundle size, route timings, user-centric RUM.

Build optimizations

- Code split by route and component; dynamic import; tree-shake; vendor chunking.
- Use modern bundlers (Vite/Next). Compress (brotli/gzip). HTTP/2/3 and CDN caching.

Assets

- Images: responsive, AVIF/WebP, lazy-load, preconnect/preload critical assets.
- Fonts: subset, font-display: swap; avoid layout shift.

React-specific

- Memoization: React.memo, useMemo, useCallback; avoid prop churn.
- Minimize re-renders: state colocated, selector-based state, virtualization (react-window).
- Avoid heavy synchronous work on main thread; offload to Web Workers.

Network

- Cache headers, ETags; client caching via React Query; parallelize critical requests.

Server-side

- Next.js SSR/SSG/ISR for SEO and TTFB improvements; edge caching.
