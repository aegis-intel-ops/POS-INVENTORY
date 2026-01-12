import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type OrderItem } from '../db/db';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import ReceiptModal from '../components/ReceiptModal';
import ShiftModal from '../components/ShiftModal';
import { useAuth } from '../context/AuthContext';
import { calculateGhanaTax } from '../modules/TaxEngine';
import { SyncService } from '../services/SyncService';

interface OrderDetails {
    items: OrderItem[];
    subtotal: number;
    nhil: number;
    getfund: number;
    covid: number;
    vat: number;
    totalTax: number;
    grandTotal: number;
    paymentMethod: 'cash' | 'momo';
    createdAt: Date;
}

const PosTerminal: React.FC = () => {
    const { activeShift, startShift } = useAuth();
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const [cartItems, setCartItems] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [orderResult, setOrderResult] = useState<{
        success: boolean;
        total: number;
        paymentMethod: 'cash' | 'momo';
    } | null>(null);
    const [lastOrderDetails, setLastOrderDetails] = useState<OrderDetails | null>(null);

    // Filter products based on search query
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, {
                productId: product.id!,
                name: product.name,
                price: product.price,
                quantity: 1,
                taxAmount: 0
            }];
        });
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const item = newItems[index];
            item.quantity += delta;
            if (item.quantity <= 0) {
                return newItems.filter((_, i) => i !== index);
            }
            return newItems;
        });
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const handlePlaceOrder = async (method: 'cash' | 'momo') => {
        try {
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = calculateGhanaTax(subtotal);
            const createdAt = new Date();

            await db.orders.add({
                items: cartItems,
                totalAmount: tax.grandTotal,
                totalTax: tax.totalTax,
                status: 'completed',
                paymentMethod: method,
                createdAt,
                synced: false
            });

            // Trigger immediate sync for Kitchen Display
            SyncService.syncOrders().catch(console.error);

            // Store order details for receipt
            setLastOrderDetails({
                items: [...cartItems],
                subtotal,
                nhil: tax.nhil,
                getfund: tax.getfund,
                covid: tax.covid,
                vat: tax.vat,
                totalTax: tax.totalTax,
                grandTotal: tax.grandTotal,
                paymentMethod: method,
                createdAt
            });

            setCartItems([]);
            setOrderResult({ success: true, total: tax.grandTotal, paymentMethod: method });
            setShowConfirmModal(true);
        } catch (error) {
            console.error("Order Failed", error);
            setOrderResult({ success: false, total: 0, paymentMethod: method });
            setShowConfirmModal(true);
        }
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setOrderResult(null);
    };

    const handleViewReceipt = () => {
        setShowConfirmModal(false);
        setShowReceiptModal(true);
    };

    return (
        <>
            {/* Shift Enforcement */}
            {!activeShift && (
                <div className="absolute inset-0 z-50 bg-gray-100/50 backdrop-blur-sm">
                    <ShiftModal
                        isOpen={true}
                        mode="start"
                        onConfirm={async (amount) => {
                            await startShift(amount);
                        }}
                        onCancel={() => { }} // Cannot cancel starting a shift to access POS
                    />
                </div>
            )}

            <div className={`flex h-full ${!activeShift ? 'filter blur-sm pointer-events-none' : ''}`}>
                <div className="flex-1 overflow-auto p-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 mb-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                    <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
                </div>
                <div className="w-96 flex-shrink-0">
                    <Cart
                        items={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onPlaceOrder={handlePlaceOrder}
                    />
                </div>
            </div>

            {orderResult && (
                <OrderConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={handleCloseConfirmModal}
                    success={orderResult.success}
                    total={orderResult.total}
                    paymentMethod={orderResult.paymentMethod}
                    onViewReceipt={handleViewReceipt}
                />
            )}

            <ReceiptModal
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                orderDetails={lastOrderDetails}
            />
        </>
    );
};

export default PosTerminal;
