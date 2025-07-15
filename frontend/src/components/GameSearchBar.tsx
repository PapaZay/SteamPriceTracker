import {useState, useEffect} from "react";
import {useAuth} from '../contexts/AuthContext.tsx'

interface Game {
    app_id: number;
    name: string;
    current_price: number | null;
    currency: string;
    discount_percent: number;
    is_free: boolean;
}

export const GameSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const {token} = useAuth();

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeoutId = setTimeout(async() =>
        {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/search_games?query=${encodeURIComponent(query)}&limit=8`);
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
        try {
            const response = await fetch(`http://localhost:8000/track-price/${appId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Game added to tracking!');

                setQuery(query + ' ');
                setQuery(query.trim());
            }

        } catch (error) {
            console.error('Failed to track game:', error);
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div key={game.app_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{game.name}</h3>
                                <div className="text-sm text-gray-600">
                                    {game.is_free ? (
                                        <span className="text-green-600">Free</span>
                                        ) : game.current_price ? (
                                            <span>
                                                {game.current_price} {game.currency}
                                                {game.discount_percent > 0 && (
                                                    <span className="ml-2 text-red-600">-{game.discount_percent}%</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Price not available</span>
                                        )}
                                </div>
                            </div>

                            <button onClick={() => trackGame(game.app_id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                Track Price
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {query.length >= 2 && !loading && results.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
            No games found in database. Try tracking a game first!
        </div>
    )}
        </div>

    )
}