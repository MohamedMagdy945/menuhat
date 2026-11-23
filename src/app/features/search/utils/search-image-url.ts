import { FILES_ORIGIN } from '../../../core/constants/files.constants';
import { environment } from '../../../core/environments/environment';

/**
 * Resolves a backend image path for search results.
 * `/UploadedFiles` and `/DefaultImages` are served from the file-server origin,
 * any other relative path from `environment.filesUrl` (never `apiUrl`).
 */
export function resolveSearchImageUrl(path: string | null, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/UploadedFiles') || clean.startsWith('/DefaultImages')) {
    return `${FILES_ORIGIN}${encodeURI(clean)}`;
  }
  return `${environment.filesUrl}${encodeURI(clean)}`;
}

/** `(error)` handler that swaps a broken image for the fallback once. */
export function useFallbackImage(event: Event, fallback: string): void {
  const img = event.target as HTMLImageElement;
  if (!img.src.endsWith(fallback)) {
    img.src = fallback;
  }
}
