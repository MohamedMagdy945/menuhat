/** One row of the admin category table (used for main and sub categories). */
export interface AdminCategoryTile {
  id: number;
  name: string | null;
  nameEn: string | null;
  photoUrl: string;
  order: number | null;
  /** Small line under the name (restaurant / main category). */
  subtitle: string | null;
  /** Material icon shown before the subtitle. */
  subtitleIcon: string;
  editLink: (string | number)[];
  /** When set, the name and an action button open this link (e.g. the sub categories of a main category). */
  openLink?: (string | number)[];
  openLabel?: string;
}
