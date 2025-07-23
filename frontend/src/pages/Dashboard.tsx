import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.tsx";
import Navbar from "../components/Navbar.tsx";
import toast from 'react-hot-toast'

interface TrackedGamesProps {
    app_id: number;
    games: {
        name: string;
        last_known_price: number | null;
        currency: string;
        discount_percent: number;
        is_free: boolean;
    };
}

export default function Dashboard() {
    const [trackedGames, setTrackedGames] = useState<TrackedGamesProps[]>([]);
    const {token, user} = useAuth();
    const [loading, setLoading] = useState(true);
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
        const fetchTrackedGames = async () => {
            if (!token || !user) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/tracked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTrackedGames(data);
                }
            } catch (error) {
                toast.error(`Failed to fetch tracked games: ${error}`)
            } finally {
                setLoading(false);
            }
        };

        fetchTrackedGames();

    }, [token]);

    const handleDeleteGames = async (appId: number, gameName: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-medium">Stop tracking "{gameName}"?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id)
                            performDelete(appId);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Yes, Remove
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: "top-center"
        });
    };

    const performDelete = async (appId: number) => {
      try {
          const response = await fetch(`${API_URL}/untrack/${appId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          if (response.ok) {
              setTrackedGames(games => games.filter(game => game.app_id !== appId));
              toast.success('Game removed from watchlist!');
          }
      } catch (error) {
          toast.error(`Failed to remove game: ${error}`);
      }
  };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-darkblue">
                <Navbar/>
                <div className="flex justify-center items-center h-64">
                    <div
                        className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );

    }
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar/>
            <main className="p-8 mx-auto container">
                <h1 className="text-xl font-extrabold mb-4 text-gray-900 dark:text-gray-100 text-center">
                    Your Tracked Games
                </h1>
                {trackedGames.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                            No games tracked yet!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Start tracking games by searching for them on the search page.
                        </p>
                        <button
                            onClick={() => navigate('/search')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Find Games to Track
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 sm:grid-cols-1 lg:grid-cols-3">
                        {trackedGames.map((game) => (
                            <div key={game.app_id}
                                 className="p-6 border-gray-200 dark:bg-gray-800 rounded-lg bg-white shadow-md">
                                <img
                                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.app_id}/header.jpg`}
                                    alt={game.games.name}
                                    className="w-full h-32 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{game.games.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    App ID: {game.app_id}
                                </p>
                                <p>
                                    Current Price: {game.games.last_known_price !== null && game.games.last_known_price !== undefined ? (
                                        <span>
                                            {game.games.last_known_price} {game.games.currency}
                                            {game.games.discount_percent > 0 && (
                                                <span className="ml-2 text-red-600">-{game.games.discount_percent}%</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Price not available</span>
                                    )
                                    }
                                </p>
                                <button
                                    onClick={() => handleDeleteGames(game.app_id, game.games.name)}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    Remove From Watchlist
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}