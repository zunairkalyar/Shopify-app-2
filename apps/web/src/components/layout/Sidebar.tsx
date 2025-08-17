
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { ZapIcon } from '../icons/IconComponents';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    
    const navLinkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
    const activeClass = "bg-primary-500 text-white shadow-lg";
    const inactiveClass = "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800";

    return (
        <>
            {/* Mobile overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            ></div>

            <aside className={`fixed lg:static inset-y-0 left-0 flex-shrink-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-col z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                     <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                        <ZapIcon className="w-8 h-8"/>
                        <span className="text-2xl font-bold">OrderAlert</span>
                    </div>
                </div>
                <nav className="mt-6 px-4">
                    {NAV_LINKS.map(link => (
                        <NavLink
                            key={link.name}
                            to={link.href}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
