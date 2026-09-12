import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget (spam protection for the contact form).
 *
 * Renders nothing unless VITE_TURNSTILE_SITE_KEY is set, so local dev and any
 * environment without Turnstile configured just skip it. Loads the Turnstile
 * script once, renders the widget, and reports the token via onVerify.
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export default function Turnstile({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return undefined;

    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      if (!window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerify?.(token),
        'error-callback': () => onVerify?.(''),
        'expired-callback': () => onVerify?.(''),
      });
    }

    // Load the script once, then render.
    if (window.turnstile) {
      render();
    } else if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      // Script tag exists but may not be ready yet; poll briefly.
      const timer = setInterval(() => {
        if (window.turnstile) {
          clearInterval(timer);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [onVerify]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="mt-2" />;
}
