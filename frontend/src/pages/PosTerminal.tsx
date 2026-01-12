import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type OrderItem } from '../db/db';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import { calculateGhanaTax } from '../modules/TaxEngine';

const PosTerminal: React.FC = () => {
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const [cartItems, setCartItems] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [orderResult, setOrderResult] = useState<{
        success: boolean;
        total: number;
        paymentMethod: 'cash' | 'momo';
    } | null>(null);

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

            await db.orders.add({
                items: cartItems,
                totalAmount: tax.grandTotal,
                totalTax: tax.totalTax,
                status: 'completed',
                paymentMethod: method,
                createdAt: new Date(),
                synced: false
            });

            setCartItems([]);
            setOrderResult({ success: true, total: tax.grandTotal, paymentMethod: method });
            setShowModal(true);
        } catch (error) {
            console.error("Order Failed", error);
            setOrderResult({ success: false, total: 0, paymentMethod: method });
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setOrderResult(null);
    };

    return (
        <>
            <div className="flex h-full">
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
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    success={orderResult.success}
                    total={orderResult.total}
                    paymentMethod={orderResult.paymentMethod}
                />
            )}
        </>
    );
};

export default PosTerminal;
