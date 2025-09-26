import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import Navbar from '../components/Navbar.tsx';
import toast from "react-hot-toast";
import Footer from '../components/Footer.tsx';
import {Bell, Trash2, Plus, Target, TrendingDown} from "lucide-react";

interface Alert {
    id: number;
    alert_type: string;
    target_value: number;
    is_active: boolean;
    created_at: string;
    triggered_at: string | null;
    games: {
        name: string;
        app_id: number;
        last_known_price: number | null;
        discount_percent: number;
        currency: string;
    };
}

interface CreateAlertModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface TrackedGame {
    app_id: number;
    games: {
        name: string;
        last_known_price: number | null;
        currency: string;
        discount_percent: number;
        is_free: boolean;
    };
}

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const {token, user} = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!token || !user) {
            navigate('/login');
            return;
        }
    }, [token, user, navigate, loading]);

    useEffect(() => {
        const fetchAlerts = async () => {
            if (!token || !user) {
                return;
            }
            try {
                const response = await fetch(`${API_URL}/alerts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAlerts(data.alerts);
                } else {
                    toast.error('Failed to fetch alerts');
                }
            } catch (error) {
                toast.error(`Error fetching alerts: ${error}`);
            } finally {
                setLoading(false);
            }
        };
        void fetchAlerts();

    }, [token, user, API_URL]);


    const deleteAlert = async (alertId: number) => {
        try {
            const response = await fetch(`${API_URL}/alerts/${alertId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setAlerts(alerts => alerts.filter(alert => alert.id !== alertId));
                toast.success('Alert deleted successfully!');
            } else {
                toast.error('Failed to delete alert');
            }
        } catch (error) {
            console.error(`Error deleting alert: ${error}`);
            toast.error('Error deleting alert');
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Bell className="h-8 w-8 text-blue-500" />
                    Price Alerts
                </h1>
                    <div>
                    <h2 className=" text-gray-800 dark:text-white mb-4 text-center">
                            Manage your price alerts here.
                    </h2>
                    <p className="text-smtext-gray-600 dark:text-gray-400 mt-6">
                        Note: Price alerts are sent to the email assocated with your account.
                    </p>
                    </div>
                <button onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="h-4 w-4" />
                    Create Alert
                </button>
            </div>
            {alerts.length === 0 ? (
                <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2>No alerts yet</h2>
                <p>Create your first price alert</p>
            </div>
            ) : (
                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {alert.alert_type === 'percentage_discount' ?
                                        <Target className="h-5 w-5 text-blue-500" /> :
                                        <TrendingDown className="h-5 w-5 text-green-500" />
                                    }
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                            {alert.games.name}
                                        </h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span className="font-medium">
                                                {alert.alert_type === 'percentage_discount' ? 'Percentage Discount' : 'Price Drop'}
                                            </span>
                                            {alert.alert_type === 'percentage_discount' && (
                                                <span> • Target: {alert.target_value}% off</span>
                                            )}
                                            {alert.alert_type === 'price_drop' && (
                                                <span> • Target: ${alert.target_value.toFixed(2)} drop</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Current: {alert.games.last_known_price ? `$${alert.games.last_known_price.toFixed(2)} ${alert.games.currency}` : 'Free'}
                                            </span>
                                            {alert.games.discount_percent > 0 && (
                                                <span className="text-green-500 dark:text-green-400 font-medium">
                                                    {alert.games.discount_percent}% off
                                                </span>
                                            )}
                                            {alert.triggered_at && (
                                                <span className="text-blue-500 dark:text-blue-400 font-medium">
                                                    ✓ Triggered
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete Alert">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>

            {showCreateForm && (
                <CreateAlertModal
                onClose={() => setShowCreateForm(false)}
                onSuccess={() => {setShowCreateForm(false)}}
                />
            )}
            <Footer />
        </div>

    );
}

function CreateAlertModal({onClose, onSuccess}: CreateAlertModalProps): React.ReactElement {
    const [selectedGame, setSelectedGame] = useState('');
    const [alertType, setAlertType] = useState('percentage_discount');
    const [targetValue, setTargetValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackedGames, setTrackedGames] = useState<TrackedGame[]>([]);
    const [fetchingGames, setFetchingGames] = useState(true);
    const {token} = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTrackedGames = async () => {
            if (!token) {
                return;
            }
            try {
                const response = await fetch(`${API_URL}/tracked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTrackedGames(data);
                } else {
                    toast.error('Failed to fetch tracked games');
                }
            } catch (error) {
                toast.error(`Error fetching tracked games: ${error}`);
            } finally {
                setFetchingGames(false);
            }
        };
        void fetchTrackedGames();
    }, [token, API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGame || !targetValue || !token) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    app_id: parseInt(selectedGame),
                    alert_type: alertType,
                    target_value: parseFloat(targetValue),
                })
            });
            if (response.ok) {
                toast.success('Alert created successfully!');
                onSuccess();
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Failed to create alert');
            }
        } catch (error) {
            toast.error(`Error creating alert: ${error}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Create Price Alert
                </h2>
                {fetchingGames ? (
                    <div className="text-center py-4">
                        <div
                            className="animate-spin h-8 w-8 border-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading tracked games...</p>
                    </div>
                ) : trackedGames.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            You don't have any tracked games! Start tracking games by searching for them on the
                            search page.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Go to Dashboard
                        </button>
                    </div>

                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Game
                            </label>
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                required
                            >
                                <option value="">Choose a game...</option>
                                {trackedGames.map((game) => (
                                    <option key={game.app_id} value={game.app_id}>{game.games.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Alert Type
                            </label>
                            <select
                                value={alertType}
                                onChange={(e) => setAlertType(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                                <option value="percentage_discount">Percentage Discount</option>
                                <option value="price_drop">Price Drop</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {alertType === 'percentage_discount' ? 'Discount Percentage (%)' : 'Price Drop Amount ($)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                placeholder={alertType === 'percentage_discount' ? 'e.g. 25 for 25% off' : 'e.g. 10.00'}
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-500 disabled:bg-blue-300 text-white rounded hover:bg-blue-600 transition-colors">
                                {loading ? 'Creating...' : 'Create Alert'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}