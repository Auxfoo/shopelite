import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    const navItems = [
        { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
        { to: '/admin/products', icon: FiPackage, label: 'Products' },
        { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
        { to: '/admin/users', icon: FiUsers, label: 'Users' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <button
                        className="back-to-store"
                        onClick={() => navigate('/')}
                    >
                        <FiArrowLeft /> Back to Store
                    </button>
                </div>
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
