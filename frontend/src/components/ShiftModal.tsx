import React, { useState } from 'react';

interface ShiftModalProps {
    isOpen: boolean;
    mode: 'start' | 'end';
    onConfirm: (amount: number, notes?: string) => void;
    onCancel: () => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, mode, onConfirm, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(parseFloat(amount), notes);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {mode === 'start' ? 'Start Shift' : 'End Shift'}
                </h2>
                <p className="text-gray-500 mb-6 text-sm">
                    {mode === 'start'
                        ? 'Please count the cash drawer and enter the opening amount.'
                        : 'Please count the total cash in drawer before closing.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {mode === 'start' ? 'Opening Cash' : 'Closing Cash'} (₵)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₵</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 text-lg font-bold border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="0.00"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {mode === 'end' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none h-20"
                                placeholder="Any discrepancies or comments..."
                            />
                        </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                        {mode === 'end' && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`flex-1 py-3 px-4 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 font-bold transition-all
                                ${mode === 'start' ? 'w-full' : ''}
                            `}
                        >
                            {mode === 'start' ? 'Open Shift' : 'Close Shift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftModal;
