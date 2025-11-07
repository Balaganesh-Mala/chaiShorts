import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  Film,
  Video,
  Folder,
  Users,
  Heart,
  Library,
  Bell,
  Settings,
  X,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <>
      {/* Overlay for Mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
          <button className="md:hidden" onClick={onClose}>
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 space-y-1 px-3">
          <NavLink to="/" className={linkClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/songs" className={linkClass}>
            <Music size={18} /> Songs
          </NavLink>
          <NavLink to="/movies" className={linkClass}>
            <Film size={18} /> Movies
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            <Folder size={18} /> Categories
          </NavLink>
          <NavLink to="/videos" className={linkClass}>
            <Video size={18} /> Short Videos
          </NavLink>
          <NavLink to="/users" className={linkClass}>
            <Users size={18} /> Users
          </NavLink>
          <NavLink to="/libraries" className={linkClass}>
            <Library size={18} /> Libraries
          </NavLink>
          <NavLink to="/favorites" className={linkClass}>
            <Heart size={18} /> Favorites
          </NavLink>
          <NavLink to="/notifications" className={linkClass}>
            <Bell size={18} /> Notifications
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 w-full px-3">
          <button className="flex items-center gap-3 w-full text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-lg font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
