import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { FaStore, FaChartBar, FaSync, FaCog, FaSignOutAlt, FaClock, FaUsers } from 'react-icons/fa';
import ShiftModal from './ShiftModal';

const Layout: React.FC = () => {
    const { user, logout, activeShift, endShift } = useAuth();
    const navigate = useNavigate();
    const [showEndShiftModal, setShowEndShiftModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 bg-secondary text-white flex flex-col items-center lg:items-start p-4 space-y-8 flex-shrink-0">
                <div className="text-primary font-bold text-2xl lg:text-3xl tracking-tighter">
                    <span className="hidden lg:inline">GhanaPOS</span>
                    <span className="lg:hidden">GP</span>
                </div>

                <nav className="flex-1 w-full space-y-2">
                    <NavItem to="/" icon={<FaStore />} label="Terminal" />
                    {user?.role === 'admin' && (
                        <>
                            <NavItem to="/reports" icon={<FaChartBar />} label="Reports" />
                            <NavItem to="/settings" icon={<FaCog />} label="Products" />
                            <NavItem to="/users" icon={<FaUsers />} label="Users" />
                        </>
                    )}
                </nav>

                <div className="mt-auto w-full space-y-4">
                    {activeShift && (
                        <button
                            onClick={() => setShowEndShiftModal(true)}
                            className="w-full flex items-center justify-center lg:justify-start space-x-3 p-3 rounded-lg text-yellow-400 hover:bg-white/10 hover:text-yellow-300 transition-colors"
                        >
                            <span className="text-xl"><FaClock /></span>
                            <span className="hidden lg:inline font-medium">End Shift</span>
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center lg:justify-start space-x-3 p-3 rounded-lg text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                    >
                        <span className="text-xl"><FaSignOutAlt /></span>
                        <span className="hidden lg:inline font-medium">Sign Out</span>
                    </button>

                    <div className="flex items-center justify-center lg:justify-start space-x-2 p-2 rounded hover:bg-white/10 cursor-pointer">
                        <FaSync className="text-gray-400" />
                        <span className="hidden lg:inline text-sm text-gray-300">Sync Active</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <h1 className="text-xl font-semibold">Point of Sale</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-800">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>

            <ShiftModal
                isOpen={showEndShiftModal}
                mode="end"
                onConfirm={async (amount, notes) => {
                    await endShift(amount, notes);
                    setShowEndShiftModal(false);
                    navigate('/login'); // Force re-login after shift close? Or just stay? Usually re-login.
                }}
                onCancel={() => setShowEndShiftModal(false)}
            />
        </div>
    );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => (
    <Link to={to} className={clsx(
        "flex items-center justify-center lg:justify-start space-x-3 p-3 rounded-lg transition-colors",
        active ? "bg-primary text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
    )}>
        <span className="text-xl">{icon}</span>
        <span className="hidden lg:inline font-medium">{label}</span>
    </Link>
);

export default Layout;
