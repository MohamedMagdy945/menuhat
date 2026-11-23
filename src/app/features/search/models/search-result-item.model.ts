export interface SearchResultItem {
  id: number;
  title: string;
  subtitle: string;
  /** Raw backend image path (resolved against the file server in the UI). */
  imagePath: string | null;
  fallbackImage: string;
  price: number | null;
  link: (string | number)[];
}
