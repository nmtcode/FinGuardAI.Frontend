
import React from 'react';
import type { StatCardProps } from '../types/StatCardProps';


export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, borderColor, iconBg, iconColor }) => (
  <div className={`stat-card-elegant bg-white rounded-2xl p-5 shadow-md border-r-4 ${borderColor}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
        {trend && <p className="text-xs mt-2" dangerouslySetInnerHTML={{ __html: trend }} />}
      </div>
      <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
        <i className={`${icon} ${iconColor} text-2xl`}></i>
      </div>
    </div>
  </div>
);