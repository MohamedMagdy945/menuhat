/**
 * Upload body (PhotoClientsMenuDto). `base64String` must be a full data URL
 * (`data:image/png;base64,...`) — raw base64 is accepted with 200 but stores an empty path.
 */
export interface AdminMenuFilePayload {
  base64String: string;
}
