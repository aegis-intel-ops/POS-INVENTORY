import React, { useState, useEffect } from 'react';
import { FaTimes, FaBan, FaCheck, FaHistory } from 'react-icons/fa';
import { db, type Order } from '../db/db';
import { useAuth } from '../context/AuthContext';

interface OrderHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadOrders();
        }
    }, [isOpen, refreshTrigger]);

    const loadOrders = async () => {
        const result = await db.orders.orderBy('createdAt').reverse().limit(50).toArray();
        setOrders(result);
    };

    const handleVoid = async (orderId: number, createdAt: Date) => {
        const now = new Date();
        const diffMinutes = (now.getTime() - new Date(createdAt).getTime()) / 1000 / 60;

        let canVoid = false;

        // Rule: 0-5 mins (Cashier), >5 mins (Admin only)
        if (diffMinutes <= 5) {
            canVoid = true;
        } else if (diffMinutes > 5 && user?.role === 'admin') {
            canVoid = true;
        } else {
            alert("Cancellation window expired. Manager approval required.");
            return;
        }

        // Hard lockout after 10 mins for everyone (optional per user request, but usually Admin can override)
        // User request: "administrator can void a transaction after it has been sent to kitchen for more than 10 minnutes" 
        // implies Admin CAN void after 10 mins.

        if (canVoid && confirm('Are you sure you want to VOID this order?')) {
            await db.orders.update(orderId, { status: 'void', synced: false }); // synced: false will trigger backend update if we impl sync logic
            // Note: For MVP mock, we just update local status. Backend sync should pick this up.
            setRefreshTrigger(prev => prev + 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaHistory /> Transaction History
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm">Ref #</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm">Time</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm">Total</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm">Payment</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm">Status</th>
                                <th className="p-4 border-b font-medium text-gray-500 text-sm text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => {
                                const timeDiff = (new Date().getTime() - new Date(order.createdAt).getTime()) / 1000 / 60;
                                const isVoidable =
                                    order.status !== 'void' &&
                                    (timeDiff <= 5 || user?.role === 'admin');

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-bold text-gray-700">
                                            {order.referenceNumber || '-'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">
                                            ₵{order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-sm capitalize">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'momo' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {order.status === 'void' ? (
                                                <span className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase">
                                                    <FaBan /> Voided
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-green-500 font-bold text-xs uppercase">
                                                    <FaCheck /> Completed
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {order.status !== 'void' && (
                                                <button
                                                    onClick={() => order.id && handleVoid(order.id, order.createdAt)}
                                                    disabled={!isVoidable}
                                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${isVoidable
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    Void
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-10 text-center text-gray-400">
                            No recent transactions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryModal;
