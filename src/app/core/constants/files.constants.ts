import { environment } from '../environments/environment';

/**
 * Origin of the file server (e.g. `http://192.168.1.150:500`), derived from `environment.filesUrl`.
 * Backend paths that already start with `/UploadedFiles` or `/DefaultImages` are served from this
 * origin; every other relative image path is served under `environment.filesUrl`.
 * Never derive image hosts from `environment.apiUrl`.
 */
export const FILES_ORIGIN = new URL(environment.filesUrl).origin;
