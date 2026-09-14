// Post-build cleanup: remove any stale `_redirects` from dist.
//
// The Cloudflare Worker serves this SPA and handles client-side routing via
// wrangler.jsonc (`not_found_handling: "single-page-application"`). A `_redirects`
// file is the WRONG mechanism for a Worker and causes `wrangler deploy` to fail
// with "Infinite loop detected" (code 100324). Cloudflare's build output cache
// has, at times, reintroduced an old `_redirects`, so we defensively delete it
// on every build regardless of where it came from.
import { rmSync, existsSync } from 'node:fs';

const target = 'dist/_redirects';
if (existsSync(target)) {
  rmSync(target, { force: true });
  console.log('postbuild: removed stale dist/_redirects');
} else {
  console.log('postbuild: no dist/_redirects present (ok)');
}
