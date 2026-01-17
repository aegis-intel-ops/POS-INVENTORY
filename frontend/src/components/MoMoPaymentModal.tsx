import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaRedo, FaTimes, FaQrcode } from 'react-icons/fa';

interface MoMoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MoMoPaymentModal: React.FC<MoMoPaymentModalProps> = ({ isOpen, onClose, amount, onSuccess }) => {
    const [mode, setMode] = useState<'phone' | 'qr'>('phone');
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState('mtn');
    const [status, setStatus] = useState<'idle' | 'requesting' | 'pending' | 'success' | 'failed'>('idle');
    const [message, setMessage] = useState('');
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setPhone('');
            setStatus('idle');
            setMessage('');
            setTransactionId(null);
            setProvider('mtn');
            setMode('phone');
        }
    }, [isOpen]);

    // Poll for status when pending
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === 'pending' && transactionId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}/momo/status/${transactionId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'SUCCESS') {
                            setStatus('success');
                            setMessage('Payment Approved!');
                            setTimeout(() => {
                                onSuccess();
                                onClose();
                            }, 2000);
                        } else if (data.status === 'FAILED') {
                            setStatus('failed');
                            setMessage('Payment Declined or Failed.');
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [status, transactionId, onSuccess, onClose]);

    const handlePay = async (simulatedPhone?: string) => {
        const phoneToUse = simulatedPhone || phone;
        if (!phoneToUse && mode === 'phone') return;

        setStatus('requesting');
        setMessage('');

        try {
            const res = await fetch(`${API_URL}/momo/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [], // Simplified for mock
                    total_amount: amount,
                    phone: phoneToUse || '0240000000', // Default for QR scan
                    provider: provider
                })
            });

            if (res.ok) {
                const data = await res.json();
                setTransactionId(data.transaction_id);
                setStatus('pending');
                setMessage(data.message);
            } else {
                setStatus('failed');
                setMessage('Failed to initiate payment.');
            }
        } catch (e) {
            setStatus('failed');
            setMessage('Network error.');
        }
    };

    const handleRetry = () => {
        setStatus('idle');
        setMessage('');
        setTransactionId(null);
    };

    const getProviderStyle = (p: string) => {
        switch (p) {
            case 'mtn': return provider === 'mtn' ? 'bg-[#ffcc00] border-[#ffcc00] text-black' : 'border-gray-200 text-gray-500 hover:border-[#ffcc00]';
            case 'vodafone': return provider === 'vodafone' ? 'bg-[#e60000] border-[#e60000] text-white' : 'border-gray-200 text-gray-500 hover:border-[#e60000]';
            case 'airteltigo': return provider === 'airteltigo' ? 'bg-[#0033aa] border-[#0033aa] text-white' : 'border-gray-200 text-gray-500 hover:border-[#0033aa]';
            default: return 'border-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FaMobileAlt className="text-yellow-400" /> Mobile Money
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setMode('phone')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mode === 'phone' ? 'text-gray-900 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FaMobileAlt /> Number
                    </button>
                    <button
                        onClick={() => setMode('qr')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mode === 'qr' ? 'text-gray-900 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FaQrcode /> Scan QR
                    </button>
                </div>

                <div className="p-6">
                    {/* Amount Display */}
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Amount</p>
                        <p className="text-4xl font-extrabold text-gray-900 mt-1">₵{amount.toFixed(2)}</p>
                    </div>

                    {status === 'idle' || status === 'requesting' || status === 'failed' ? (
                        <>
                            {mode === 'phone' ? (
                                <div className="space-y-5">
                                    {/* Provider Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Provider</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['mtn', 'vodafone', 'airteltigo'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setProvider(p)}
                                                    className={`py-3 px-1 rounded-lg border-2 text-sm font-bold transition-all duration-200 capitalize ${getProviderStyle(p)}`}
                                                >
                                                    {p === 'airteltigo' ? 'AT' : p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phone Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="024 XXX XXXX"
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 focus:outline-none text-xl font-mono tracking-widest text-center transition-all"
                                            />
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                <FaMobileAlt />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handlePay()}
                                        disabled={status === 'requesting' || !phone}
                                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all transform active:scale-95 shadow-lg"
                                    >
                                        {status === 'requesting' ? <FaSpinner className="animate-spin text-xl" /> : 'Request Payment'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center animate-fade-in">
                                    <div className="bg-white p-4 border-2 border-gray-900 rounded-xl inline-block shadow-lg">
                                        {/* Simulated QR Code Pattern */}
                                        <div className="w-48 h-48 bg-gray-900 relative flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover"></div>
                                            <div className="z-10 bg-white p-2 rounded-lg">
                                                <span className="font-bold text-lg">SCAN ME</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-sm">Scan with any MoMo app to pay <br />or dial *170#</p>

                                    <button
                                        onClick={() => handlePay('0555555555')}
                                        className="w-full py-3 bg-yellow-100 text-yellow-800 rounded-lg font-bold hover:bg-yellow-200 flex items-center justify-center gap-2"
                                    >
                                        <FaQrcode /> Simulate "Scan & Pay"
                                    </button>
                                </div>
                            )}

                            {/* Error Message */}
                            {status === 'failed' && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 animate-pulse mt-4">
                                    <FaTimesCircle className="text-xl shrink-0" />
                                    <span>{message}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-6 text-center space-y-6">
                            {status === 'pending' ? (
                                <>
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FaMobileAlt className="text-3xl text-gray-400 animate-bounce" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Check your phone</h3>
                                        <p className="text-gray-500 text-sm px-4">Processing payment...</p>
                                    </div>

                                    {transactionId && (
                                        <div className="bg-gray-50 py-2 px-4 rounded-lg inline-block border border-gray-100">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">Transaction ID</p>
                                            <p className="font-mono text-sm text-gray-600 select-all">{transactionId.split('-')[0]}...</p>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button
                                            onClick={handleRetry}
                                            className="text-gray-400 text-sm hover:text-red-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                                        >
                                            <FaTimesCircle /> Cancel Transaction
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-bounce-in">
                                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-5xl mb-4 shadow-inner">
                                        <FaCheckCircle />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                                    <p className="text-gray-500 mt-2">Printing receipt...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
                }
                @keyframes fade-in {
                   from { opacity: 0; transform: translateY(10px); }
                   to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MoMoPaymentModal;
