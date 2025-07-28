import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

export default function Admin() {
    const [appId, setAppId] = useState('');
    const [loading, setLoading] = useState(false);
    const {token, user} = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    const addGame = async () => {
        if (!appId || !token){
            return
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/add-game/${appId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setAppId("");
            } else {
                toast.error(result.detail || 'Failed to add game');
            }
        } catch (error) {
            toast.error(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(result.message);
            } else {
                toast.error(result.detail || 'Failed to sync games');
            }
        } catch (error) {
            toast.error(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user){
        return (
            <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-darkblue">
                <Navbar/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-4">Access Denied</h1>
                        <p className="text-gray-600 dark:text-gray-400 m-4">Please log in to access the admin panel.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar/>
            <main className="flex-1 p-8 mx-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add Game to Database</h2>
                    <div className="flex gap-4 mb4">
                        <input
                            type="text"
                            placeholder="App ID"
                            value={appId}
                            onChange={(e) => setAppId(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white rounded-lg dark:bg-gray-700 focus:ring-2"
                    />
                        <button
                            onClick={addGame}
                            disabled={loading || !appId}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                            {loading ? 'Syncing...' : 'Add Game'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Sync Games</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Updates prices for all games in the database with current prices from Steam.
                    </p>
                    <button
                        onClick={triggerSync}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                        >
                        {loading ? 'Syncing...' : 'Sync Games'}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    )
}