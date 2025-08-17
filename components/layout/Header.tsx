
import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { MenuIcon, UserCircleIcon } from '../icons/IconComponents';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
    const location = useLocation();
    const currentLink = NAV_LINKS.find(link => link.href === location.pathname);
    const pageTitle = currentLink ? currentLink.name : 'Dashboard';

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                 <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white ml-4 lg:ml-0">{pageTitle}</h1>
            </div>
            <div className="flex items-center">
                <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500">
                    <UserCircleIcon className="h-8 w-8" />
                </button>
            </div>
        </header>
    );
};

export default Header;
