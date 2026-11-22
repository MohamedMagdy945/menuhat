import { NavItem } from './nav-item.model';

export interface NavGroup {
  id: string;
  title: string;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  items: NavItem[];
}
