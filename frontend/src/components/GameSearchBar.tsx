import {useState, useEffect} from "react";
import {useAuth} from '../contexts/AuthContext.tsx'
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";


interface Game {
    app_id: number;
    name: string;
    current_price: number | null;
    currency: string;
    discount_percent: number;
    is_free: boolean;
    in_database: boolean;
    image?: string;
}

export const GameSearch = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const {token, user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeoutId = setTimeout(async() =>
        {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/search_games?query=${encodeURIComponent(query)}&limit=8`);
                const data = await response.json();
                setResults(data.results || []);
            } catch (error) {
                console.error(`Search failed:`, error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);


    const trackGame = async (appId: number) => {
        if (!token || !user){
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/track-price/${appId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message || 'Game added to tracking!');

                setQuery(query + ' ');
                setQuery(query.trim());
            } else {
                const error = await response.json();
                if (response.status === 400) {
                    toast('You are already tracking this game!');
                } else {
                    toast.error(error.detail || 'Failed to track game');
                }
            }

        } catch (error) {
            toast.error(`Failed to track game: ${error}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for games..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
        </div>
            {results.length > 0 && (
                <div className="mt-4 space-y-3">
                    {results.map((game) => (
                        <div key={game.app_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-transparent shadow-sm">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold dark:text-gray-200 text-gray-900">{game.name}</h3>
                                    {game.in_database ? (
                                        <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded">In database</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs text-blue-500 bg-blue-100 rounded">From Steam</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-300">
                                    {game.is_free ? (
                                        <span className="text-green-600">Free</span>
                                        ) : game.current_price !== null ? (
                                            <div className="flex items-center gap-2">
                                            {game.discount_percent > 0 ? (
                                                <>
                                                <span className="text-gray-500 dark:text-gray-400 line-through">
                                                    {(game.current_price / (1 - game.discount_percent / 100)).toFixed(2)} {game.currency}
                                                </span>
                                                    <span className="text-blue-500 font-semibold">
                                                        {game.current_price} {game.currency}
                                                    </span>
                                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                        -{game.discount_percent}%
                                                    </span>
                                                </>
                                                ) : (
                                                    <span>
                                                        {game.current_price} {game.currency}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Price not available</span>
                                        )}
                            </div>
                            </div>

                            <button onClick={() => trackGame(game.app_id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                {token ? 'Track Price' : 'Login to Track'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {query.length >= 2 && !loading && results.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
            No games found. Try searching for specific games titles!
        </div>
    )}
        </div>

    )
}