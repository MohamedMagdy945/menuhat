import { FILES_ORIGIN } from '../../../core/constants/files.constants';
import { environment } from '../../../core/environments/environment';

/** Resolves a backend image path (logos, product photos) against the file server. */
export function resolveOrderImageUrl(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/UploadedFiles') || clean.startsWith('/DefaultImages')) {
    return `${FILES_ORIGIN}${encodeURI(clean)}`;
  }
  return `${environment.filesUrl}${encodeURI(clean)}`;
}
