import Navbar from "../components/Navbar.tsx";
import {Link} from "react-router-dom"
import Footer from "../components/Footer.tsx";
import PopularGamesCarousel from "../components/PopularGamesCarousel.tsx";
import AIRecommendationsButton from "../components/AIRecommendationsButton.tsx";
import Snowfall from "react-snowfall";
export default function Home(){
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <div className="fixed inset-0 pointer-events-none z-50">
                <Snowfall snowflakeCount={200} />
            </div>
            <Navbar />
            <main className="p-8 text-center">
                <AIRecommendationsButton />
                <h1 className="text-xl font-pixel tracking-wider leading-none antialiased mb-4">Welcome to SteamPriceTracker</h1>
                <p className="text-md mb-6 font-pixel tracking-wider leading-none antialiased">Track game prices from Steam and get notified about the best deals!</p>
                <Link to="/search">
            <button className="px-6 py-2 text-s font-pixel tracking-wider leading-tight antialiased rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                Start Tracking
            </button>
                </Link>
            </main>
            <PopularGamesCarousel />
            <Footer />
        </div>
    );
}