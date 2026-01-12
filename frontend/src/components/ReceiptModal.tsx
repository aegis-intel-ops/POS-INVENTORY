import React, { useRef } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import { type OrderItem } from '../db/db';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetails: {
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
    } | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, orderDetails }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !orderDetails) return null;

    const handlePrint = () => {
        const printContent = receiptRef.current?.innerHTML;
        const printWindow = window.open('', '_blank');
        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt - GhanaPOS</title>
                        <style>
                            body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
                            .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                            .receipt-items { margin: 10px 0; }
                            .receipt-item { display: flex; justify-content: space-between; padding: 2px 0; }
                            .receipt-taxes { border-top: 1px dashed #000; padding-top: 10px; font-size: 12px; }
                            .receipt-total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; }
                            .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
                        </style>
                    </head>
                    <body>${printContent}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Receipt</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Receipt Content */}
                <div ref={receiptRef} className="p-6 font-mono text-sm">
                    <div className="receipt-header text-center border-b border-dashed border-gray-400 pb-4 mb-4">
                        <h3 className="text-lg font-bold">GhanaPOS</h3>
                        <p className="text-xs text-gray-500">Restaurant Receipt</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {orderDetails.createdAt.toLocaleDateString()} {orderDetails.createdAt.toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="receipt-items space-y-1 mb-4">
                        {orderDetails.items.map((item, idx) => (
                            <div key={idx} className="receipt-item flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                                <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="receipt-taxes border-t border-dashed border-gray-400 pt-2 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₵{orderDetails.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>NHIL (2.5%):</span>
                            <span>₵{orderDetails.nhil.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>GETFund (2.5%):</span>
                            <span>₵{orderDetails.getfund.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>COVID (1%):</span>
                            <span>₵{orderDetails.covid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT (15%):</span>
                            <span>₵{orderDetails.vat.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="receipt-total border-t-2 border-gray-800 mt-2 pt-2 flex justify-between font-bold text-lg">
                        <span>TOTAL:</span>
                        <span>₵{orderDetails.grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="receipt-footer text-center mt-4 text-xs text-gray-500">
                        <p>Payment: {orderDetails.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'}</p>
                        <p className="mt-2">Thank you for dining with us!</p>
                        <p>Visit again soon</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex space-x-2">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90"
                    >
                        <FaPrint /> <span>Print</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        <FaTimes /> <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
