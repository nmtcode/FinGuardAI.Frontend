import React from "react";
import {
  LayoutDashboard,
  FileText,
  Bot,
  BookOpen,
  History,
  BarChart3,
  ShieldCheck,
  Cpu,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navItems = [
    { label: "لوحة التحكم", icon: LayoutDashboard },
    { label: "الطلبات المالية", icon: FileText },
    { label: "تحليل AI", icon: Bot, isSmart: true },
   
  ];

  return (
    <aside
      className={`fixed right-0 top-0 bottom-0 z-40 w-64 bg-gradient-to-b from-[#0a2e3b] to-[#07212b] text-white transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-6 pb-6 border-b border-teal-800/40 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-teal-300" strokeWidth={2.5} />
        <h2 className="text-xl font-black tracking-tight">FinGuard AI</h2>
      </div>

      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              key={idx}
              href="#"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                idx === 0
                  ? "bg-teal-600 shadow-lg"
                  : "text-teal-100/70 hover:bg-teal-800/40"
              }`}
            >
              <Icon size={18} />
              <span className="font-bold text-sm">{item.label}</span>
              {item.isSmart && (
                <span className="mr-auto bg-teal-500/20 text-teal-300 text-[9px] px-2 py-0.5 rounded-md border border-teal-500/30">
                  AI
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="absolute bottom-8 w-full flex justify-center items-center gap-2 text-teal-200/20 text-[10px] font-bold uppercase tracking-widest">
        <Cpu size={14} /> <span>RAG Engine v2.4</span>
      </div>
    </aside>
  );
};

export default Sidebar;
