
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl text-primary-500">
            {icon}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Card;
