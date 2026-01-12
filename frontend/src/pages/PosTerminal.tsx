import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type OrderItem } from '../db/db';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import { calculateGhanaTax } from '../modules/TaxEngine';

const PosTerminal: React.FC = () => {
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const [cartItems, setCartItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Seed Dummy Data if empty
    useEffect(() => {
        const seedDatabase = async () => {
            const count = await db.products.count();
            if (count === 0) {
                await db.products.bulkAdd([
                    { name: 'Jollof Rice & Chicken', price: 45.00, category: 'Main', taxGroup: 'VAT_standard' },
                    { name: 'Waakye Special', price: 35.00, category: 'Main', taxGroup: 'VAT_standard' },
                    { name: 'Fried Rice & Fish', price: 40.00, category: 'Main', taxGroup: 'VAT_standard' },
                    { name: 'Banku & Tilapia', price: 55.00, category: 'Main', taxGroup: 'VAT_standard' },
                    { name: 'Sobolo (Bottle)', price: 5.00, category: 'Drinks', taxGroup: 'VAT_standard' },
                    { name: 'Mineral Water', price: 3.00, category: 'Drinks', taxGroup: 'VAT_standard' },
                ]);
            }
        };
        seedDatabase();
    }, []);

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
                taxAmount: 0 // Tax calculated at order time for now
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
        setLoading(true);
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
            alert('Order Placed Successfully! Mock receipt printed.');
        } catch (error) {
            console.error("Order Failed", error);
            alert('Order Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 overflow-auto p-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-4 mb-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <ProductGrid products={products} onAddToCart={handleAddToCart} />
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
    );
};

export default PosTerminal;
