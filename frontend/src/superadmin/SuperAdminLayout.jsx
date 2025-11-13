import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building, Upload, Users, UserCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const SuperAdminLayout = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/superadmin/departments', label: 'Departments', icon: Building },
        { path: '/superadmin/bulk-upload', label: 'Bulk Upload', icon: Upload },
        { path: '/superadmin/students', label: 'Students', icon: Users },
        { path: '/superadmin/teachers', label: 'Teachers', icon: UserCheck },
    ];

    return (
        <div className="superadmin-layout">
            <style>
                {`
                .superadmin-layout {
                    min-height: 100vh;
                    background: linear-gradient(145deg, #f8f8ff 0%, #e0e7ff 100%);
                    font-family: 'Inter', sans-serif;
                }

                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 280px;
                    height: 100vh;
                    background-color: #ffffff;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    border-right: 1px solid #e5e7eb;
                    z-index: 40;
                    transform: translateX(0);
                    transition: transform 0.3s ease;
                }

                .sidebar.closed {
                    transform: translateX(-100%);
                }

                .sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                }

                .sidebar-title {
                    font-size: 20px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .sidebar-title svg {
                    margin-right: 12px;
                }

                .sidebar-subtitle {
                    font-size: 12px;
                    opacity: 0.9;
                }

                .sidebar-menu {
                    padding: 16px 0;
                }

                .menu-item {
                    margin: 0 8px;
                }

                .menu-link {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: #374151;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .menu-link:hover {
                    background-color: #f3f4f6;
                    color: #4f46e5;
                }

                .menu-link.active {
                    background-color: #eef2ff;
                    color: #4f46e5;
                    font-weight: 600;
                }

                .menu-link svg {
                    margin-right: 12px;
                    width: 20px;
                    height: 20px;
                }

                .main-content {
                    margin-left: 280px;
                    padding: 32px 16px;
                    transition: margin-left 0.3s ease;
                }

                .mobile-menu-btn {
                    display: none;
                    position: fixed;
                    top: 16px;
                    left: 16px;
                    z-index: 50;
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 30;
                }

                .overlay.show {
                    display: block;
                }

                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .main-content {
                        margin-left: 0;
                    }

                    .mobile-menu-btn {
                        display: block;
                    }

                    .overlay.show {
                        display: block;
                    }
                }
                `}
            </style>

            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={20} />
            </button>

            {/* Overlay for mobile */}
            <div
                className={`overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-title">
                        <UserCheck size={24} />
                        Super Admin
                    </h1>
                    <p className="sidebar-subtitle">Management Dashboard</p>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <div key={item.path} className="menu-item">
                                <Link
                                    to={item.path}
                                    className={`menu-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default SuperAdminLayout;
