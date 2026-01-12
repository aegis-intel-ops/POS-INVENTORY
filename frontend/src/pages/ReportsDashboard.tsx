import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../context/AuthContext';
import { FaMoneyBillWave, FaCreditCard, FaReceipt, FaChartPie } from 'react-icons/fa';

const ReportsDashboard: React.FC = () => {
    const orders = useLiveQuery(() => db.orders.toArray(), []) || [];

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });

    const todaysSales = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todaysTax = todaysOrders.reduce((sum, order) => sum + order.totalTax, 0);

    // Payment method breakdown
    const cashOrders = orders.filter(o => o.paymentMethod === 'cash');
    const momoOrders = orders.filter(o => o.paymentMethod === 'momo');
    const cashTotal = cashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const momoTotal = momoOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSales = cashTotal + momoTotal;

    const cashPercent = totalSales > 0 ? Math.round((cashTotal / totalSales) * 100) : 0;
    const momoPercent = totalSales > 0 ? Math.round((momoTotal / totalSales) * 100) : 0;

    const [activeTab, setActiveTab] = React.useState<'sales' | 'shifts'>('sales');
    const { token } = useAuth();
    const [shifts, setShifts] = React.useState<any[]>([]);
    const [isLoadingShifts, setIsLoadingShifts] = React.useState(false);

    React.useEffect(() => {
        if (activeTab === 'shifts') {
            const fetchShifts = async () => {
                setIsLoadingShifts(true);
                try {
                    const response = await fetch('http://localhost:8000/shifts/history', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setShifts(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch shifts', error);
                } finally {
                    setIsLoadingShifts(false);
                }
            };
            fetchShifts();
        }
    }, [activeTab, token]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sales' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sales Report
                    </button>
                    <button
                        onClick={() => setActiveTab('shifts')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'shifts' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Shift History
                    </button>
                </div>
            </div>

            {activeTab === 'sales' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<FaMoneyBillWave className="text-green-500" size={24} />}
                            label="Today's Sales"
                            value={`₵${todaysSales.toFixed(2)}`}
                            subtext={`${todaysOrders.length} orders`}
                        />
                        <StatCard
                            icon={<FaReceipt className="text-blue-500" size={24} />}
                            label="Today's Tax"
                            value={`₵${todaysTax.toFixed(2)}`}
                            subtext="Ghana taxes collected"
                        />
                        <StatCard
                            icon={<FaChartPie className="text-purple-500" size={24} />}
                            label="Total Orders"
                            value={orders.length.toString()}
                            subtext="All time"
                        />
                        <StatCard
                            icon={<FaCreditCard className="text-yellow-500" size={24} />}
                            label="Total Revenue"
                            value={`₵${totalSales.toFixed(2)}`}
                            subtext="All time"
                        />
                    </div>

                    {/* Payment Method Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment Method Breakdown</h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Cash</span>
                                    <span className="text-sm font-medium">{cashPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all"
                                        style={{ width: `${cashPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">₵{cashTotal.toFixed(2)} ({cashOrders.length} orders)</p>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Mobile Money</span>
                                    <span className="text-sm font-medium">{momoPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-yellow-500 h-3 rounded-full transition-all"
                                        style={{ width: `${momoPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">₵{momoTotal.toFixed(2)} ({momoOrders.length} orders)</p>
                            </div>
                        </div>
                    </div>

                    {/* Order History Table */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Order History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.slice().reverse().slice(0, 20).map((order, idx) => (
                                        <tr key={order.id || idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.items.map(i => i.name).join(', ').substring(0, 30)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${order.paymentMethod === 'cash'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.paymentMethod === 'cash' ? 'Cash' : 'MoMo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₵{order.totalTax.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ₵{order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${order.synced
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {order.synced ? 'Synced' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                                No orders yet. Start selling!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Shift History</h2>
                        <button
                            onClick={() => setActiveTab('shifts')} // basic refresh
                            className="text-sm text-primary hover:underline"
                        >
                            Refresh
                        </button>
                    </div>
                    {isLoadingShifts ? (
                        <div className="p-8 text-center text-gray-500">Loading shifts...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ended</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening Cash</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing Cash</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {shifts.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{shift.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {/* Backend returns user_id, need to fetch username? Or backend includes user object? */}
                                                {/* Backend query: db.query(models.Shift).all()... Model has 'user' relationship */}
                                                {/* Check if response schema includes user details. Typically assumes user_id. */}
                                                User #{shift.user_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(shift.start_time).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {shift.end_time ? new Date(shift.end_time).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₵{shift.opening_cash?.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {shift.closing_cash !== undefined && shift.closing_cash !== null ? `₵${shift.closing_cash.toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${shift.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {shift.is_active ? 'Active' : 'Closed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {shift.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {shifts.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                                                No shift history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{subtext}</p>
            </div>
        </div>
    </div>
);

export default ReportsDashboard;
