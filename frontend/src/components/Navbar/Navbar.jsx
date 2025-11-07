import React from "react";
import { Menu, Bell, User } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200 flex justify-between items-center px-6 py-3">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Chai Shorts Admin</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <button className="relative text-gray-600 hover:text-blue-600">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full"></span>
        </button>
        <div className="flex items-center justify-center w-9 h-9 bg-gray-200 rounded-full text-gray-600">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
