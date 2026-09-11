/**
 * Per-route SEO head manager (Req 7.2, 7.5).
 *
 * Relies on React 19's native support for hoisting <title>, <meta>, and <link>
 * elements to <head> when rendered anywhere in the component tree — so no head
 * manager dependency (react-helmet et al.) is required.
 *
 * Each public page renders <Seo .../> with its own title/description. Open Graph
 * and Twitter tags are derived from the same values, with per-page overrides for
 * the canonical URL, image, and og:type (e.g. "article" for project details,
 * Req 7.5).
 */

const SITE_NAME = 'Swastik Buildcons';
const DEFAULT_IMAGE = '/favicon.png';
const BASE_URL = 'https://swastikbuildcons.com';

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = path ? absoluteUrl(path) : BASE_URL;
  const ogImage = absoluteUrl(image);

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}
