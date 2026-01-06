import {useState} from "react";
import Navbar from "../components/Navbar.tsx";
import { GameSearch } from "../components/GameSearchBar.tsx";
import Footer from "../components/Footer.tsx";
import AIRecommendationsModal from "../components/AIRecommendationsModal.tsx";
export default function Search(){
    const [showAIModal, setShowAIModal] = useState(false);
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-pixel tracking-wider leading-none antialiased mb-4">Look for Games Here</h1>
                    <button onClick={() => setShowAIModal(true)}
                            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-lg inline-flex items-center gap-2">
                        AI Recommendations <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded">Beta</span>
                    </button>
                    </div>
                    <div className="mb-4 text-center">
                        <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded">In database</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">- indicates the game is in our database and has price history data</span>
                    </div>
                    <div className="mb-4 text-center">
                    <span className="px-2 py-1 justify-center text-xs text-blue-500 bg-blue-100 rounded">From Steam</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">- indicates the game is not in our database and has no price history data</span>
                    </div>
                    <div className="mb-4 text-center">
                        <p className="text-gray-600">Note: If a game is not in the database and you track the price, it will be added to the database and price history will be accumulated from then on.</p>
                    </div>
                    <GameSearch />
                </div>
            </main>
            <Footer />

            <AIRecommendationsModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        </div>
    );
}