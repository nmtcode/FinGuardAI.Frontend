import React from 'react';
import type { StatCardProps } from '../types/StatCardProps';

export const StatCard: React.FC<StatCardProps> = ({ 
  title, value, trend, icon, borderColor, iconBg, iconColor 
}) => (
  <div className={`
    group stat-card-elegant bg-white rounded-2xl p-5 shadow-md border border-gray-100 border-r-4 ${borderColor}
    transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 cursor-pointer
  `}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
        {trend && <p className="text-xs mt-2" dangerouslySetInnerHTML={{ __html: trend }} />}
      </div>
      <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        <i className={`${icon} ${iconColor} text-2xl`}></i>
      </div>
    </div>
  </div>
);