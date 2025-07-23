import {Sun, Moon} from "lucide-react";
import {useTheme} from "../contexts/ThemeContext.tsx";
import { Link } from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext.tsx";
import UserProfile from "./UserProfile.tsx";

const Navbar = () => {
  const {darkMode, setDarkMode} = useTheme();
  const {user, loading} = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-darkblue shadow-md">
        <Link to="/">
      <button className="text-xl font-bold text-black dark:text-white dark:bg-darkblue bg-white">
        SteamPriceTracker
         <span className="px-2 py-1 text-xs ml-2 text-white bg-orange-500 rounded align-super">Alpha</span>
      </button>
        </Link>
      <div className="flex gap-4 items-center">
        <Link
          to="/"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Home
        </Link>
        {!loading && (
            user ? (
                <>
                    <Link to="/search"
                          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                        Search
                    </Link>
                    <Link to="/dashboard"
                          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                        Dashboard
                    </Link>
                <UserProfile />
                </>
            ) : (
                <>
        <Link
          to="/login"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
        >
          Register
        </Link>
            </>
          )
          )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
        >
          {darkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
        </button>
      </div>
    </nav>
  )
}

export default Navbar