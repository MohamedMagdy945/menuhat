import { environment } from '../../core/environments/environment';
import { FILES_ORIGIN } from '../../core/constants/files.constants';

/**
 * Resolves an image path returned by the backend into a loadable URL.
 * - absolute `http(s)` / `data:` URLs are returned as-is
 * - `/UploadedFiles/...` and `/DefaultImages/...` are served from the file-server origin
 * - any other relative path is served under `environment.filesUrl`
 */
export function resolveImageUrl(path: string | null | undefined, fallback = ''): string {
  if (!path) return fallback;
  if (/^(https?:|data:)/i.test(path)) return path;

  const clean = path.startsWith('/') ? path : `/${path}`;
  const base =
    clean.startsWith('/UploadedFiles') || clean.startsWith('/DefaultImages')
      ? FILES_ORIGIN
      : environment.filesUrl;

  return `${base}${encodeURI(clean)}`;
}
