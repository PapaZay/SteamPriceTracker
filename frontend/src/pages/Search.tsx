import Navbar from "../components/Navbar.tsx";
import { GameSearch } from "../components/GameSearchBar.tsx";
import Footer from "../components/Footer.tsx";
export default function Search(){
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold mb-8 text-center">Search & Track Games</h1>
                    <div className="mb-4 text-center">
                        <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded">In database</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">- indicates the game is in our database and has price history data</span>
                    </div>
                    <div className="mb-4 text-center">
                    <span className="px-2 py-1 justify-center text-xs text-blue-500 bg-blue-100 rounded">From Steam</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">- indicates the game is not in our database and has no price history data</span>
                    </div>
                    <div className="mb-4 text-center">
                        <p className="text-gray-600">Note: If a game is not in the database and you track the price, it will be added to the database and price history will be accumulated.</p>
                    </div>
                    <GameSearch />
                </div>
            </main>
            <Footer />
        </div>
    );
}