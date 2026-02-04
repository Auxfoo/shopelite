import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            // API returns { users, page, pages, total }
            setUsers(data.users || data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            setUsers(users.map(u =>
                u._id === userId ? { ...u, role: newRole } : u
            ));
            toast.success('User role updated');
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="page-title">Users</h1>
                <span className="user-count">{users.length} total users</span>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>
                                        {user.role === 'admin' && <FiShield />} {user.role}
                                    </span>
                                </td>
                                <td className="date-cell">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <select
                                            className="role-select"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDelete(user._id)}
                                            title="Delete User"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagement;
