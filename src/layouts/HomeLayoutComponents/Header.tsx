import React from "react";
import { Search, PlusCircle, Bell, ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4 flex justify-between items-center">
      <div className="hidden lg:flex items-center bg-gray-100/80 rounded-2xl px-5 py-2.5 gap-3 w-80 border border-transparent focus-within:border-teal-200 focus-within:bg-white transition-all">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="bg-transparent outline-none text-sm w-full font-medium"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="hidden md:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black shadow-lg shadow-teal-600/20 transition-all">
          <PlusCircle size={18} />
          <span>طلب جديد</span>
        </button>

        <div className="relative cursor-pointer group">
          <Bell
            size={22}
            className="text-gray-400 group-hover:text-teal-600 transition-colors"
          />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
            3
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-3 py-1.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center text-white text-sm font-black shadow-sm">
            أ
          </div>
          <div className="hidden md:block">
            <p className="font-black text-gray-800 text-xs">أحمد المنصوري</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
              Compliance Chief
            </p>
          </div>
          <ChevronDown size={14} className="text-gray-300 mr-1" />
        </div>
      </div>
    </header>
  );
};

export default Header;
