import React, { useState } from "react";
import { Menu } from "lucide-react";
import Footer from "./HomeLayoutComponents/Footer";
import Header from "./HomeLayoutComponents/Header";
import Sidebar from "./HomeLayoutComponents/Sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="relative font-cairo bg-gray-50 min-h-screen text-right"
      dir="rtl"
    >
      {/* زر الموبايل */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-teal-700 text-white p-2.5 rounded-full shadow-lg md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* المكونات المفصولة */}
      <Sidebar isOpen={sidebarOpen} />

      <div className="md:mr-64 flex flex-col min-h-screen transition-all duration-300">
        <Header />

        <main className="flex-1 p-6 md:p-10">{children}</main>

        <Footer />
      </div>
    </div>
  );
};
