import React, { useContext, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import { assets } from '../../assets/assets'; // Assuming assets exist, otherwise I'll remove

const AdminLayout = () => {
    const { userData } = useContext(AppContext);
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/');
        }
        if (isLoaded && isSignedIn && userData && userData.role !== 'admin' && userData.email !== 'undhyani07@gmail.com') {
            navigate('/');
        }
    }, [isLoaded, isSignedIn, userData, navigate]);

    if (!isLoaded || !userData) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (userData.role !== 'admin' && userData.email !== 'undhyani07@gmail.com') {
        return null; // Will redirect
    }

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/recruiters', label: 'Recruiters' },
        { path: '/admin/jobs', label: 'Jobs' },
        { path: '/admin/applications', label: 'Applications' },
        { path: '/admin/analytics', label: 'Analytics' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <img src={userData.image} alt="Admin" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-medium">{userData.name}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">Admin</h1>
                    {/* Mobile menu toggle could go here */}
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
