import Navbar from "../components/Navbar.tsx";
import {Link} from "react-router-dom"

export default function Home(){
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="p-8 text-center">
                <h1 className="text-4xl font-extrabold mb-4">Welcome to SteamPriceTracker</h1>
                <p className="text-lg mb-6">Track game prices from Steam and get notified about the best deals!</p>
                <Link to="/search">
            <button className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                Start Tracking
            </button>
                </Link>
                <h1 className="text-4xl text-red-600 font-extrabold mb-4 mt-4">Website is currently under maintenance as it is still under development.
                Please come back later. :)</h1>
            </main>
        </div>
    );
}