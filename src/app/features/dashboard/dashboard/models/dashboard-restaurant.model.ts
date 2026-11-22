export interface DashboardRestaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  isVisible: boolean;
  profileUrl: string;
  coverUrl: string;
  pdfUrl: string;
  qrCodeUrl: string | null;
  visitsCount: number;
  backgroundColor?: string | null;
  bgColor?: string | null;
}
