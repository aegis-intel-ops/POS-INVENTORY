import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaLock } from 'react-icons/fa';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { token, logout } = useAuth();
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwords.old,
                    new_password: passwords.new
                })
            });

            if (res.ok) {
                alert('Password changed successfully! Please login again.');
                onClose();
                logout(); // Logout for security
            } else {
                const data = await res.json();
                alert(data.detail || 'Failed to change password');
            }
        } catch (error) {
            console.error(error);
            alert('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    ✕
                </button>

                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <FaLock className="mr-2 text-primary" /> Change Password
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={passwords.old}
                            onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
