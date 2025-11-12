import {useState, useEffect} from 'react';

interface PopularGame {
    app_id: number;
    name: string;
    current_price: number;
    original_price: number;
    discount_percent: number;
    currency: string;
    header_image: string;
    is_free: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function PopularGamesCarousel() {
    const [games, setGames] = useState<PopularGame[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                const response = await fetch(`${API_URL}/popular-games?limit=10`);
                const data = await response.json();
                console.log("API Response:", data);  // DEBUG
                console.log("First game price:", data.games[0]?.current_price);
                setGames(data.games);
            } catch (error) {
                console.error("Failed to fetch popular games:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPopularGames();
    }, []);

    useEffect(() => {
        if (games.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % games.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [games.length]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full">

                </div>
            </div>
        );

    }

    if (games.length === 0) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto py-12 px-4">
            <h3 className="text-lg text-center text-red-600 dark:text-red-400">
                Note: Prices on the front page may be wrong due to Steam maintenance, especially on Tuesdays.
            </h3>
            <h3 className="text-lg text-center mb-8 text-blue-600 dark:text-blue-400">
                Prices when searching should have the correct price.
            </h3>
            {/* Carousel Part */}
            <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-2xl">
                {games.map((game, index) => (
                    <div
                        key={game.app_id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            index === currentIndex
                            ? 'translate-x-0 opacity-100 scale-100'
                                : index < currentIndex
                            ? '-translate-x-full opacity-0 scale-95'
                                : 'translate-x-full opacity-0 scale-95'
                        }`}
                    >
                        <div className="relative h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-20 blur-md scale-110"
                                style={{
                                    backgroundImage: `url(${game.header_image})`
                                }}
                            />
                            <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-white">
                                    <img
                                        src={game.header_image}
                                        alt={game.name}
                                        className="w-full max-w-xl rounded-lg shadow-2xl mb-6 border-4 border-white/10"
                                        />
                                    <h3 className="text-3xl font-bold mb-3 text-center drop-shadow-2xl">
                                        {game.name}
                                    </h3>
                                    <div className="flex items-center gap-4 mb-3">
                                        {game.is_free ? (
                                            <span className="text-2xl font-bold text-green-400">
                                                Free to Play
                                            </span>
                                        ) : game.discount_percent > 0 ? (
                                            <>
                                            <span className="text-gray-400 line-through text-xl">
                                                ${game.original_price.toFixed(2)}
                                            </span>
                                                <span className="text-2xl font-bold text-green-400">
                                                    ${game.current_price.toFixed(2)}
                                                </span>
                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xl font-bold animate-pulse">
                                                -{game.discount_percent}%
                                            </span>
                                            </>
                                        ) : (
                                            <span className="text-2xl font-bold">
                                                ${game.current_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                        <span className="text-lg font-semibold">
                                            Top Seller
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                ))}
            </div>
            <div className="flex justify-center gap-3 mt-8">
                {games.map((_, index) => (
                    <button
                        key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all rounded-full ${
                        index === currentIndex
                        ? 'bg-blue-600 w-12 h-4'
                            :
                            'bg-gray-400 dark:bg-gray-600 w-4 h-4 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to Slide ${index + 1}`}
                    />
                ))}
            </div>

            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-lg"
                aria-label="Previous Game"
                >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % games.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-lg"
                aria-label="Next game"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}