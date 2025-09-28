import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    const [amount, setAmount] = useState<number>(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDonation = async () => {
        if (!amount || amount < 1) {
            setError('Please enter a valid amount');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/create-donation-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({amount: Math.round(amount * 100), currency: 'usd'})
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();
            window.location.href = data.checkout_url;
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create checkout session');
            setLoading(false);

        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Support SteamPriceTracker</h2>
                    <button onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Donation Amount (USD)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min="1"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700
  dark:border-gray-600 dark:text-white"
                        placeholder="Enter amount"
                    />
                </div>

                {error && (
                    <div className="mb-4 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleDonation}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    {loading ? 'Processing...' : `Donate $${amount}`}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Secure payment powered by Stripe
                </p>
            </div>
        </div>
    );
}
