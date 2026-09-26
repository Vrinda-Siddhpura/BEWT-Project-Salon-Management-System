import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  UserCheck,
  Clock,
  IndianRupee,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Receptionist', 'Barber'],
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: Users,
      roles: ['Administrator', 'Receptionist'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: Calendar,
      roles: ['Administrator', 'Receptionist', 'Barber'],
    },
    {
      name: 'Services',
      path: '/services',
      icon: Scissors,
      roles: ['Administrator'],
    },
    {
      name: 'Barbers',
      path: '/barbers',
      icon: UserCheck,
      roles: ['Administrator'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: Clock,
      roles: ['Administrator', 'Receptionist', 'Barber'],
    },
    {
      name: 'Wages & Payroll',
      path: '/wages',
      icon: IndianRupee,
      roles: ['Administrator', 'Barber'],
    },
    {
      name: 'Analytics Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['Administrator'],
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: User,
      roles: ['Administrator', 'Receptionist', 'Barber'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role));

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Receptionist':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Barber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white shadow-xl z-20">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-lg shadow-md text-slate-950">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">Velvet Salon</h1>
            <p className="text-xs text-slate-400">Management Suite</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold border border-slate-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Navbar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-md z-30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-lg">Velvet Salon</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white px-4 pt-2 pb-6 space-y-1 z-20 border-b border-slate-800 shadow-xl">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-slate-800 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Salon Management Portal</h2>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                user?.role
              )}`}
            >
              {user?.role}
            </span>

            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
