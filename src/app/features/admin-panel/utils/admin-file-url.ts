import { FILES_ORIGIN } from '../../../core/constants/files.constants';
import { environment } from '../../../core/environments/environment';

/** Resolves a backend file path (logo, PDF, QR code) against the file server — never apiUrl. */
export function resolveAdminFileUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/UploadedFiles') || clean.startsWith('/DefaultImages')) {
    return `${FILES_ORIGIN}${encodeURI(clean)}`;
  }
  return `${environment.filesUrl}${encodeURI(clean)}`;
}
