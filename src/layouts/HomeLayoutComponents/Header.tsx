import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 md:px-8 py-3 flex justify-between items-center shadow-sm">
      {/* الجزء الأيسر (العنوان + البحث) */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-full">
            <i className="fas fa-robot text-teal-700 text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">لوحة التحكم الرئيسية</h1>
           
          </div>
        </div>
        {/* شريط البحث */}
        <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-5 py-2 gap-2 w-72 transition focus-within:ring-2 focus-within:ring-teal-300">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن طلب، سياسة، أو تقرير..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* الجزء الأيمن (الإشعارات + الملف الشخصي) */}
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer group">
          <Bell size={22} className="text-gray-500 group-hover:text-teal-600 transition" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
            3
          </span>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-200 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            أ
          </div>
          <span className="font-semibold text-gray-700 hidden md:inline">المسؤول المالي</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;