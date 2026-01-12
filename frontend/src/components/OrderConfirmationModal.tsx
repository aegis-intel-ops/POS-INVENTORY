import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes, FaReceipt } from 'react-icons/fa';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    success: boolean;
    total: number;
    paymentMethod: 'cash' | 'momo';
    onViewReceipt?: () => void;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
    isOpen,
    onClose,
    success,
    total,
    paymentMethod,
    onViewReceipt
}) => {
    // Auto-dismiss after 5 seconds on success (increased for receipt button)
    useEffect(() => {
        if (isOpen && success) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, success, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes size={20} />
                </button>

                <div className="text-center">
                    {success ? (
                        <>
                            <FaCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Order Placed Successfully!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Payment via <span className="font-semibold capitalize">{paymentMethod === 'momo' ? 'Mobile Money' : 'Cash'}</span>
                            </p>
                            <div className="bg-gray-100 rounded-xl p-4 mb-4">
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-3xl font-bold text-primary">₵{total.toFixed(2)}</p>
                            </div>

                            {onViewReceipt && (
                                <button
                                    onClick={onViewReceipt}
                                    className="flex items-center justify-center space-x-2 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 mb-3"
                                >
                                    <FaReceipt /> <span>View Receipt</span>
                                </button>
                            )}

                            <p className="text-sm text-gray-400">This modal will close automatically.</p>
                        </>
                    ) : (
                        <>
                            <FaTimesCircle className="mx-auto text-red-500 mb-4" size={64} />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Order Failed
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Something went wrong. Please try again.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationModal;
