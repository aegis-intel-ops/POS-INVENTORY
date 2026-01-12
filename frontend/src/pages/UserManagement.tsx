import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaUserPlus, FaUserShield, FaUserTie } from 'react-icons/fa';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
}

const API_URL = 'http://localhost:8000';

const UserManagement: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'cashier',
        email: ''
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewUser({ username: '', password: '', role: 'cashier', email: '' });
                fetchUsers();
            } else {
                alert('Failed to create user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    <FaUserPlus />
                    <span>Add User</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">User</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-500">#{user.id}</td>
                                <td className="p-4 font-medium text-gray-800 flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.username}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role === 'admin' ? <FaUserShield className="mr-1" /> : <FaUserTie className="mr-1" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                        Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Delete User"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Add New User</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
                                    <option value="kitchen">Kitchen Staff</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
