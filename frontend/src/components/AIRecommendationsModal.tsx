import {useState} from 'react';
import {useAuth} from '../contexts/AuthContext.tsx';
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

interface Recommendation {
    title: string;
    rationale: string;
    genres: string;
}

interface AIResponse {
    reasoning: string;
    recommendations: Recommendation[];
    based_on_tracked_games: boolean;
    tracked_games_count: number;
}

interface AIRecommendationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIRecommendationsModal({isOpen, onClose}: AIRecommendationsModalProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    const {token, user} = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'auto' | 'custom'>('auto');
    const [customInput, setCustomInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getRecommendations = async () => {
        if (!token || !user) {
            navigate('/login');
            return;
        }
        if (mode === 'custom' && customInput.trim().length < 3) {
            toast.error('Please enter at least 3 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setAiResponse(null);

        try {
            const response = await fetch(`${API_URL}/ai-recommendations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_input: mode === 'custom' ? customInput : null
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get recommendations');
            }

            const data = await response.json();
            setAiResponse(data);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations';
            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    const searchGame = (gameName: string) => {
        onClose();
        navigate(`/search?q=${encodeURIComponent(gameName)}`)

    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                AI Game Recommendations
                            </h2>
                            <p className="text-blue-100 mt-1">Powered by GPT-4.1-nano</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setMode('auto')}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                    mode === 'auto'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    
                                }`}
                            >
                                Auto-Analyze my Games
                            </button>
                            <button
                                onClick={() => setMode('custom')}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                    mode === 'custom'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                Custom Request
                            </button>
                        </div>
                        {mode === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    What kind of games are you looking for?
                                </label>
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="e.g., games similar to Cyberpunk 2077 or indie roguelites with great music..."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={getRecommendations}
                        disabled={loading}
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-lg"></div>
                                Generating Recommendations...
                            </span>
                        ) : (
                            'Get Recommendations'
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg">
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {aiResponse && (
                        <div className="mt-6 space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    AI Reasoning
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">{aiResponse.reasoning}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {aiResponse.based_on_tracked_games
                                    ? `Based on your ${aiResponse.tracked_games_count} tracked games`
                                    : 'Based on your custom request'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Recommended Games
                                </h3>
                                <div className="space-y-4">
                                    {aiResponse.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                            >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {index + 1}. {rec.title}
                                                </h4>
                                                <button
                                                    onClick={() => searchGame(rec.title)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                                    Search & Track
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <span className="font-medium">Genres:</span> {rec.genres}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300">{rec.rationale}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}