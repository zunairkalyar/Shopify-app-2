
import { HomeIcon, ShoppingCartIcon, MessageSquareIcon, FileTextIcon, SettingsIcon, StoreIcon, GitBranchIcon } from './components/icons/IconComponents';

export const NAV_LINKS = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Messages', href: '/messages', icon: MessageSquareIcon },
  { name: 'Webhooks', href: '/webhooks', icon: GitBranchIcon },
  { name: 'Templates', href: '/templates', icon: FileTextIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
  { name: 'Connect Store', href: '/connect-store', icon: StoreIcon },
];
