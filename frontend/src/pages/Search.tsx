import Navbar from "../components/Navbar.tsx";
import { GameSearch } from "../components/GameSearchBar.tsx";

export default function Search(){
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-darkblue text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold mb-8 text-center">Search & Track Games</h1>
                    <GameSearch />
                </div>
            </main>
        </div>
    );
}