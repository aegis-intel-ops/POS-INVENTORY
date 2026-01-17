import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaCheck, FaUtensils, FaBell } from 'react-icons/fa';

interface KitchenOrder {
    id: string;
    items_json: Array<{
        name: string;
        quantity: number;
        items?: any[]; // if combo
    }>;
    created_at: string;
    kitchen_status: 'pending' | 'preparing' | 'ready' | 'served';
    kitchen_notes?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const KitchenDisplay: React.FC = () => {
    const { token, user } = useAuth(); // Get user for role check
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [error, setError] = useState('');

    // Cashiers are in "Observation Mode" only
    const isReadOnly = user?.role === 'cashier';

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/kitchen/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setError('');
            } else {
                setError('Failed to fetch orders');
            }
        } catch (e) {
            console.error(e);
            setError('Connection error');
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_URL}/kitchen/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrders(); // Refresh immediately
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-red-100 border-red-300 text-red-800';
            case 'preparing': return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'ready': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const nextStatus = (current: string) => {
        if (current === 'pending') return 'preparing';
        if (current === 'preparing') return 'ready';
        if (current === 'ready') return 'served';
        return 'served';
    };

    const pendingOrders = orders.filter(o => o.kitchen_status !== 'ready');
    const readyOrders = orders.filter(o => o.kitchen_status === 'ready');

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <FaUtensils className="text-gray-600" />
                    <span>Kitchen Display System</span>
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 animate-pulse">
                        Auto-refreshing (10s)
                    </span>
                    <button
                        onClick={fetchOrders}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                    >
                        Refresh Now
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Active Column */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between bg-red-50 p-3 rounded-t-xl border-b border-red-100">
                        <h2 className="font-bold text-red-800 flex items-center">
                            <FaClock className="mr-2" /> Pending & Preparing ({pendingOrders.length})
                        </h2>
                    </div>
                    <div className="bg-white border rounded-b-xl p-4 flex-1 overflow-auto space-y-4 shadow-inner bg-gray-50">
                        {pendingOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onNext={() => updateStatus(order.id, nextStatus(order.kitchen_status))}
                                colorClass={getStatusColor(order.kitchen_status)}
                                readOnly={isReadOnly}
                            />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center text-gray-400 py-10">No pending orders. Time to clean!</div>
                        )}
                    </div>
                </div>

                {/* Ready Column */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-t-xl border-b border-green-100">
                        <h2 className="font-bold text-green-800 flex items-center">
                            <FaBell className="mr-2" /> Ready for Pickup ({readyOrders.length})
                        </h2>
                    </div>
                    <div className="bg-white border rounded-b-xl p-4 flex-1 overflow-auto space-y-4 shadow-inner bg-gray-50">
                        {readyOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onNext={() => updateStatus(order.id, 'served')}
                                colorClass="bg-green-50 border-green-200"
                                isReady
                                readOnly={isReadOnly}
                            />
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="text-center text-gray-400 py-10">No orders ready for pickup.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderCard = ({ order, onNext, colorClass, isReady, readOnly }: { order: KitchenOrder, onNext: () => void, colorClass: string, isReady?: boolean, readOnly?: boolean }) => {
    // Format items items_json can be array of items
    const items = order.items_json || [];

    // Time elapsed calculation (simple implementation)
    const elapsed = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);

    return (
        <div className={`border-l-4 rounded-r-lg shadow-sm p-4 ${colorClass} bg-white transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="font-mono font-bold text-lg">#{order.id.slice(-4)}</span>
                    <span className="text-xs text-gray-500 ml-2">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${order.kitchen_status === 'pending' ? 'bg-red-200 text-red-800' :
                        order.kitchen_status === 'preparing' ? 'bg-orange-200 text-orange-800' :
                            'bg-green-200 text-green-800'
                        }`}>
                        {order.kitchen_status}
                    </span>
                    <span className={`text-xs mt-1 font-semibold ${elapsed > 20 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>
                        {elapsed} min
                    </span>
                </div>
            </div>

            <div className="space-y-1 mb-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-800 border-b border-black/5 pb-1 last:border-0 text-sm">
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        <span className="flex-1">{item.name}</span>
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div className="mt-2 flex justify-end">
                    <button
                        onClick={onNext}
                        className="flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        {isReady ? (
                            <>
                                <FaCheck className="text-green-600" />
                                <span>Mark Served</span>
                            </>
                        ) : (
                            <>
                                <span>{order.kitchen_status === 'pending' ? 'Start Prep' : 'Mark Ready'}</span>
                                <span className="ml-1">→</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default KitchenDisplay;
