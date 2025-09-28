import React, {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {useAuth} from '../contexts/AuthContext';
import {X} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
const API_URL = import.meta.env.VITE_API_URL;
interface DonationFormProps {
    onClose: () => void;
}

const DonationForm = ({ onClose }: DonationFormProps) => {
    const stripe = useStripe();
    const {user} = useAuth();
    const elements = useElements();
    const [amount, setAmount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const {darkMode} = useTheme();

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: darkMode ? '#ffffff' : '#424770',
                backgroundColor: 'transparent',
                '::placeholder': {
                    color: darkMode ? '#9ca3af' : '#aab7c4',
                },
            },
        },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return;

        setLoading(true);
        setMessage('')

        try {
            const response = await fetch(`${API_URL}/create-donation-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: amount * 100
                })
            });

                if (!response.ok) {
                    throw new Error('Failed to create donation intent');
                }

                const { client_secret } = await response.json();
                const cardElement = elements.getElement(CardElement);

                const result = await stripe.confirmCardPayment(client_secret, {
                    payment_method: {
                        card: cardElement!,
                        billing_details: {
                            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous',
                            email: user?.email || undefined,
                        }
                    }
                });

                if (result.error) {
                    setMessage(result.error.message || "Payment failed");
                } else {
                    setSuccess(true);
                    setMessage('Thank you for your donation! 🎉');
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                }
            } catch (error) {
            console.error('Donation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
            setMessage(errorMessage);
        }

        setLoading(false);
    };

    return (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Support the site!
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Help us keep the site running by making a donation!
                </p>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Donation Amount:
                            </label>
                            <select
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full p-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value={3}>$3</option>
                                <option value={5}>$5</option>
                                <option value={10}>$10</option>
                                <option value={20}>$20</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Card Details:
                            </label>
                            <div className="rounded-md p-3 bg-white dark:bg-gray-700">
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!stripe || loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Processing...' : `Donate $${amount}`}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-2">
                        <div className="text-4xl mb-2">🎉</div>
                        <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                            Thank you!
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your donation helps us keep SteamPriceTracker running.
                        </p>
                    </div>
                )}
                {message && !success && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                            {message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
    if (!isOpen) return null;

    return (
        <Elements stripe={stripePromise}>
            <DonationForm onClose={onClose} />
        </Elements>
    );
};

export default DonationModal;