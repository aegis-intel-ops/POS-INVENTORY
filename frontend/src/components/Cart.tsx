import React, { useState } from 'react';
import { FaTrash, FaMinus, FaPlus, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { type OrderItem } from '../db/db';
import { calculateGhanaTax } from '../modules/TaxEngine';
import CashPaymentModal from './CashPaymentModal';
import MoMoPaymentModal from './MoMoPaymentModal';

interface CartProps {
    items: OrderItem[];
    onUpdateQuantity: (index: number, delta: number) => void;
    onRemoveItem: (index: number) => void;
    onPlaceOrder: (method: 'cash' | 'momo', details?: { amountTendered?: number, changeDue?: number, referenceNumber?: string }) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemoveItem, onPlaceOrder }) => {
    const [showMoMoModal, setShowMoMoModal] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxBreakdown = calculateGhanaTax(subtotal);

    const generateReferenceNumber = () => {
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
    };

    const handlePaymentClick = (method: 'cash' | 'momo') => {
        if (method === 'momo') {
            setShowMoMoModal(true);
        } else if (method === 'cash') {
            setShowCashModal(true);
        }
    };

    const handleCashConfirm = (amountTendered: number, changeDue: number) => {
        const refNum = generateReferenceNumber();
        onPlaceOrder('cash', { amountTendered, changeDue, referenceNumber: refNum });
    };

    return (
        <div className="flex flex-col h-full bg-white border-l shadow-xl w-full lg:w-96">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold">Current Order</h2>
                <span className="text-sm text-gray-500">{items.length} items</span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <span className="text-4xl mb-2">🛒</span>
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">₵{item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => onUpdateQuantity(index, -1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">
                                    <FaMinus size={10} />
                                </button>
                                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(index, 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">
                                    <FaPlus size={10} />
                                </button>
                            </div>
                            <div className="ml-4 text-right">
                                <div className="text-sm font-bold">₵{(item.price * item.quantity).toFixed(2)}</div>
                                <button onClick={() => onRemoveItem(index)} className="text-red-400 hover:text-red-600 mt-1">
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                    <span>NHIL (2.5%)</span>
                    <span>₵{taxBreakdown.nhil.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                    <span>GETFund (2.5%)</span>
                    <span>₵{taxBreakdown.getfund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                    <span>COVID (1%)</span>
                    <span>₵{taxBreakdown.covid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs font-medium">
                    <span>VAT (15%)</span>
                    <span>₵{taxBreakdown.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₵{taxBreakdown.grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
                <button
                    onClick={() => handlePaymentClick('cash')}
                    disabled={items.length === 0}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaMoneyBillWave /> <span>Cash</span>
                </button>
                <button
                    onClick={() => handlePaymentClick('momo')}
                    disabled={items.length === 0}
                    className="flex items-center justify-center space-x-2 bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaCreditCard /> <span>MoMo</span>
                </button>
            </div>

            <MoMoPaymentModal
                isOpen={showMoMoModal}
                onClose={() => setShowMoMoModal(false)}
                amount={taxBreakdown.grandTotal}
                onSuccess={() => {
                    const refNum = generateReferenceNumber();
                    onPlaceOrder('momo', { referenceNumber: refNum });
                }}
            />

            <CashPaymentModal
                isOpen={showCashModal}
                onClose={() => setShowCashModal(false)}
                totalAmount={taxBreakdown.grandTotal}
                onConfirm={handleCashConfirm}
            />
        </div>
    );
};

export default Cart;
