import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaTimes, FaCalculator, FaCheckCircle } from 'react-icons/fa';

interface CashPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirm: (amountTendered: number, changeDue: number) => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({ isOpen, onClose, totalAmount, onConfirm }) => {
    const [tendered, setTendered] = useState<string>('');
    const [change, setChange] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTendered('');
            setChange(0);
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const tenderedFloat = parseFloat(tendered);
        if (!isNaN(tenderedFloat)) {
            const changeVal = tenderedFloat - totalAmount;
            setChange(changeVal);
            if (changeVal < 0) {
                setError('Insufficient amount');
            } else {
                setError('');
            }
        } else {
            setChange(0);
        }
    }, [tendered, totalAmount]);

    const handleQuickAdd = (amount: number) => {
        const current = parseFloat(tendered) || 0;
        setTendered((current + amount).toString());
    };

    const handleExact = () => {
        setTendered(totalAmount.toString());
    };

    const handleSubmit = () => {
        const tenderedFloat = parseFloat(tendered);
        if (isNaN(tenderedFloat) || tenderedFloat < totalAmount) {
            setError('Insufficient amount');
            return;
        }
        setSuccess(true);
        setTimeout(() => {
            onConfirm(tenderedFloat, change);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in">
                <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaMoneyBillWave /> Cash Payment
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-5xl mb-4 shadow-inner">
                                <FaCheckCircle />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Payment Complete</h3>
                            <p className="text-gray-500 mt-2">Change: ₵{change.toFixed(2)}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Total Due</p>
                                <p className="text-4xl font-extrabold text-gray-900">₵{totalAmount.toFixed(2)}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount Tendered</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tendered}
                                        onChange={e => setTendered(e.target.value)}
                                        className={`w-full p-4 border-2 rounded-xl focus:outline-none text-2xl font-mono text-center ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-green-500'}`}
                                        placeholder="0.00"
                                        step="0.01"
                                        autoFocus
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₵</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={handleExact} className="col-span-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">Exact</button>
                                <button onClick={() => handleQuickAdd(10)} className="col-span-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+10</button>
                                <button onClick={() => handleQuickAdd(20)} className="col-span-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+20</button>
                                <button onClick={() => handleQuickAdd(50)} className="col-span-1 py-2 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+50</button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                                <span className="font-bold text-gray-600">Change Due</span>
                                <span className={`text-2xl font-bold ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    ₵{change.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!!error || !tendered}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                            >
                                Complete Payment
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashPaymentModal;
